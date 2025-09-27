import dotenv from "dotenv";
import connectDB from "../config/database.js";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

const checkAtlasStatus = async () => {
  try {
    console.log("📊 MongoDB Atlas Status Check");
    console.log("=============================");

    // Atlas connection string
    const atlasUri =
      "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    console.log("📡 Connecting to MongoDB Atlas...");

    // Connect to Atlas
    const conn = await mongoose.connect(atlasUri);

    console.log("✅ MongoDB Atlas Connected Successfully!");
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`🔗 Connection State: ${conn.connection.readyState}`);

    // Get database connection
    const db = mongoose.connection.db;

    // Check collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📋 Collections: ${collections.length}`);

    let totalDocuments = 0;
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      totalDocuments += count;
      const status = count > 0 ? "✅ Has data" : "ℹ️  Empty";
      console.log(`   • ${collection.name}: ${count} documents (${status})`);
    }

    // Check specific collections for KMRL app
    const kmrlCollections = [
      "users",
      "trainsets",
      "jobcards",
      "brandingcampaigns",
    ];
    console.log("\n🚆 KMRL Application Collections:");

    for (const collectionName of kmrlCollections) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        const status = count > 0 ? "✅ Ready" : "⚠️  Empty";
        console.log(`   • ${collectionName}: ${count} documents (${status})`);
      } catch (error) {
        console.log(`   • ${collectionName}: Not found`);
      }
    }

    // Overall status
    console.log("\n📊 Atlas Database Summary:");
    console.log(`   🌐 Cluster: cluster0.byx6m0c.mongodb.net`);
    console.log(`   👤 User: shivrajmore8215898`);
    console.log(`   🗄️  Database: ${conn.connection.name}`);
    console.log(`   📋 Collections: ${collections.length}`);
    console.log(`   📄 Total Documents: ${totalDocuments}`);
    console.log(`   🔗 Connection: Active`);

    // Recommendations
    console.log("\n💡 Recommendations:");
    if (totalDocuments === 0) {
      console.log("   • Run seed scripts to populate data");
      console.log("   • Execute: node scripts/seedAtlasDatabase.js");
    } else {
      console.log("   • Database is ready for use");
      console.log("   • Start your application: npm run dev");
    }

    console.log("\n🎉 Atlas status check completed!");
  } catch (error) {
    console.error("❌ Atlas connection failed:", error.message);
    console.log("\n🔍 Troubleshooting:");
    console.log("   • Check internet connection");
    console.log("   • Verify Atlas cluster is running");
    console.log("   • Check IP whitelist in Atlas");
    console.log("   • Confirm connection string");
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

// Run the status check
checkAtlasStatus();
