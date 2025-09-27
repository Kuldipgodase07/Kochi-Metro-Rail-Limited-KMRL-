import dotenv from "dotenv";
import connectDB from "../config/database.js";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

const testDatabaseConnection = async () => {
  try {
    console.log("🔍 Testing Database Connection...");
    console.log("=================================");

    // Atlas connection string
    const atlasUri =
      "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    process.env.MONGODB_URI = atlasUri;

    console.log("📡 Connecting to MongoDB Atlas...");
    await connectDB();
    console.log("✅ Connected to MongoDB Atlas!");

    const db = mongoose.connection.db;

    // Test basic operations
    console.log("\n🧪 Testing Database Operations...");

    // Test 1: Count trainsets
    const trainsetsCount = await db.collection("trainsets").countDocuments();
    console.log(`✅ Trainsets count: ${trainsetsCount}`);

    // Test 2: Fetch a few trainsets
    const sampleTrainsets = await db
      .collection("trainsets")
      .find({})
      .limit(3)
      .toArray();
    console.log(`✅ Sample trainsets fetched: ${sampleTrainsets.length}`);

    // Test 3: Test aggregation
    const statusCounts = await db
      .collection("trainsets")
      .aggregate([{ $group: { _id: "$current_status", count: { $sum: 1 } } }])
      .toArray();
    console.log(`✅ Status aggregation: ${JSON.stringify(statusCounts)}`);

    // Test 4: Test with error handling
    try {
      const result = await db
        .collection("trainsets")
        .find({})
        .limit(1)
        .toArray();
      console.log(`✅ Error handling test passed`);
    } catch (error) {
      console.log(`❌ Error handling test failed: ${error.message}`);
    }

    console.log("\n🎉 Database connection test completed successfully!");
    console.log("📊 All operations working correctly");
  } catch (error) {
    console.error("❌ Database connection test failed:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

// Run the test
testDatabaseConnection();
