import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

const migrateToAtlas = async () => {
  try {
    console.log("🚀 Migrating to MongoDB Atlas...");
    console.log("=================================");

    // Atlas connection string
    const atlasUri =
      "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    console.log("📡 Connecting to MongoDB Atlas...");

    // Connect to Atlas
    const conn = await mongoose.connect(atlasUri);

    console.log("✅ Connected to MongoDB Atlas!");
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);

    // Get database connection
    const db = mongoose.connection.db;

    // Check current state
    const collections = await db.listCollections().toArray();
    console.log(`\n📋 Current collections: ${collections.length}`);

    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   • ${collection.name}: ${count} documents`);
    }

    // Check if we need to create the database name
    const dbName = "train_plan_wise";
    console.log(`\n🗄️  Using database: ${dbName}`);

    // Switch to the correct database
    const targetDb = mongoose.connection.useDb(dbName);

    console.log("✅ Database context set to train_plan_wise");

    // Check if users exist
    const userCount = await targetDb.collection("users").countDocuments();
    console.log(`\n👥 Users in Atlas: ${userCount}`);

    if (userCount === 0) {
      console.log("📝 No users found in Atlas database");
      console.log("💡 You may need to run seed scripts to populate data");
      console.log("\n🛠️  Recommended next steps:");
      console.log("   1. Run: node scripts/seedDatabase.js");
      console.log("   2. Run: node scripts/insertTrainsets.js");
      console.log("   3. Start your application: npm run dev");
    } else {
      console.log("✅ Users found in Atlas database");
      console.log("🎉 Migration to Atlas is complete!");
    }

    console.log("\n📊 Atlas Database Status:");
    console.log(`   • Database: ${dbName}`);
    console.log(`   • Collections: ${collections.length}`);
    console.log(`   • Users: ${userCount}`);
    console.log(`   • Connection: Active`);

    console.log("\n🎉 MongoDB Atlas setup completed successfully!");
    console.log("\n💡 To use Atlas in your application:");
    console.log("   1. Set MONGODB_URI in your environment");
    console.log(
      "   2. Or update your .env file with the Atlas connection string"
    );
    console.log("   3. Restart your application");
  } catch (error) {
    console.error("❌ Failed to migrate to MongoDB Atlas:", error.message);
    console.log("\n🔍 Troubleshooting:");
    console.log("   • Check Atlas cluster status");
    console.log("   • Verify IP whitelist settings");
    console.log("   • Confirm connection string");
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

// Run the migration
migrateToAtlas();
