import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import models
import BrandingCampaign from "../models/BrandingCampaign.js";

// Database connection
const connectDB = async () => {
  try {
    const atlasUri =
      "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    console.log("📡 Connecting to MongoDB Atlas...");
    const conn = await mongoose.connect(atlasUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

// Show Atlas location and sample data
const showAtlasLocation = async () => {
  try {
    const conn = await connectDB();

    console.log("\n📍 MongoDB Atlas Location Information:");
    console.log("=".repeat(50));
    console.log(`🌐 Cluster: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`📋 Collection: brandingcampaigns`);
    console.log("=".repeat(50));

    // Get collection info
    const collection = mongoose.connection.db.collection("brandingcampaigns");
    const count = await collection.countDocuments();

    console.log(`\n📊 Collection Statistics:`);
    console.log(`Total Documents: ${count}`);

    // Get a sample document
    const sampleDoc = await collection.findOne();
    if (sampleDoc) {
      console.log("\n📄 Sample Document Structure:");
      console.log(JSON.stringify(sampleDoc, null, 2));
    }

    // Show how to query in Atlas
    console.log("\n🔍 How to find this data in MongoDB Atlas:");
    console.log("1. Go to your MongoDB Atlas dashboard");
    console.log("2. Click on 'Browse Collections'");
    console.log("3. Select database: 'test'");
    console.log("4. Select collection: 'brandingcampaigns'");
    console.log("5. You should see 100 documents");

    console.log("\n📝 Sample MongoDB Query:");
    console.log("db.brandingcampaigns.find().limit(5)");

    console.log("\n📝 Count Query:");
    console.log("db.brandingcampaigns.countDocuments()");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
};

// Run the script
showAtlasLocation();

