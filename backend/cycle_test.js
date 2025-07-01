const { MongoClient } = require("mongodb");
const mongoClient = new MongoClient(process.env.MONGO_URI);
const DB_LIMIT = 200;
const SEED_POOL_SIZE = 50;

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

    // publishedAt values already used in gallery
    const galleryDates = await galleryCollection.distinct("publishedAt");

    // most recent articles from seeds
    const recentSeeds = await seedsCollection
      .find({ publishedAt: { $exists: true } })
      .sort({ publishedAt: -1 })
      .limit(SEED_POOL_SIZE)
      .toArray();

    // filter out any article that has a duplicate publishedAt
    const candidateArticles = recentSeeds.filter(seed => {
      return !galleryDates.some(galDate => galDate.getTime() === seed.publishedAt.getTime());
    });

    if (candidateArticles.length === 0) {
      console.log("No unique articles to insert (based on publishedAt).");
      return;
    }

    // random article from the filtered pool
    const newArticle = candidateArticles[Math.floor(Math.random() * candidateArticles.length)];

    // insert article into gallery
    await galleryCollection.insertOne(newArticle);
    console.log("Inserted article:", newArticle._id, "publishedAt:", newArticle.publishedAt);

    // remove oldest articles until count <= DB_LIMIT
    let count = await galleryCollection.countDocuments();

    while (count > DB_LIMIT) {
      const oldest = await galleryCollection
        .find()
        .sort({ publishedAt: 1 })
        .limit(1)
        .toArray();

      if (oldest.length === 0) {
        break; // no articles left to delete
      }

      // avoid removing inserted article in case publishedAt duplicates
      if (oldest[0]._id.equals(newArticle._id)) {
        console.log("Oldest article is the newly inserted one, skipping removal.");
        break;
      }

      await galleryCollection.deleteOne({ _id: oldest[0]._id });
      console.log("Removed article:", oldest[0]._id, "publishedAt:", oldest[0].publishedAt);

      count = await galleryCollection.countDocuments();
    }
  } catch (err) {
    console.error("Error updating gallery:", err);
  } finally {
    await mongoClient.close();
  }
}

updateGallery();
