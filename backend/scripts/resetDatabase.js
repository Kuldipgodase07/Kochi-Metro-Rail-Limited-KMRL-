import dotenv from "dotenv";
import connectDB from "../config/database.js";
import User from "../models/User.js";
import Trainset from "../models/Trainset.js";
import FitnessCertificate from "../models/FitnessCertificate.js";
import JobCard from "../models/JobCard.js";
import BrandingCampaign from "../models/BrandingCampaign.js";
import CleaningSlot from "../models/CleaningSlot.js";
import StablingAssignment from "../models/StablingAssignment.js";
import Feedback from "../models/Feedback.js";
import Incident from "../models/Incident.js";
import InductionFeedback from "../models/InductionFeedback.js";
import Metrics from "../models/Metrics.js";
import SystemState from "../models/SystemState.js";
import Station from "../models/Station.js";

// Load environment variables
dotenv.config();

const resetDatabase = async (options = {}) => {
  const { clearUsers = false, reseed = false, clearAll = false } = options;

  try {
    // Connect to database
    await connectDB();

    console.log("🔄 Starting database reset...");

    if (clearAll) {
      console.log("⚠️  CLEARING ALL DATA INCLUDING USERS");
    } else {
      console.log("🧹 Clearing operational data (preserving users)");
    }

    // Get initial counts
    const userCountBefore = await User.countDocuments();
    console.log(`👥 Found ${userCountBefore} users`);

    // Collections to clear
    const collectionsToClear = [
      { name: "Trainsets", model: Trainset },
      { name: "Fitness Certificates", model: FitnessCertificate },
      { name: "Job Cards", model: JobCard },
      { name: "Branding Campaigns", model: BrandingCampaign },
      { name: "Cleaning Slots", model: CleaningSlot },
      { name: "Stabling Assignments", model: StablingAssignment },
      { name: "Feedback", model: Feedback },
      { name: "Incidents", model: Incident },
      { name: "Induction Feedback", model: InductionFeedback },
      { name: "Metrics", model: Metrics },
      { name: "System State", model: SystemState },
      { name: "Stations", model: Station },
    ];

    let totalCleared = 0;

    // Clear operational data
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

    // Handle user data based on options
    if (clearUsers || clearAll) {
      const userCount = await User.countDocuments();
      if (userCount > 0) {
        await User.deleteMany({});
        console.log(`✅ Cleared ${userCount} users`);
        totalCleared += userCount;
      }
    }

    // Verify user data preservation
    const userCountAfter = await User.countDocuments();
    if (!clearUsers && !clearAll) {
      console.log(`👥 User data preserved: ${userCountAfter} users remain`);
      if (userCountBefore !== userCountAfter) {
        console.log("⚠️  WARNING: User count changed during cleanup!");
      }
    }

    // Display summary
    console.log("\n📊 Reset Summary:");
    console.log(`   Total records cleared: ${totalCleared}`);
    console.log(`   Users remaining: ${userCountAfter}`);
    console.log(`   Collections cleared: ${collectionsToClear.length}`);

    // Reseed if requested
    if (reseed) {
      console.log("\n🌱 Reseeding database...");

      // Import and run seed scripts
      try {
        const { default: seedDatabase } = await import("./seedDatabase.js");
        const { default: seedTrainsets } = await import("./insertTrainsets.js");
        const { default: seedStaticData } = await import("./seedStaticData.js");

        // Run seed scripts
        console.log("📊 Seeding trainsets...");
        await seedTrainsets();

        console.log("📊 Seeding static data...");
        await seedStaticData();

        console.log("✅ Database reseeded successfully");
      } catch (error) {
        console.log("⚠️  Error during reseeding:", error.message);
        console.log("💡 You can manually run seed scripts later");
      }
    }

    console.log("\n🎉 Database reset completed successfully!");

    if (!reseed) {
      console.log("\n💡 Next steps:");
      console.log("   • Run seed scripts to populate fresh data");
      console.log("   • Start backend server: npm run dev");
      console.log("   • Access application with clean database");
    }
  } catch (error) {
    console.error("❌ Error during database reset:", error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  clearUsers: args.includes("--clear-users"),
  reseed: args.includes("--reseed"),
  clearAll: args.includes("--clear-all"),
};

// Run the script
resetDatabase(options);
