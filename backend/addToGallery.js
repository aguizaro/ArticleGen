const { MongoClient } = require("mongodb");

(async () => {
  const mongoClient = new MongoClient(process.env.MONGO_URI);
  try {
    await mongoClient.connect();
    const adminDb = mongoClient.db("admin");
    const contentDb = mongoClient.db("content");

    const seeds = adminDb.collection("seeds");
    const gallery = contentDb.collection("gallery");

    const article = JSON.parse(process.argv[2]); // passed via CLI args
    article.createdAt = new Date();

    await gallery.insertOne(article);
    console.log("Inserted into gallery:", article.seed);

    const count = await gallery.countDocuments();
    if (count > 200) {
      const oldest = await gallery.find().sort({ publishedAt: 1 }).limit(1).toArray();
      if (oldest.length && !oldest[0]._id.equals(article._id)) {
        await gallery.deleteOne({ _id: oldest[0]._id });
        console.log("Trimmed oldest gallery item:", oldest[0]._id);
      }
    }
  } catch (err) {
    console.error("Gallery insert error:", err.message);
  } finally {
    await mongoClient.close();
  }
})();
