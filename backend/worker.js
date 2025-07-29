const { Worker } = require("bullmq");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
const Redis = require("ioredis");
const redis = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null, // must be explicitly set here (required for BullMQ)
});

const galleryQueue = new Worker(
  "gallery",
  async (job) => {
    const article = job.data;
    article.createdAt = new Date();
    article.publishedAt = new Date(article.publishedAt);

    await mongoClient.connect();
    const contentDb = mongoClient.db("content");
    const gallery = contentDb.collection("gallery");

    try {
      const deleteResult = await gallery.deleteOne({
        publishedAt: article.publishedAt,
      });
      if (deleteResult.deletedCount > 0) {
        console.log(
          `Deleted existing article with same publishedAt: ${article.publishedAt}`
        );
      }

      await gallery.insertOne(article);
      console.log(
        `Inserted article into gallery: ${article.seed} - published: ${article.publishedAt}`
      );

      const count = await gallery.countDocuments();
      if (count > 200) {
        const oldest = await gallery
          .find()
          .sort({ publishedAt: 1 })
          .limit(1)
          .toArray();
        if (oldest.length && !oldest[0]._id.equals(article._id)) {
          await gallery.deleteOne({ _id: oldest[0]._id });
          console.log(
            `Trimmed oldest gallery article: ${oldest[0]._id} - published: ${oldest[0].publishedAt}`
          );
        }
      } else {
        console.log(`Gallery count is within limit: ${count}`);
      }
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error
        console.warn(
          `Duplicate publishedAt detected: ${article.publishedAt}. Skipping insert.`
        );
      } else {
        console.error("Unexpected error:", error);
        throw error;
      }
    }
  },
  { connection: redis }
);

process.on("SIGINT", async () => {
  console.log("Worker shutting down...");
  await mongoClient.close();
  await galleryQueue.close();
  process.exit();
});
