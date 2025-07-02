const { MongoClient } = require("mongodb");
const mongoClient = new MongoClient(process.env.MONGO_URI);
const DB_LIMIT = 200;
const SEED_POOL_SIZE = 100;
const MAX_ATTEMPTS = 1;

mongoClient.on("connectionClosed", () => console.log("DB CONNECTION CLOSED"));
mongoClient.on("connectionCreated", () => console.log("DB CONNECTION CREATED"));
mongoClient.on("close", () => console.log("db connection closed"));
mongoClient.on("open", () => console.log("db connection opened"));
mongoClient.on("error", (e) => console.log("db error: " + e.message));

async function updateGallery() {
  try {
    await mongoClient.connect();

    const adminDb = mongoClient.db("admin");
    const contentDb = mongoClient.db("content");

    const seedsCollection = adminDb.collection("seeds");
    const galleryCollection = contentDb.collection("gallery");

    const recentSeeds = await seedsCollection
      .find({ publishedAt: { $exists: true } })
      .sort({ publishedAt: -1 })
      .limit(SEED_POOL_SIZE)
      .toArray();

    if (recentSeeds.length === 0) {
      console.log("No articles available to insert.");
      return;
    }

    let attempts = 0;
    let inserted = false;

    while (attempts <= MAX_ATTEMPTS && !inserted) {
      attempts++;
      // random article
      const newArticle = recentSeeds[Math.floor(Math.random() * recentSeeds.length)];

      try {
        await galleryCollection.insertOne(newArticle);
        console.log("Inserted article:", newArticle._id, "publishedAt:", newArticle.publishedAt);
        inserted = true;

        // rm oldest articles until at or below DB_LIMIT
        let count = await galleryCollection.countDocuments();

        while (count > DB_LIMIT) {
          const oldest = await galleryCollection
            .find()
            .sort({ publishedAt: 1 })
            .limit(1)
            .toArray();

          if (oldest.length === 0) break;

          if (oldest[0]._id.equals(newArticle._id)) {
            console.log("Oldest article is the newly inserted one, skipping removal.");
            break;
          }

          await galleryCollection.deleteOne({ _id: oldest[0]._id });
          console.log("Removed article:", oldest[0]._id, "publishedAt:", oldest[0].publishedAt);

          count = await galleryCollection.countDocuments();
        }
      } catch (insertErr) {
        if (insertErr.code === 11000) {
          console.log(`Attempt ${attempts}: Duplicate publishedAt, retrying...`);
        } else {
          throw insertErr;
        }
      }
    }

    if (!inserted) {
      console.log(`Failed to insert a unique article after ${MAX_ATTEMPTS} attempts.`);
    }
  } catch (err) {
    console.error("Error updating gallery:", err);
  } finally {
    await mongoClient.close();
  }
}

updateGallery();
