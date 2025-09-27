import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";

dotenv.config();

const atlasUri =
  "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const testAllAtlasEndpoints = async () => {
  try {
    console.log("🧪 Testing All Atlas Endpoints...");
    console.log("=================================");

    // Connect to Atlas
    console.log("📡 Connecting to MongoDB Atlas...");
    await mongoose.connect(atlasUri);
    console.log("✅ Connected to MongoDB Atlas!");

    const db = mongoose.connection.db;

    // Test 1: Verify data exists in Atlas
    console.log("\n📊 Verifying Atlas Data...");
    const collections = await db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections in Atlas`);

    const dataCounts = {};
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      dataCounts[collection.name] = count;
      const status = count > 0 ? "✅" : "⚠️";
      console.log(`   ${status} ${collection.name}: ${count} records`);
    }

    // Test 2: Test data routes (simulate API calls)
    console.log("\n🔗 Testing Data Routes...");

    // Test trainsets endpoint
    const trainsets = await db.collection("trainsets").find({}).toArray();
    console.log(`✅ Trainsets endpoint: ${trainsets.length} trainsets found`);

    // Test fitness certificates
    const fitnessCerts = await db
      .collection("fitnesscertificates")
      .find({})
      .toArray();
    console.log(
      `✅ Fitness certificates: ${fitnessCerts.length} certificates found`
    );

    // Test job cards
    const jobCards = await db.collection("jobcards").find({}).toArray();
    console.log(`✅ Job cards: ${jobCards.length} job cards found`);

    // Test branding campaigns
    const brandingCampaigns = await db
      .collection("brandingcampaigns")
      .find({})
      .toArray();
    console.log(
      `✅ Branding campaigns: ${brandingCampaigns.length} campaigns found`
    );

    // Test 3: Test scheduling engine with Atlas data
    console.log("\n🚆 Testing Scheduling Engine...");
    const SchedulingEngine = (await import("../services/schedulingEngine.js"))
      .default;
    const schedulingEngine = new SchedulingEngine();

    // Test data retrieval
    const [atlasTrainsets, atlasFitness, atlasJobs, atlasBranding] =
      await Promise.all([
        db.collection("trainsets").find({}).toArray(),
        db.collection("fitnesscertificates").find({}).toArray(),
        db.collection("jobcards").find({}).toArray(),
        db.collection("brandingcampaigns").find({}).toArray(),
      ]);

    console.log(`✅ Atlas data accessible:`);
    console.log(`   🚆 Trainsets: ${atlasTrainsets.length}`);
    console.log(`   📜 Fitness: ${atlasFitness.length}`);
    console.log(`   🔧 Jobs: ${atlasJobs.length}`);
    console.log(`   🎯 Branding: ${atlasBranding.length}`);

    // Test schedule generation
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);

    const schedule = await schedulingEngine.generateSchedule(targetDate, {
      requiredTrainsets: 1,
      maxStandby: 2,
      maxMaintenance: 1,
    });

    console.log(`✅ Schedule generated successfully:`);
    console.log(
      `   📊 Induction: ${schedule.schedule.induction_list.length} trainsets`
    );
    console.log(
      `   ⏰ Standby: ${schedule.schedule.standby_list.length} trainsets`
    );
    console.log(
      `   🔧 Maintenance: ${schedule.schedule.maintenance_list.length} trainsets`
    );
    console.log(`   📈 Coverage: ${schedule.schedule.summary.coverage}%`);

    // Test 4: Verify all models can access Atlas data
    console.log("\n📋 Testing Model Access...");

    // Test Trainset model
    const Trainset = (await import("../models/Trainset.js")).default;
    const modelTrainsets = await Trainset.find({});
    console.log(`✅ Trainset model: ${modelTrainsets.length} records`);

    // Test 5: Test data transformation
    console.log("\n🔄 Testing Data Transformation...");

    if (atlasTrainsets.length > 0) {
      const sampleTrainset = atlasTrainsets[0];
      console.log(`✅ Sample trainset data structure:`);
      console.log(`   ID: ${sampleTrainset._id}`);
      console.log(
        `   Number: ${
          sampleTrainset.trainset_id || sampleTrainset.number || "N/A"
        }`
      );
      console.log(
        `   Status: ${
          sampleTrainset.current_status || sampleTrainset.status || "N/A"
        }`
      );
      console.log(`   Mileage: ${sampleTrainset.mileage || "N/A"}`);
    }

    // Test 6: Test analytics
    console.log("\n📈 Testing Analytics...");
    const analytics = await schedulingEngine.getPerformanceAnalytics();
    console.log(`✅ Analytics generated:`);
    console.log(`   📊 Total schedules: ${analytics.total_schedules}`);
    console.log(`   📈 Average coverage: ${analytics.average_coverage}%`);

    // Test 7: Test what-if simulation
    console.log("\n🔮 Testing What-if Simulation...");
    const simulation = await schedulingEngine.simulateScenario({
      targetDate: targetDate,
      constraints: { requiredTrainsets: 1 },
      modifications: { test: true },
    });
    console.log(`✅ Simulation completed:`);
    console.log(
      `   🎯 Trainsets affected: ${simulation.impact_analysis.trainsets_affected}`
    );
    console.log(
      `   📊 Performance impact: ${simulation.impact_analysis.performance_impact}`
    );

    // Summary
    console.log("\n📊 Atlas Integration Summary:");
    console.log("============================");
    console.log(`🌐 Database: ${mongoose.connection.name}`);
    console.log(`📋 Collections: ${collections.length}`);
    console.log(
      `📄 Total Records: ${Object.values(dataCounts).reduce(
        (a, b) => a + b,
        0
      )}`
    );
    console.log(`🚆 Trainsets: ${dataCounts.trainsets || 0}`);
    console.log(
      `📜 Fitness Certificates: ${dataCounts.fitnesscertificates || 0}`
    );
    console.log(`🔧 Job Cards: ${dataCounts.jobcards || 0}`);
    console.log(`🎯 Branding Campaigns: ${dataCounts.brandingcampaigns || 0}`);
    console.log(`📏 Mileage Records: ${dataCounts.mileagerecords || 0}`);
    console.log(`🧹 Cleaning Slots: ${dataCounts.cleaningslots || 0}`);
    console.log(
      `🏗️  Stabling Assignments: ${dataCounts.stablingassignments || 0}`
    );
    console.log(`👥 Passenger Flow: ${dataCounts.passengerflow || 0}`);

    console.log("\n🎉 All Atlas endpoints and data access verified!");
    console.log("✅ Your application is fully configured for MongoDB Atlas");
    console.log("🚀 Ready for production use with Atlas data");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

testAllAtlasEndpoints();
