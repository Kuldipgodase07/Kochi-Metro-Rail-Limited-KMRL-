import dotenv from "dotenv";
import connectDB from "../config/database.js";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

const clearDataExceptUsers = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log("🧹 Starting database cleanup (preserving users)...");

    // Get database connection
    const db = mongoose.connection.db;

    // Get user count before clearing
    const userCountBefore = await db.collection("users").countDocuments();
    console.log(`👥 Found ${userCountBefore} users to preserve`);

    // List of collections to clear (excluding users)
    const collectionsToClear = [
      "trainsets",
      "fitnesscertificates",
      "jobcards",
      "brandingcampaigns",
      "cleaningslots",
      "stablingassignments",
      "incidents",
      "inductionfeedbacks",
      "metrics",
      "systemstates",
      "stations",
      "feedbacks",
    ];

    let totalCleared = 0;

    for (const collectionName of collectionsToClear) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();

        if (count > 0) {
          await collection.deleteMany({});
          console.log(`✅ Cleared ${count} ${collectionName}`);
          totalCleared += count;
        } else {
          console.log(`ℹ️  ${collectionName} was already empty`);
        }
      } catch (error) {
        console.log(`⚠️  Could not clear ${collectionName}: ${error.message}`);
      }
    }

    // Verify user data is preserved
    const userCountAfter = await db.collection("users").countDocuments();
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
