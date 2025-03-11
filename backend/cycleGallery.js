const { MongoClient } = require("mongodb"); // mongodb v2 only uses commonjs modules - do not import with ES6 syntax
const mongoClient = new MongoClient(process.env.MONGO_URI, {
  useUnifiedTopology: true,
});
const DB_LIMIT = 120;

mongoClient.on("connectionClosed", () => console.log("DB CONNECTION CLOSED"));
mongoClient.on("connectionCreated", () => console.log("DB CONNECTION CREATED"));
mongoClient.on("close", () => console.log("db connection closed"));
mongoClient.on("open", () => console.log("db connection oppened"));
mongoClient.on("error", (e) => console.log("db error: " + e.message));

async function updateGallery() {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("admin");
    const seedsCollection = db.collection("seeds");
    const galleryCollection = db.collection("gallery");

    // Find a new article that is not already in the gallery
    const newArticle = await seedsCollection.findOne({
      _id: { $nin: await galleryCollection.distinct("_id") },
    });

    if (!newArticle) {
      console.log("No articles found.");
      return;
    }

    // Insert the new article into the gallery
    await galleryCollection.insertOne(newArticle);
    console.log("Inserted article:", newArticle._id);

    // Remove the oldest article if gallery exceeds 120 articles
    const count = await galleryCollection.countDocuments();
    if (count > DB_LIMIT) {
      const oldestArticle = await galleryCollection
        .find()
        .sort({ publishedAt: 1 })
        .limit(1)
        .toArray();

      if (oldestArticle.length > 0) {
        await galleryCollection.deleteOne({ _id: oldestArticle[0]._id });
        console.log("Removed article:", oldestArticle[0]._id);
      }
    }
  } catch (error) {
    console.error("Error updating gallery:", error);
  } finally {
    await mongoClient.close();
  }
}

updateGallery();
