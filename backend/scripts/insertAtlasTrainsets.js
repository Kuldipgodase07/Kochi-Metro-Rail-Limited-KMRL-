import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

const atlasUri =
  "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const insertAtlasTrainsets = async () => {
  try {
    console.log("🚆 Inserting Trainsets to MongoDB Atlas...");
    console.log("==========================================");

    console.log("📡 Connecting to MongoDB Atlas...");
    await mongoose.connect(atlasUri);
    console.log("✅ Connected to MongoDB Atlas!");

    const db = mongoose.connection.db;

    // Read trainsets data
    const dataPath = path.join(process.cwd(), "data", "trainsets.json");
    console.log(`📁 Reading trainsets from: ${dataPath}`);

    if (!fs.existsSync(dataPath)) {
      console.log("⚠️  trainsets.json not found, creating sample data...");

      // Create sample trainsets data
      const sampleTrainsets = [];
      for (let i = 1; i <= 25; i++) {
        sampleTrainsets.push({
          trainset_id: i,
          rake_number: `R${1000 + i}`,
          make_model: i <= 10 ? "Hyundai Rotem" : i <= 20 ? "BEML" : "Alstom",
          year_commissioned: 2019 + (i % 3),
          current_status:
            i <= 20 ? "in_service" : i <= 23 ? "standby" : "maintenance",
          home_depot: i <= 12 ? "Depot A" : "Depot B",
          mileage: 30000 + i * 2000,
          last_cleaning: new Date(Date.now() - (i % 7) * 24 * 60 * 60 * 1000),
          branding_priority: Math.floor(Math.random() * 10) + 1,
          availability_percentage: 85 + (i % 15),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Insert sample trainsets
      console.log("🧹 Clearing existing trainsets...");
      await db.collection("trainsets").deleteMany({});

      console.log("📝 Inserting sample trainsets...");
      const result = await db
        .collection("trainsets")
        .insertMany(sampleTrainsets);
      console.log(`✅ Inserted ${result.insertedCount} sample trainsets`);
    } else {
      // Read from existing file
      const trainsets = JSON.parse(fs.readFileSync(dataPath, "utf8"));

      console.log("🧹 Clearing existing trainsets...");
      await db.collection("trainsets").deleteMany({});

      console.log("📝 Inserting trainsets from file...");
      const result = await db.collection("trainsets").insertMany(trainsets);
      console.log(`✅ Inserted ${result.insertedCount} trainsets from file`);
    }

    // Verify insertion
    const totalTrainsets = await db.collection("trainsets").countDocuments();
    console.log(`\n📊 Total trainsets in Atlas: ${totalTrainsets}`);

    // Show sample trainsets
    const sampleTrainsets = await db
      .collection("trainsets")
      .find({})
      .limit(5)
      .toArray();
    console.log("\n🚆 Sample trainsets:");
    sampleTrainsets.forEach((trainset, index) => {
      console.log(
        `   ${index + 1}. ${trainset.rake_number} - ${trainset.make_model} - ${
          trainset.current_status
        }`
      );
    });

    console.log("\n🎉 Trainsets insertion completed successfully!");
  } catch (error) {
    console.error("❌ Error inserting trainsets:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

// Run the insertion
insertAtlasTrainsets();
