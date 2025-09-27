import dotenv from "dotenv";
import connectDB from "../config/database.js";
import mongoose from "mongoose";
import Metrics from "../models/Metrics.js";

// Load environment variables
dotenv.config();

const seedAllData = async () => {
  try {
    console.log("🌱 Seeding All Application Data...");
    console.log("==================================");

    // Atlas connection string
    const atlasUri =
      "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    process.env.MONGODB_URI = atlasUri;

    console.log("📡 Connecting to MongoDB Atlas...");
    await connectDB();
    console.log("✅ Connected to MongoDB Atlas!");

    const db = mongoose.connection.db;

    // Check existing data
    const trainsetsCount = await db.collection("trainsets").countDocuments();
    const metricsCount = await Metrics.countDocuments();

    console.log(`📊 Current Data Status:`);
    console.log(`   Trainsets: ${trainsetsCount}`);
    console.log(`   Metrics: ${metricsCount}`);

    // Seed metrics if not exists
    if (metricsCount === 0) {
      console.log("📊 Seeding Metrics Data...");

      const metricsData = {
        timestamp: new Date(),
        fleet_status: {
          total_fleet: 100,
          ready: 28,
          standby: 36,
          maintenance: 36,
          critical: 0,
          serviceability: 85,
          avg_availability: 78,
        },
        current_kpis: {
          punctuality: 94.5,
          fleet_availability: 78.2,
          maintenance_cost: 1250000,
          energy_consumption: 2850000,
        },
        planning_status: {
          schedules_generated: 156,
          ai_confidence_avg: 87.3,
          last_optimization: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        alerts: [
          {
            type: "warning",
            trainset: "R1001",
            message: "Scheduled maintenance due in 48 hours",
            priority: "medium",
          },
          {
            type: "info",
            trainset: "R1005",
            message: "Cleaning cycle completed successfully",
            priority: "low",
          },
          {
            type: "critical",
            trainset: "R1012",
            message: "Emergency brake system requires immediate attention",
            priority: "critical",
          },
        ],
      };

      const metrics = new Metrics(metricsData);
      await metrics.save();
      console.log("✅ Metrics data seeded successfully!");
    } else {
      console.log("✅ Metrics data already exists");
    }

    // Check if trainsets exist
    if (trainsetsCount === 0) {
      console.log(
        "🚂 No trainsets found. Please run the CSV import script first:"
      );
      console.log("   node scripts/importAllCsvDataWithRelations.js");
    } else {
      console.log(`✅ Found ${trainsetsCount} trainsets in database`);
    }

    // Verify all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    console.log("\n📋 Database Collections Status:");
    const expectedCollections = [
      "trainsets",
      "fitnesscertificates",
      "jobcards",
      "brandingcampaigns",
      "mileagerecords",
      "cleaningslots",
      "stablingassignments",
      "inductionfeedbacks",
      "passengerflow",
      "metrics",
    ];

    for (const collectionName of expectedCollections) {
      if (collectionNames.includes(collectionName)) {
        const count = await db.collection(collectionName).countDocuments();
        console.log(`   ✅ ${collectionName}: ${count} documents`);
      } else {
        console.log(`   ❌ ${collectionName}: Missing`);
      }
    }

    console.log("\n🎉 Data seeding completed!");
    console.log("📡 Backend API is ready at: http://localhost:5000");
    console.log("🤖 OR-Tools service is ready at: http://localhost:8001");
    console.log("🌐 Frontend should now work without JSON parsing errors");
  } catch (error) {
    console.error("❌ Error seeding data:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

// Run the seeding
seedAllData();
