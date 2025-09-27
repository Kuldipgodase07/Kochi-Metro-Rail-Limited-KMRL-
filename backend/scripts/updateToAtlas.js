import dotenv from "dotenv";
import connectDB from "../config/database.js";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

const updateToAtlas = async () => {
  try {
    console.log("🔄 Updating to MongoDB Atlas...");
    console.log("===============================");

    // Set the Atlas connection string
    const atlasUri =
      "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    // Override the MONGODB_URI for this session
    process.env.MONGODB_URI = atlasUri;

    console.log("📡 Connecting to MongoDB Atlas...");

    // Connect to Atlas
    const conn = await mongoose.connect(atlasUri);

    console.log("✅ Connected to MongoDB Atlas!");
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);

    // Get database connection
    const db = mongoose.connection.db;

    // Check current collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📋 Current collections: ${collections.length}`);

    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   • ${collection.name}: ${count} documents`);
    }

    // Check if we need to migrate data
    const hasUsers = await db.collection("users").countDocuments();

    if (hasUsers > 0) {
      console.log(`\n👥 Found ${hasUsers} users in Atlas database`);
      console.log("✅ User data already exists in Atlas");
    } else {
      console.log("\n📝 No users found in Atlas database");
      console.log("💡 You may need to run seed scripts to populate data");
    }

    console.log("\n🎉 Atlas connection established successfully!");
    console.log("\n💡 Next steps:");
    console.log("   1. Update your .env file with the Atlas connection string");
    console.log("   2. Run seed scripts if needed: npm run seed");
    console.log("   3. Start your application: npm run dev");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB Atlas:", error.message);
    console.log("\n🔍 Common issues:");
    console.log("   • IP address not whitelisted in Atlas");
    console.log("   • Incorrect connection string");
    console.log("   • Network connectivity issues");
    console.log("   • Atlas cluster not running");
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

// Run the script
updateToAtlas();
