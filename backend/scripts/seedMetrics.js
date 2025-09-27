import dotenv from "dotenv";
import connectDB from "../config/database.js";
import mongoose from "mongoose";
import Metrics from "../models/Metrics.js";

// Load environment variables
dotenv.config();

const seedMetrics = async () => {
  try {
    console.log("📊 Seeding Metrics Data...");
    console.log("==========================");

    // Atlas connection string
    const atlasUri =
      "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    process.env.MONGODB_URI = atlasUri;

    console.log("📡 Connecting to MongoDB Atlas...");
    await connectDB();
    console.log("✅ Connected to MongoDB Atlas!");

    // Clear existing metrics
    await Metrics.deleteMany({});
    console.log("🗑️  Cleared existing metrics");

    // Create comprehensive metrics data
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
        last_optimization: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
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

    // Insert metrics
    const metrics = new Metrics(metricsData);
    await metrics.save();

    console.log("✅ Metrics data seeded successfully!");
    console.log(
      `📊 Fleet Status: ${metricsData.fleet_status.total_fleet} total trains`
    );
    console.log(
      `📈 Serviceability: ${metricsData.fleet_status.serviceability}%`
    );
    console.log(`🎯 Punctuality: ${metricsData.current_kpis.punctuality}%`);
    console.log(
      `💰 Maintenance Cost: ₹${metricsData.current_kpis.maintenance_cost.toLocaleString()}`
    );
    console.log(
      `⚡ Energy Consumption: ${metricsData.current_kpis.energy_consumption.toLocaleString()} kWh`
    );
    console.log(
      `🤖 AI Confidence: ${metricsData.planning_status.ai_confidence_avg}%`
    );
    console.log(`🚨 Active Alerts: ${metricsData.alerts.length}`);
  } catch (error) {
    console.error("❌ Error seeding metrics:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

// Run the seeding
seedMetrics();
