import dotenv from "dotenv";
import connectDB from "../config/database.js";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

const checkDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log("📊 Database Status Check");
    console.log("========================");

    // Get database connection
    const db = mongoose.connection.db;

    // Get all collections
    const collections = await db.listCollections().toArray();

    console.log("\n📋 Collections in database:");
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      const status = count > 0 ? "✅ Has data" : "ℹ️  Empty";
      console.log(`   ${collection.name}: ${count} documents (${status})`);
    }

    // Check users specifically
    const userCount = await db.collection("users").countDocuments();
    console.log(`\n👥 Users: ${userCount} accounts preserved`);

    // Check if we can see user details (without passwords)
    if (userCount > 0) {
      const users = await db
        .collection("users")
        .find(
          {},
          {
            projection: {
              username: 1,
              email: 1,
              role: 1,
              status: 1,
              fullName: 1,
            },
          }
        )
        .toArray();

      console.log("\n👤 User Details:");
      users.forEach((user) => {
        console.log(
          `   • ${user.username} (${user.fullName}) - ${user.role} - ${user.status}`
        );
      });
    }

    console.log("\n🎉 Database check completed!");
  } catch (error) {
    console.error("❌ Error checking database:", error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Run the script
checkDatabase();
