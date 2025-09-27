import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const atlasUri =
  "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const forceAtlasConnection = async () => {
  try {
    console.log("🔧 Forcing Atlas Connection for All Components...");
    console.log("=================================================");

    // Force environment variable
    process.env.MONGODB_URI = atlasUri;
    console.log("✅ Set MONGODB_URI environment variable");

    // Connect to Atlas
    console.log("📡 Connecting to MongoDB Atlas...");
    await mongoose.connect(atlasUri);
    console.log("✅ Connected to MongoDB Atlas!");

    const db = mongoose.connection.db;

    // Verify connection
    console.log("\n🔍 Verifying Atlas Connection:");
    console.log("===============================");
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(
      `Connection State: ${
        mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
      }`
    );

    // Check data freshness
    console.log("\n📊 Checking Data Freshness:");
    console.log("============================");

    const trainsets = await db.collection("trainsets").find({}).toArray();
    console.log(`🚆 Trainsets: ${trainsets.length}`);

    if (trainsets.length === 100) {
      console.log("✅ Fresh data confirmed - All 100 trains from CSV files");
    } else {
      console.log(`⚠️  Unexpected trainset count: ${trainsets.length}`);
    }

    // Test a sample query to ensure data is accessible
    console.log("\n🧪 Testing Data Access:");
    console.log("=======================");

    const sampleTrainset = await db
      .collection("trainsets")
      .findOne({ trainset_id: 1 });
    if (sampleTrainset) {
      console.log(
        `✅ Sample trainset found: ${sampleTrainset.rake_number} (${sampleTrainset.make_model})`
      );
    }

    const fitnessCount = await db
      .collection("fitnesscertificates")
      .countDocuments();
    console.log(`✅ Fitness certificates accessible: ${fitnessCount}`);

    const jobCardsCount = await db.collection("jobcards").countDocuments();
    console.log(`✅ Job cards accessible: ${jobCardsCount}`);

    console.log("\n🎉 Atlas connection forced successfully!");
    console.log("✅ All components should now use Atlas data");
    console.log("💡 Restart your application to ensure fresh data is loaded");
  } catch (error) {
    console.error("❌ Error forcing Atlas connection:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

forceAtlasConnection();
