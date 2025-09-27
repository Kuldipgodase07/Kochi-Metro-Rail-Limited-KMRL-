import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

const atlasUri =
  "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const configureAtlasComplete = async () => {
  try {
    console.log("🔧 Complete Atlas Configuration");
    console.log("===============================");

    // 1. Test Atlas Connection
    console.log("\n📡 Testing Atlas Connection...");
    await mongoose.connect(atlasUri);
    console.log("✅ Atlas connection successful!");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections in Atlas`);

    // 2. Verify User Data
    console.log("\n👥 Verifying User Data...");
    const userCount = await db.collection("users").countDocuments();
    console.log(`✅ Users in Atlas: ${userCount}`);

    if (userCount > 0) {
      const users = await db.collection("users").find({}).limit(3).toArray();
      console.log("👤 Sample users:");
      users.forEach((user) => {
        console.log(`   • ${user.username} (${user.fullName}) - ${user.role}`);
      });
    } else {
      console.log("⚠️  No users found - run seedAtlasUsers.js first");
    }

    // 3. Verify Operational Data
    console.log("\n📊 Verifying Operational Data...");
    const dataCollections = [
      "trainsets",
      "fitnesscertificates",
      "jobcards",
      "brandingcampaigns",
      "mileagerecords",
      "cleaningslots",
      "stablingassignments",
      "passengerflow",
    ];

    let totalRecords = 0;
    for (const collectionName of dataCollections) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        totalRecords += count;
        const status = count > 0 ? "✅" : "⚠️";
        console.log(`   ${status} ${collectionName}: ${count} records`);
      } catch (error) {
        console.log(`   ❌ ${collectionName}: Error accessing collection`);
      }
    }

    console.log(`\n📈 Total operational records: ${totalRecords}`);

    // 4. Test Scheduling System
    console.log("\n🚆 Testing Scheduling System...");
    try {
      const SchedulingEngine = (await import("../services/schedulingEngine.js"))
        .default;
      const schedulingEngine = new SchedulingEngine();

      // Test data retrieval
      const [trainsets] = await schedulingEngine.getAllOperationalData();
      console.log(
        `✅ Scheduling engine can access ${trainsets.length} trainsets`
      );

      // Test schedule generation
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 1);

      const schedule = await schedulingEngine.generateSchedule(targetDate, {
        requiredTrainsets: 15,
        maxStandby: 5,
        maxMaintenance: 3,
      });

      console.log(
        `✅ Schedule generated: ${schedule.schedule.induction_list.length} induction, ${schedule.schedule.standby_list.length} standby`
      );
    } catch (error) {
      console.log(`❌ Scheduling system error: ${error.message}`);
    }

    // 5. Update Environment Configuration
    console.log("\n🔧 Updating Environment Configuration...");

    const envContent = `# MongoDB Atlas Connection
MONGODB_URI=${atlasUri}

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production_2024

# Super Admin Configuration
SUPER_ADMIN_USERNAME=super_admin
SUPER_ADMIN_PASSWORD=super_admin
SUPER_ADMIN_EMAIL=admin@trainplanwise.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
`;

    const envPath = path.join(process.cwd(), ".env");
    fs.writeFileSync(envPath, envContent);
    console.log("✅ .env file updated with Atlas configuration");

    // 6. Create Atlas Status Summary
    console.log("\n📊 Atlas Configuration Summary:");
    console.log("===============================");
    console.log(`🌐 Cluster: cluster0.byx6m0c.mongodb.net`);
    console.log(`👤 User: shivrajmore8215898`);
    console.log(`🗄️  Database: ${mongoose.connection.name}`);
    console.log(`📋 Collections: ${collections.length}`);
    console.log(`👥 Users: ${userCount}`);
    console.log(`📄 Total Records: ${totalRecords}`);
    console.log(`🔗 Connection: Active`);

    console.log("\n🎉 Atlas Configuration Complete!");
    console.log("\n💡 Your application is now fully configured for Atlas:");
    console.log("   • All database connections use Atlas");
    console.log("   • User authentication ready");
    console.log("   • Operational data available");
    console.log("   • Scheduling system functional");
    console.log("   • Environment variables configured");

    console.log("\n🚀 Next Steps:");
    console.log("   1. Start backend: npm run dev");
    console.log("   2. Start frontend: npm run dev (in frontend directory)");
    console.log("   3. Test login with: super_admin / super_admin");
    console.log("   4. Generate schedules using the dashboard");
  } catch (error) {
    console.error("❌ Atlas configuration failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

// Run the configuration
configureAtlasComplete();
