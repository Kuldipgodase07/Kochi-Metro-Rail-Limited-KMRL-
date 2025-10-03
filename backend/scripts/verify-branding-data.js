import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import models
import BrandingCampaign from "../models/BrandingCampaign.js";
import Trainset from "../models/Trainset.js";

// Database connection
const connectDB = async () => {
  try {
    const atlasUri =
      "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    console.log("📡 Connecting to MongoDB Atlas...");
    const conn = await mongoose.connect(atlasUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

// Verification function
const verifyBrandingData = async () => {
  try {
    await connectDB();

    console.log("\n🔍 Verifying Branding Campaigns Data...\n");

    // Check total count
    const totalCampaigns = await BrandingCampaign.countDocuments();
    console.log(`📊 Total Branding Campaigns: ${totalCampaigns}`);

    if (totalCampaigns === 0) {
      console.log("❌ No branding campaigns found in database!");
      return;
    }

    // Get sample records
    const sampleCampaigns = await BrandingCampaign.find()
      .limit(5)
      .populate("trainset_id", "trainset_id");
    console.log("\n📋 Sample Branding Campaigns:");
    sampleCampaigns.forEach((campaign, index) => {
      console.log(
        `${index + 1}. ${campaign.advertiser} - ${campaign.campaign_name}`
      );
      console.log(`   Trainset: ${campaign.trainset_id?.trainset_id || "N/A"}`);
      console.log(`   Status: ${campaign.status}`);
      console.log(
        `   Target: ${campaign.exposure_target}h, Achieved: ${campaign.actual_exposure}h`
      );
      console.log(
        `   Dates: ${campaign.start_date?.toDateString()} to ${campaign.end_date?.toDateString()}`
      );
      console.log("");
    });

    // Status breakdown
    const statusCounts = await BrandingCampaign.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    console.log("📈 Status Breakdown:");
    statusCounts.forEach((status) => {
      console.log(`   ${status._id}: ${status.count} campaigns`);
    });

    // Advertiser breakdown
    const advertiserCounts = await BrandingCampaign.aggregate([
      { $group: { _id: "$advertiser", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log("\n🏢 Advertiser Breakdown:");
    advertiserCounts.forEach((advertiser) => {
      console.log(`   ${advertiser._id}: ${advertiser.count} campaigns`);
    });

    // Check if trainsets exist
    const totalTrainsets = await Trainset.countDocuments();
    console.log(`\n🚆 Total Trainsets in database: ${totalTrainsets}`);

    if (totalTrainsets === 0) {
      console.log(
        "⚠️  No trainsets found! This might be why branding campaigns aren't showing properly."
      );
    }
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
};

// Run verification
verifyBrandingData();

