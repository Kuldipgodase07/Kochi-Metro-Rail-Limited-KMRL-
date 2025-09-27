import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Load environment variables
dotenv.config();

const atlasUri =
  "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const seedAtlasUsers = async () => {
  try {
    console.log("🌱 Seeding User Data to MongoDB Atlas...");
    console.log("=========================================");

    // Connect to Atlas
    console.log("📡 Connecting to MongoDB Atlas...");
    await mongoose.connect(atlasUri);
    console.log("✅ Connected to MongoDB Atlas!");

    const db = mongoose.connection.db;

    // Clear existing users
    console.log("\n🧹 Clearing existing users...");
    const deleteResult = await db.collection("users").deleteMany({});
    console.log(`✅ Cleared ${deleteResult.deletedCount} existing users`);

    // Create users
    console.log("\n👥 Creating users...");

    // Super Admin
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

    // KMRL Admin
    const kmrlAdminPassword = await bcrypt.hash("kmrl2025", 12);
    const kmrlAdmin = {
      username: "kmrl_admin",
      email: "admin@kmrl.com",
      password: kmrlAdminPassword,
      fullName: "KMRL Administrator",
      role: "admin",
      status: "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("users").insertOne(kmrlAdmin);
    console.log("✅ KMRL admin created");

    // Operations Manager
    const opsManagerPassword = await bcrypt.hash("ops2025", 12);
    const opsManager = {
      username: "operations_manager",
      email: "ops@kmrl.com",
      password: opsManagerPassword,
      fullName: "Operations Manager",
      role: "user",
      status: "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("users").insertOne(opsManager);
    console.log("✅ Operations manager created");

    // Maintenance Supervisor
    const maintenancePassword = await bcrypt.hash("maintenance2025", 12);
    const maintenanceSupervisor = {
      username: "maintenance_supervisor",
      email: "maintenance@kmrl.com",
      password: maintenancePassword,
      fullName: "Maintenance Supervisor",
      role: "user",
      status: "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("users").insertOne(maintenanceSupervisor);
    console.log("✅ Maintenance supervisor created");

    // Fleet Manager
    const fleetPassword = await bcrypt.hash("fleet2025", 12);
    const fleetManager = {
      username: "fleet_manager",
      email: "fleet@kmrl.com",
      password: fleetPassword,
      fullName: "Fleet Manager",
      role: "user",
      status: "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("users").insertOne(fleetManager);
    console.log("✅ Fleet manager created");

    // Control Room Operator
    const controlPassword = await bcrypt.hash("control2025", 12);
    const controlOperator = {
      username: "control_operator",
      email: "control@kmrl.com",
      password: controlPassword,
      fullName: "Control Room Operator",
      role: "user",
      status: "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("users").insertOne(controlOperator);
    console.log("✅ Control room operator created");

    // Additional users for testing
    const additionalUsers = [
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
        username: "test_user",
        email: "test@kmrl.com",
        password: await bcrypt.hash("test123", 12),
        fullName: "Test User",
        role: "user",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const user of additionalUsers) {
      await db.collection("users").insertOne(user);
      console.log(`✅ ${user.fullName} created`);
    }

    // Verify users
    console.log("\n📊 Verifying users...");
    const userCount = await db.collection("users").countDocuments();
    console.log(`✅ Total users in Atlas: ${userCount}`);

    const users = await db.collection("users").find({}).toArray();
    console.log("\n👤 User Details:");
    users.forEach((user) => {
      console.log(
        `   • ${user.username} (${user.fullName}) - ${user.role} - ${user.status}`
      );
    });

    console.log("\n🎉 User data seeding completed successfully!");
    console.log("\n💡 Login Credentials:");
    console.log("   • Super Admin: super_admin / super_admin");
    console.log("   • KMRL Admin: kmrl_admin / kmrl2025");
    console.log("   • Operations: operations_manager / ops2025");
    console.log("   • Maintenance: maintenance_supervisor / maintenance2025");
    console.log("   • Fleet: fleet_manager / fleet2025");
    console.log("   • Control: control_operator / control2025");
    console.log("   • Test User: shivrajmore8215898 / password123");
  } catch (error) {
    console.error("❌ Error seeding user data:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

// Run the seeding
seedAtlasUsers();
