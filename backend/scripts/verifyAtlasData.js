import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const atlasUri =
  "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const verifyAtlasData = async () => {
  try {
    console.log("🔍 Verifying Atlas Data Usage...");
    console.log("=================================");

    console.log("📡 Connecting to MongoDB Atlas...");
    await mongoose.connect(atlasUri);
    console.log("✅ Connected to MongoDB Atlas!");

    const db = mongoose.connection.db;

    // Check all collections and their data
    console.log("\n📊 Atlas Database Status:");
    console.log("==========================");

    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      const status = count > 0 ? "✅" : "⚠️";
      console.log(`   ${status} ${collection.name}: ${count} records`);
    }

    // Specifically check trainsets
    console.log("\n🚆 Trainset Data Verification:");
    console.log("===============================");

    const trainsets = await db.collection("trainsets").find({}).toArray();
    console.log(`📊 Total trainsets: ${trainsets.length}`);

    if (trainsets.length > 0) {
      console.log("\n📋 Sample trainsets (first 5):");
      trainsets.slice(0, 5).forEach((trainset, index) => {
        console.log(`   ${index + 1}. Trainset ID: ${trainset.trainset_id}`);
        console.log(`      Rake Number: ${trainset.rake_number}`);
        console.log(`      Make/Model: ${trainset.make_model}`);
        console.log(`      Status: ${trainset.current_status}`);
        console.log(`      Depot: ${trainset.home_depot}`);
        console.log(`      Mileage: ${trainset.mileage || "N/A"} km`);
        console.log("");
      });
    }

    // Check data relationships
    console.log("\n🔗 Data Relationship Check:");
    console.log("============================");

    const fitnessCerts = await db
      .collection("fitnesscertificates")
      .countDocuments();
    const jobCards = await db.collection("jobcards").countDocuments();
    const brandingCampaigns = await db
      .collection("brandingcampaigns")
      .countDocuments();
    const mileageRecords = await db
      .collection("mileagerecords")
      .countDocuments();
    const cleaningSlots = await db.collection("cleaningslots").countDocuments();
    const stablingAssignments = await db
      .collection("stablingassignments")
      .countDocuments();
    const passengerFlow = await db.collection("passengerflow").countDocuments();

    console.log(`📜 Fitness Certificates: ${fitnessCerts}`);
    console.log(`🔧 Job Cards: ${jobCards}`);
    console.log(`🎯 Branding Campaigns: ${brandingCampaigns}`);
    console.log(`📏 Mileage Records: ${mileageRecords}`);
    console.log(`🧹 Cleaning Slots: ${cleaningSlots}`);
    console.log(`🏗️ Stabling Assignments: ${stablingAssignments}`);
    console.log(`👥 Passenger Flow: ${passengerFlow}`);

    // Check if data is from CSV import (should have 100 trainsets)
    if (trainsets.length === 100) {
      console.log("\n✅ SUCCESS: All 100 trains from CSV files are present!");
      console.log("🎉 Application is using fresh Atlas data");
    } else if (trainsets.length === 25) {
      console.log(
        "\n⚠️  WARNING: Only 25 trainsets found - using old generated data"
      );
      console.log(
        "💡 Run 'node scripts/importAll100Trains.js' to import fresh data"
      );
    } else if (trainsets.length === 1) {
      console.log("\n❌ ERROR: Only 1 trainset found - using very old data");
      console.log(
        "💡 Run 'node scripts/importAll100Trains.js' to import fresh data"
      );
    } else {
      console.log(`\n⚠️  UNKNOWN: ${trainsets.length} trainsets found`);
    }

    // Database connection info
    console.log("\n🌐 Database Connection Info:");
    console.log("============================");
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(
      `Connection State: ${
        mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
      }`
    );

    console.log("\n🎉 Atlas data verification complete!");
  } catch (error) {
    console.error("❌ Error verifying Atlas data:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

verifyAtlasData();
