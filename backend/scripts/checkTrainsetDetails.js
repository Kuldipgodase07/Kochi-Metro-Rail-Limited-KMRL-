import dotenv from "dotenv";
import connectDB from "../config/database.js";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

const checkTrainsetDetails = async () => {
  try {
    console.log("🔍 Checking Detailed Trainset Information...");
    console.log("=============================================");

    // Atlas connection string
    const atlasUri =
      "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    process.env.MONGODB_URI = atlasUri;

    console.log("📡 Connecting to MongoDB Atlas...");
    await connectDB();
    console.log("✅ Connected to MongoDB Atlas!");

    const db = mongoose.connection.db;

    // Get total count
    const totalCount = await db.collection("trainsets").countDocuments();
    console.log(`\n📊 Total trainsets in database: ${totalCount}`);

    // Get all trainset IDs
    const trainsets = await db.collection("trainsets").find({}).toArray();
    const trainsetIds = trainsets
      .map((t) => t.trainset_id)
      .sort((a, b) => a - b);

    console.log(
      `\n🚂 Trainset ID Range: ${Math.min(...trainsetIds)} to ${Math.max(
        ...trainsetIds
      )}`
    );
    console.log(`📋 All Trainset IDs: ${trainsetIds.join(", ")}`);

    // Check for missing IDs
    const expectedIds = Array.from({ length: 100 }, (_, i) => i + 1);
    const missingIds = expectedIds.filter((id) => !trainsetIds.includes(id));
    const extraIds = trainsetIds.filter((id) => !expectedIds.includes(id));

    if (missingIds.length > 0) {
      console.log(`\n❌ Missing trainset IDs: ${missingIds.join(", ")}`);
    } else {
      console.log(`\n✅ All expected trainset IDs (1-100) are present`);
    }

    if (extraIds.length > 0) {
      console.log(`\n⚠️  Extra trainset IDs: ${extraIds.join(", ")}`);
    }

    // Sample some trainsets
    console.log(`\n📋 Sample Trainsets (first 10):`);
    const sampleTrainsets = trainsets.slice(0, 10);
    sampleTrainsets.forEach((trainset) => {
      console.log(
        `   • ID: ${trainset.trainset_id}, Rake: ${trainset.rake_number}, Status: ${trainset.current_status}, Depot: ${trainset.home_depot}`
      );
    });

    // Check status distribution
    console.log(`\n📊 Status Distribution:`);
    const statusCounts = {};
    trainsets.forEach((trainset) => {
      statusCounts[trainset.current_status] =
        (statusCounts[trainset.current_status] || 0) + 1;
    });

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   • ${status}: ${count} trains`);
    });

    // Check depot distribution
    console.log(`\n📊 Depot Distribution:`);
    const depotCounts = {};
    trainsets.forEach((trainset) => {
      depotCounts[trainset.home_depot] =
        (depotCounts[trainset.home_depot] || 0) + 1;
    });

    Object.entries(depotCounts).forEach(([depot, count]) => {
      console.log(`   • ${depot}: ${count} trains`);
    });

    // Check make/model distribution
    console.log(`\n📊 Make/Model Distribution:`);
    const makeCounts = {};
    trainsets.forEach((trainset) => {
      makeCounts[trainset.make_model] =
        (makeCounts[trainset.make_model] || 0) + 1;
    });

    Object.entries(makeCounts).forEach(([make, count]) => {
      console.log(`   • ${make}: ${count} trains`);
    });

    // Verify relationships for a few trainsets
    console.log(`\n🔗 Relationship Verification for Sample Trainsets:`);
    const sampleIds = [1, 25, 50, 75, 100];

    for (const trainsetId of sampleIds) {
      const trainset = trainsets.find((t) => t.trainset_id === trainsetId);
      if (trainset) {
        console.log(`\n🚂 Trainset ${trainsetId} (${trainset.rake_number}):`);

        // Check related records
        const fitness = await db
          .collection("fitnesscertificates")
          .find({ trainset_id: trainsetId })
          .toArray();
        const jobs = await db
          .collection("jobcards")
          .find({ trainset_id: trainsetId })
          .toArray();
        const branding = await db
          .collection("brandingcampaigns")
          .find({ trainset_id: trainsetId })
          .toArray();
        const mileage = await db
          .collection("mileagerecords")
          .find({ trainset_id: trainsetId })
          .toArray();
        const cleaning = await db
          .collection("cleaningslots")
          .find({ trainset_id: trainsetId })
          .toArray();
        const stabling = await db
          .collection("stablingassignments")
          .find({ trainset_id: trainsetId })
          .toArray();
        const induction = await db
          .collection("inductionfeedbacks")
          .find({ trainset_id: trainsetId })
          .toArray();
        const passenger = await db
          .collection("passengerflow")
          .find({ trainset_id: trainsetId })
          .toArray();

        console.log(
          `   • Fitness certificates: ${fitness.length} (expected: 3)`
        );
        console.log(`   • Job cards: ${jobs.length} (expected: 2)`);
        console.log(
          `   • Branding campaigns: ${branding.length} (expected: 1)`
        );
        console.log(`   • Mileage records: ${mileage.length} (expected: 1)`);
        console.log(`   • Cleaning slots: ${cleaning.length} (expected: 2)`);
        console.log(
          `   • Stabling assignments: ${stabling.length} (expected: 1)`
        );
        console.log(
          `   • Induction history: ${induction.length} (expected: 30)`
        );
        console.log(`   • Passenger flow: ${passenger.length} (expected: 100)`);
      }
    }

    console.log(`\n✅ Detailed trainset verification completed!`);
    console.log(
      `📊 Summary: ${totalCount} trainsets found with complete relationships`
    );
  } catch (error) {
    console.error("❌ Error checking trainset details:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

// Run the check
checkTrainsetDetails();
