import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Load environment variables
dotenv.config();

const atlasUri =
  "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const seedAtlasDatabase = async () => {
  try {
    console.log("🌱 Seeding MongoDB Atlas Database...");
    console.log("=====================================");

    console.log("📡 Connecting to MongoDB Atlas...");
    await mongoose.connect(atlasUri);
    console.log("✅ Connected to MongoDB Atlas!");

    const db = mongoose.connection.db;

    // Clear existing users
    console.log("\n🧹 Clearing existing users...");
    const deleteResult = await db.collection("users").deleteMany({});
    console.log(`✅ Cleared ${deleteResult.deletedCount} existing users`);

    // Create super admin
    console.log("\n👑 Creating super admin...");
    const superAdminPassword = await bcrypt.hash("super_admin", 12);
    const superAdmin = {
      username: "super_admin",
      email: "admin@trainplanwise.com",
      password: superAdminPassword,
      fullName: "Super Administrator",
      role: "super_admin",
      status: "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("users").insertOne(superAdmin);
    console.log("✅ Super admin created");

    // Create sample users
    console.log("\n👥 Creating sample users...");
    const sampleUsers = [
      {
        username: "shivrajmore8215898",
        email: "shivrajmore8215898@gmail.com",
        password: await bcrypt.hash("password123", 12),
        fullName: "Shivraj More",
        role: "user",
        status: "approved",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "kmrl_admin",
        email: "admin@kmrl.com",
        password: await bcrypt.hash("kmrl2025", 12),
        fullName: "KMRL Administrator",
        role: "admin",
        status: "approved",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "operations_manager",
        email: "ops@kmrl.com",
        password: await bcrypt.hash("ops2025", 12),
        fullName: "Operations Manager",
        role: "user",
        status: "approved",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "john_doe",
        email: "john.doe@kmrl.com",
        password: await bcrypt.hash("password123", 12),
        fullName: "John Doe",
        role: "user",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "jane_smith",
        email: "jane.smith@kmrl.com",
        password: await bcrypt.hash("password123", 12),
        fullName: "Jane Smith",
        role: "user",
        status: "approved",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const userData of sampleUsers) {
      await db.collection("users").insertOne(userData);
      console.log(
        `✅ Created user: ${userData.fullName} (${userData.username})`
      );
    }

    // Display summary
    console.log("\n📊 Atlas Database Summary:");
    const totalUsers = await db.collection("users").countDocuments();
    const pendingUsers = await db
      .collection("users")
      .countDocuments({ status: "pending" });
    const approvedUsers = await db
      .collection("users")
      .countDocuments({ status: "approved" });
    const superAdmins = await db
      .collection("users")
      .countDocuments({ role: "super_admin" });

    console.log(`   👥 Total Users: ${totalUsers}`);
    console.log(`   👑 Super Admins: ${superAdmins}`);
    console.log(`   ✅ Approved Users: ${approvedUsers}`);
    console.log(`   ⏳ Pending Users: ${pendingUsers}`);

    console.log("\n🎉 Atlas database seeding completed successfully!");
    console.log("\n💡 Your Atlas database is now ready with:");
    console.log("   • Super admin account (super_admin / super_admin)");
    console.log("   • Sample user accounts");
    console.log("   • Ready for application use");
  } catch (error) {
    console.error("❌ Error seeding Atlas database:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

// Run the seeding
seedAtlasDatabase();
