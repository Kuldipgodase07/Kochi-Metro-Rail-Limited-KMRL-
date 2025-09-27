import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const atlasUri =
  "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const clearAllAtlasData = async () => {
  try {
    console.log("🧹 Clearing ALL data from MongoDB Atlas...");
    console.log("==========================================");

    console.log("📡 Connecting to MongoDB Atlas...");
    await mongoose.connect(atlasUri);
    console.log("✅ Connected to MongoDB Atlas!");

    const db = mongoose.connection.db;

    console.log("\n🗑️  Clearing ALL collections...");

    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections to clear`);

    let totalCleared = 0;
    const clearedCollections = [];

    for (const collection of collections) {
      const collectionName = collection.name;
      try {
        const count = await db.collection(collectionName).countDocuments();
        if (count > 0) {
          await db.collection(collectionName).deleteMany({});
          console.log(`✅ Cleared ${count} records from ${collectionName}`);
          totalCleared += count;
          clearedCollections.push(collectionName);
        } else {
          console.log(`ℹ️  ${collectionName} was already empty`);
        }
      } catch (error) {
        console.log(`❌ Error clearing ${collectionName}: ${error.message}`);
      }
    }

    console.log("\n📊 Complete Cleanup Summary:");
    console.log("============================");
    console.log(`🗑️  Total records cleared: ${totalCleared}`);
    console.log(`📋 Collections cleared: ${clearedCollections.length}`);
    console.log(`📝 Collections: ${clearedCollections.join(", ")}`);

    console.log("\n🎉 ALL data cleared from MongoDB Atlas!");
    console.log("💡 Database is now completely empty");
    console.log("🔧 Run seed scripts to populate fresh data if needed");
  } catch (error) {
    console.error("❌ Error clearing Atlas data:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

clearAllAtlasData();
