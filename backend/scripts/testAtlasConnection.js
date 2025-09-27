import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

const testAtlasConnection = async () => {
  try {
    console.log("🔗 Testing MongoDB Atlas Connection...");
    console.log("=====================================");

    // Use the provided Atlas connection string
    const atlasUri =
      "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    console.log("📡 Connecting to MongoDB Atlas...");
    console.log("🌐 Cluster: cluster0.byx6m0c.mongodb.net");
    console.log("👤 User: shivrajmore8215898");

    // Connect to Atlas
    const conn = await mongoose.connect(atlasUri);

    console.log("✅ MongoDB Atlas Connected Successfully!");
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`🔗 Connection State: ${conn.connection.readyState}`);

    // Test database operations
    console.log("\n🧪 Testing Database Operations...");

    // List collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections in database`);

    if (collections.length > 0) {
      console.log("📝 Collections:");
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`   • ${collection.name}: ${count} documents`);
      }
    }

    // Test a simple operation
    const testCollection = db.collection("connection_test");
    await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
      message: "Atlas connection test successful",
    });

    const testDoc = await testCollection.findOne({ test: true });
    console.log("✅ Test document created and retrieved successfully");

    // Clean up test document
    await testCollection.deleteOne({ test: true });
    console.log("🧹 Test document cleaned up");

    console.log("\n🎉 MongoDB Atlas connection test completed successfully!");
    console.log("💡 You can now use this connection for your application");
  } catch (error) {
    console.error("❌ MongoDB Atlas connection failed:", error.message);
    console.log("\n🔍 Troubleshooting tips:");
    console.log("   • Check if your IP address is whitelisted in Atlas");
    console.log("   • Verify the connection string is correct");
    console.log("   • Ensure the database user has proper permissions");
    console.log("   • Check if the cluster is running");
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

// Run the test
testAtlasConnection();
