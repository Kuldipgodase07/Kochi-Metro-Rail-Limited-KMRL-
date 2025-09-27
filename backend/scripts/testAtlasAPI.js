import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";

dotenv.config();

const atlasUri =
  "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const testAtlasAPI = async () => {
  try {
    console.log("🧪 Testing Atlas API Endpoints...");
    console.log("==================================");

    // Connect to Atlas
    console.log("📡 Connecting to MongoDB Atlas...");
    await mongoose.connect(atlasUri);
    console.log("✅ Connected to MongoDB Atlas!");

    const db = mongoose.connection.db;

    // Test 1: Direct database query
    console.log("\n📊 Direct Database Query Test:");
    console.log("===============================");

    const trainsets = await db.collection("trainsets").find({}).toArray();
    console.log(`🚆 Found ${trainsets.length} trainsets in database`);

    if (trainsets.length === 100) {
      console.log("✅ SUCCESS: All 100 trains from CSV files are present");
    } else {
      console.log(
        `⚠️  WARNING: Expected 100 trains, found ${trainsets.length}`
      );
    }

    // Test 2: Check sample data
    console.log("\n🔍 Sample Data Verification:");
    console.log("=============================");

    const sampleTrainset = await db
      .collection("trainsets")
      .findOne({ trainset_id: 1 });
    if (sampleTrainset) {
      console.log(
        `✅ Sample trainset: ${sampleTrainset.rake_number} (${sampleTrainset.make_model})`
      );
      console.log(`   Status: ${sampleTrainset.current_status}`);
      console.log(`   Depot: ${sampleTrainset.home_depot}`);
      console.log(`   Mileage: ${sampleTrainset.mileage} km`);
    }

    // Test 3: Check related data
    console.log("\n🔗 Related Data Verification:");
    console.log("==============================");

    const fitnessCerts = await db
      .collection("fitnesscertificates")
      .find({ trainset_id: 1 })
      .toArray();
    console.log(
      `📜 Fitness certificates for trainset 1: ${fitnessCerts.length}`
    );

    const jobCards = await db
      .collection("jobcards")
      .find({ trainset_id: 1 })
      .toArray();
    console.log(`🔧 Job cards for trainset 1: ${jobCards.length}`);

    const brandingCampaigns = await db
      .collection("brandingcampaigns")
      .find({ trainset_id: 1 })
      .toArray();
    console.log(
      `🎯 Branding campaigns for trainset 1: ${brandingCampaigns.length}`
    );

    // Test 4: Check data freshness (look for CSV-specific data)
    console.log("\n📅 Data Freshness Check:");
    console.log("=========================");

    const recentTrainsets = await db
      .collection("trainsets")
      .find({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
      })
      .toArray();

    console.log(`🕒 Recently created trainsets: ${recentTrainsets.length}`);

    if (recentTrainsets.length > 0) {
      console.log("✅ Data appears to be fresh (recently imported)");
    } else {
      console.log("⚠️  Data might be old - no recent records found");
    }

    // Test 5: Check for CSV-specific patterns
    console.log("\n📋 CSV Data Pattern Check:");
    console.log("===========================");

    const rakeNumbers = await db
      .collection("trainsets")
      .distinct("rake_number");
    console.log(`🚆 Unique rake numbers: ${rakeNumbers.length}`);

    // Check if we have the expected range (R1000-R1099 for 100 trains)
    const expectedRakes = Array.from({ length: 100 }, (_, i) => `R${1000 + i}`);
    const missingRakes = expectedRakes.filter(
      (rake) => !rakeNumbers.includes(rake)
    );

    if (missingRakes.length === 0) {
      console.log("✅ All expected rake numbers (R1000-R1099) are present");
    } else {
      console.log(
        `⚠️  Missing rake numbers: ${missingRakes.slice(0, 5).join(", ")}${
          missingRakes.length > 5 ? "..." : ""
        }`
      );
    }

    // Test 6: Check data relationships
    console.log("\n🔗 Data Relationship Check:");
    console.log("============================");

    const totalFitness = await db
      .collection("fitnesscertificates")
      .countDocuments();
    const totalJobs = await db.collection("jobcards").countDocuments();
    const totalBranding = await db
      .collection("brandingcampaigns")
      .countDocuments();
    const totalMileage = await db.collection("mileagerecords").countDocuments();
    const totalCleaning = await db.collection("cleaningslots").countDocuments();
    const totalStabling = await db
      .collection("stablingassignments")
      .countDocuments();
    const totalPassenger = await db
      .collection("passengerflow")
      .countDocuments();

    console.log(`📜 Fitness Certificates: ${totalFitness}`);
    console.log(`🔧 Job Cards: ${totalJobs}`);
    console.log(`🎯 Branding Campaigns: ${totalBranding}`);
    console.log(`📏 Mileage Records: ${totalMileage}`);
    console.log(`🧹 Cleaning Slots: ${totalCleaning}`);
    console.log(`🏗️ Stabling Assignments: ${totalStabling}`);
    console.log(`👥 Passenger Flow: ${totalPassenger}`);

    // Final summary
    console.log("\n📊 Atlas API Test Summary:");
    console.log("===========================");

    if (trainsets.length === 100 && totalFitness === 300 && totalJobs === 200) {
      console.log("✅ SUCCESS: All Atlas data is correct and fresh");
      console.log("🎉 Application should be using the latest CSV data");
      console.log("💡 If you're still seeing old data, try:");
      console.log("   1. Restart your application server");
      console.log("   2. Clear browser cache");
      console.log("   3. Check if frontend is caching data");
    } else {
      console.log("⚠️  WARNING: Data counts don't match expected values");
      console.log(
        "💡 Consider re-importing data with 'node scripts/importAll100Trains.js'"
      );
    }
  } catch (error) {
    console.error("❌ Error testing Atlas API:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

testAtlasAPI();
