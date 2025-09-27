import dotenv from "dotenv";
import mongoose from "mongoose";
import Trainset from "../models/Trainset.js";

dotenv.config();

const atlasUri =
  "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const testTrainsetModel = async () => {
  try {
    console.log("🧪 Testing Trainset Model...");
    console.log("============================");

    console.log("📡 Connecting to MongoDB Atlas...");
    await mongoose.connect(atlasUri);
    console.log("✅ Connected to MongoDB Atlas!");

    // Test 1: Direct database query
    console.log("\n📊 Direct Database Query:");
    console.log("==========================");

    const db = mongoose.connection.db;
    const directTrainsets = await db
      .collection("trainsets")
      .find({})
      .limit(5)
      .toArray();
    console.log(`🚆 Direct query found ${directTrainsets.length} trainsets`);

    if (directTrainsets.length > 0) {
      console.log("📋 Sample direct query results:");
      directTrainsets.forEach((ts, index) => {
        console.log(
          `   ${index + 1}. ID: ${ts.trainset_id}, Rake: ${
            ts.rake_number
          }, Make: ${ts.make_model}`
        );
      });
    }

    // Test 2: Trainset model query
    console.log("\n🔍 Trainset Model Query:");
    console.log("========================");

    const modelTrainsets = await Trainset.find({}).limit(5);
    console.log(`🚆 Model query found ${modelTrainsets.length} trainsets`);

    if (modelTrainsets.length > 0) {
      console.log("📋 Sample model query results:");
      modelTrainsets.forEach((ts, index) => {
        console.log(
          `   ${index + 1}. Number: ${ts.number}, Status: ${ts.status}, Bay: ${
            ts.bay_position
          }`
        );
      });
    }

    // Test 3: Check if models are using different databases
    console.log("\n🌐 Database Connection Info:");
    console.log("============================");
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(
      `Connection State: ${
        mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
      }`
    );

    // Test 4: Check total counts
    console.log("\n📊 Data Counts:");
    console.log("===============");

    const directCount = await db.collection("trainsets").countDocuments();
    const modelCount = await Trainset.countDocuments();

    console.log(`Direct database query: ${directCount} trainsets`);
    console.log(`Trainset model query: ${modelCount} trainsets`);

    if (directCount !== modelCount) {
      console.log(
        "⚠️  WARNING: Direct query and model query return different counts!"
      );
      console.log(
        "This suggests the model might be connected to a different database or collection."
      );
    } else {
      console.log("✅ Direct query and model query return the same count");
    }

    // Test 5: Check if we have the expected CSV data
    console.log("\n🔍 CSV Data Verification:");
    console.log("==========================");

    const csvTrainsets = await db
      .collection("trainsets")
      .find({
        rake_number: { $exists: true },
      })
      .limit(3)
      .toArray();

    console.log(`🚆 Trainsets with rake_number: ${csvTrainsets.length}`);

    if (csvTrainsets.length > 0) {
      console.log("📋 Sample CSV data:");
      csvTrainsets.forEach((ts, index) => {
        console.log(
          `   ${index + 1}. Rake: ${ts.rake_number}, Make: ${
            ts.make_model
          }, Status: ${ts.current_status}`
        );
      });
    }

    // Test 6: Check model data structure
    console.log("\n📋 Model Data Structure:");
    console.log("========================");

    if (modelTrainsets.length > 0) {
      const sampleModel = modelTrainsets[0];
      console.log("Sample model trainset fields:");
      console.log(`   _id: ${sampleModel._id}`);
      console.log(`   number: ${sampleModel.number}`);
      console.log(`   status: ${sampleModel.status}`);
      console.log(`   bay_position: ${sampleModel.bay_position}`);
      console.log(`   mileage: ${sampleModel.mileage}`);
      console.log(`   last_cleaning: ${sampleModel.last_cleaning}`);
      console.log(`   branding_priority: ${sampleModel.branding_priority}`);
      console.log(
        `   availability_percentage: ${sampleModel.availability_percentage}`
      );
    }

    console.log("\n🎉 Trainset model test complete!");
  } catch (error) {
    console.error("❌ Error testing Trainset model:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

testTrainsetModel();
