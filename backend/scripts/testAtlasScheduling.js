import dotenv from "dotenv";
import mongoose from "mongoose";
import SchedulingEngine from "../services/schedulingEngine.js";

// Load environment variables
dotenv.config();

const testAtlasScheduling = async () => {
  try {
    console.log("🧪 Testing Atlas Scheduling System...");
    console.log("=====================================");

    // Connect directly to Atlas
    const atlasUri =
      "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    console.log("📡 Connecting to MongoDB Atlas...");
    await mongoose.connect(atlasUri);
    console.log("✅ Connected to MongoDB Atlas!");

    const schedulingEngine = new SchedulingEngine();

    // Test data retrieval
    console.log("\n📊 Testing data retrieval...");
    const [
      trainsets,
      fitnessCertificates,
      jobCards,
      brandingCampaigns,
      mileageRecords,
      cleaningSlots,
      stablingAssignments,
      passengerFlow,
    ] = await schedulingEngine.getAllOperationalData();

    console.log(`✅ Data retrieved from Atlas:`);
    console.log(`   🚆 Trainsets: ${trainsets.length}`);
    console.log(`   📜 Fitness Certificates: ${fitnessCertificates.length}`);
    console.log(`   🔧 Job Cards: ${jobCards.length}`);
    console.log(`   🎯 Branding Campaigns: ${brandingCampaigns.length}`);
    console.log(`   📏 Mileage Records: ${mileageRecords.length}`);
    console.log(`   🧹 Cleaning Slots: ${cleaningSlots.length}`);
    console.log(`   🏗️  Stabling Assignments: ${stablingAssignments.length}`);
    console.log(`   👥 Passenger Flow: ${passengerFlow.length}`);

    if (trainsets.length === 0) {
      console.log("❌ No trainsets found in Atlas database");
      return;
    }

    // Test schedule generation
    console.log("\n🚆 Testing schedule generation...");
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);

    const constraints = {
      requiredTrainsets: 20,
      maxStandby: 5,
      maxMaintenance: 3,
    };

    const schedule = await schedulingEngine.generateSchedule(
      targetDate,
      constraints
    );

    console.log("✅ Schedule generated successfully!");
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

    // Show sample trainsets
    if (schedule.schedule.induction_list.length > 0) {
      console.log("\n🎯 Sample induction trainsets:");
      schedule.schedule.induction_list
        .slice(0, 3)
        .forEach((trainset, index) => {
          console.log(
            `   ${index + 1}. ${
              trainset.rake_number
            } (Score: ${trainset.score.toFixed(1)})`
          );
          console.log(`      Reasoning: ${trainset.reasoning.join(", ")}`);
        });
    }

    // Test what-if simulation
    console.log("\n🔮 Testing what-if simulation...");
    const simulationScenario = {
      targetDate: targetDate,
      constraints: {
        requiredTrainsets: 18,
        maxStandby: 7,
        maxMaintenance: 2,
      },
      modifications: {
        fitnessCertificates: {
          expired: 2,
          expiring: 3,
        },
      },
    };

    const simulation = await schedulingEngine.simulateScenario(
      simulationScenario
    );
    console.log("✅ Simulation completed");
    console.log(
      `   🎯 Trainsets affected: ${simulation.impact_analysis.trainsets_affected}`
    );
    console.log(
      `   📊 Performance impact: ${simulation.impact_analysis.performance_impact}`
    );

    console.log("\n🎉 Atlas Scheduling System Test Complete!");
    console.log("✅ All systems operational with Atlas data");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

// Run the test
testAtlasScheduling();
