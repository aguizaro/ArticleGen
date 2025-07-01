const { MongoClient } = require("mongodb");
const mongoClient = new MongoClient(process.env.MONGO_URI);

async function dedupeGallery() {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("content");
    const gallery = db.collection("gallery");

    console.log("Looking for duplicate publishedAt values...");

    // Group by publishedAt and collect _ids
    const duplicates = await gallery.aggregate([
      {
        $group: {
          _id: "$publishedAt",
          ids: { $push: "$_id" },
          count: { $sum: 1 },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
    ]).toArray();

    if (duplicates.length === 0) {
      console.log("No duplicate articles found.");
      return;
    }

    let totalRemoved = 0;

    for (const dup of duplicates) {
      // Keep the first _id, remove the rest
      const [keepId, ...removeIds] = dup.ids;

      const result = await gallery.deleteMany({ _id: { $in: removeIds } });
      totalRemoved += result.deletedCount;
      console.log(`Removed ${result.deletedCount} duplicate(s) for publishedAt: ${dup._id}`);
    }

    console.log(`Finished. Total duplicates removed: ${totalRemoved}`);
  } catch (error) {
    console.error("Error during deduplication:", error);
  } finally {
    await mongoClient.close();
  }
}

dedupeGallery();
