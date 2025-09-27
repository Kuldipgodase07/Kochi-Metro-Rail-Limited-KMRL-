import dotenv from "dotenv";
import connectDB from "../config/database.js";
import User from "../models/User.js";
import Trainset from "../models/Trainset.js";
import FitnessCertificate from "../models/FitnessCertificate.js";
import JobCard from "../models/JobCard.js";
import BrandingCampaign from "../models/BrandingCampaign.js";
import CleaningSlot from "../models/CleaningSlot.js";
import StablingAssignment from "../models/StablingAssignment.js";
import Incident from "../models/Incident.js";
import InductionFeedback from "../models/InductionFeedback.js";
import Metrics from "../models/Metrics.js";
import SystemState from "../models/SystemState.js";

// Load environment variables
dotenv.config();

const clearDataExceptUsers = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log("🧹 Starting database cleanup (preserving users)...");

    // Get user count before clearing
    const userCountBefore = await User.countDocuments();
    console.log(`👥 Found ${userCountBefore} users to preserve`);

    // Clear all collections except users - only include models that exist and have content
    const collectionsToClear = [
      { name: "Trainsets", model: Trainset },
      { name: "Fitness Certificates", model: FitnessCertificate },
      { name: "Job Cards", model: JobCard },
      { name: "Branding Campaigns", model: BrandingCampaign },
      { name: "Cleaning Slots", model: CleaningSlot },
      { name: "Stabling Assignments", model: StablingAssignment },
      { name: "Incidents", model: Incident },
      { name: "Induction Feedback", model: InductionFeedback },
      { name: "Metrics", model: Metrics },
      { name: "System State", model: SystemState },
    ];

    let totalCleared = 0;

    for (const collection of collectionsToClear) {
      try {
        const count = await collection.model.countDocuments();
        if (count > 0) {
          await collection.model.deleteMany({});
          console.log(`✅ Cleared ${count} ${collection.name}`);
          totalCleared += count;
        } else {
          console.log(`ℹ️  ${collection.name} was already empty`);
        }
      } catch (error) {
        console.log(`⚠️  Could not clear ${collection.name}: ${error.message}`);
      }
    }

    // Verify user data is preserved
    const userCountAfter = await User.countDocuments();
    console.log(`\n👥 User data preserved: ${userCountAfter} users remain`);

    if (userCountBefore !== userCountAfter) {
      console.log("⚠️  WARNING: User count changed during cleanup!");
    } else {
      console.log("✅ User data successfully preserved");
    }

    // Display summary
    console.log("\n📊 Cleanup Summary:");
    console.log(`   Total records cleared: ${totalCleared}`);
    console.log(`   Users preserved: ${userCountAfter}`);
    console.log(`   Collections cleared: ${collectionsToClear.length}`);

    console.log("\n🎉 Database cleanup completed successfully!");
    console.log("💡 You can now run seed scripts to populate fresh data");
  } catch (error) {
    console.error("❌ Error during database cleanup:", error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Run the script
clearDataExceptUsers();
