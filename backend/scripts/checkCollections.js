import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const atlasUri =
  "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const checkCollections = async () => {
  try {
    console.log("🔍 Checking Database Collections...");
    console.log("===================================");

    console.log("📡 Connecting to MongoDB Atlas...");
    await mongoose.connect(atlasUri);
    console.log("✅ Connected to MongoDB Atlas!");

    const db = mongoose.connection.db;

    // List all collections
    console.log("\n📋 All Collections in Database:");
    console.log("================================");

    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      const status = count > 0 ? "✅" : "⚠️";
      console.log(`   ${status} ${collection.name}: ${count} records`);
    }

    // Check if there are multiple trainset collections
    console.log("\n🚆 Trainset-related Collections:");
    console.log("=================================");

    const trainsetCollections = collections.filter(
      (col) =>
        col.name.toLowerCase().includes("train") ||
        col.name.toLowerCase().includes("trainset")
    );

    for (const collection of trainsetCollections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`📊 ${collection.name}: ${count} records`);

      // Show sample data structure
      const sample = await db.collection(collection.name).findOne({});
      if (sample) {
        console.log(`   Sample fields: ${Object.keys(sample).join(", ")}`);
        if (sample.rake_number) {
          console.log(`   Sample rake: ${sample.rake_number}`);
        }
        if (sample.number) {
          console.log(`   Sample number: ${sample.number}`);
        }
      }
    }

    // Check the main trainsets collection structure
    console.log("\n📊 Main Trainsets Collection Analysis:");
    console.log("======================================");

    const trainsets = await db
      .collection("trainsets")
      .find({})
      .limit(3)
      .toArray();
    console.log(`🚆 Found ${trainsets.length} trainsets in main collection`);

    if (trainsets.length > 0) {
      console.log("\n📋 Sample trainset structure:");
      const sample = trainsets[0];
      console.log(`   Fields: ${Object.keys(sample).join(", ")}`);
      console.log(`   Sample data:`);
      console.log(`     trainset_id: ${sample.trainset_id}`);
      console.log(`     rake_number: ${sample.rake_number}`);
      console.log(`     make_model: ${sample.make_model}`);
      console.log(`     current_status: ${sample.current_status}`);
      console.log(`     home_depot: ${sample.home_depot}`);
      console.log(`     mileage: ${sample.mileage}`);
    }

    console.log("\n🎉 Collection analysis complete!");
  } catch (error) {
    console.error("❌ Error checking collections:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

checkCollections();
