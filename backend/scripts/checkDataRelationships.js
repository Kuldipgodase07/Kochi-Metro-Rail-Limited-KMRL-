import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const atlasUri =
  "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const checkDataRelationships = async () => {
  try {
    console.log("🔗 Checking Data Relationships in MongoDB Atlas...");
    console.log("=================================================");

    console.log("📡 Connecting to MongoDB Atlas...");
    await mongoose.connect(atlasUri);
    console.log("✅ Connected to MongoDB Atlas!");

    const db = mongoose.connection.db;

    // Get all trainsets first
    const trainsets = await db.collection("trainsets").find({}).toArray();
    console.log(`\n🚆 Found ${trainsets.length} trainsets in database`);

    if (trainsets.length === 0) {
      console.log("❌ No trainsets found - cannot check relationships");
      return;
    }

    // Check relationships for each trainset
    for (const trainset of trainsets) {
      console.log(
        `\n📊 Analyzing Trainset: ${
          trainset.trainset_id || trainset.number || trainset._id
        }`
      );
      console.log("=" + "=".repeat(50));

      const trainsetId = trainset.trainset_id || trainset._id.toString();

      // 1. Fitness Certificates
      const fitnessCerts = await db
        .collection("fitnesscertificates")
        .find({
          trainset_id: trainsetId,
        })
        .toArray();
      console.log(
        `📜 Fitness Certificates: ${fitnessCerts.length} related records`
      );

      if (fitnessCerts.length > 0) {
        const certTypes = [
          ...new Set(fitnessCerts.map((cert) => cert.certificate_type)),
        ];
        console.log(`   📋 Certificate Types: ${certTypes.join(", ")}`);

        const validCerts = fitnessCerts.filter(
          (cert) => cert.status === "valid"
        );
        const expiringCerts = fitnessCerts.filter(
          (cert) => cert.status === "expiring"
        );
        const expiredCerts = fitnessCerts.filter(
          (cert) => cert.status === "expired"
        );

        console.log(
          `   ✅ Valid: ${validCerts.length}, ⚠️ Expiring: ${expiringCerts.length}, ❌ Expired: ${expiredCerts.length}`
        );
      }

      // 2. Job Cards
      const jobCards = await db
        .collection("jobcards")
        .find({
          trainset_id: trainsetId,
        })
        .toArray();
      console.log(`🔧 Job Cards: ${jobCards.length} related records`);

      if (jobCards.length > 0) {
        const openJobs = jobCards.filter((job) => job.status === "open");
        const inProgressJobs = jobCards.filter(
          (job) => job.status === "in_progress"
        );
        const criticalJobs = jobCards.filter(
          (job) => job.priority === "emergency" || job.priority >= 4
        );

        console.log(
          `   📝 Open: ${openJobs.length}, 🔄 In Progress: ${inProgressJobs.length}, 🚨 Critical: ${criticalJobs.length}`
        );
      }

      // 3. Branding Campaigns
      const brandingCampaigns = await db
        .collection("brandingcampaigns")
        .find({
          trainset_id: trainsetId,
        })
        .toArray();
      console.log(
        `🎯 Branding Campaigns: ${brandingCampaigns.length} related records`
      );

      if (brandingCampaigns.length > 0) {
        const activeCampaigns = brandingCampaigns.filter(
          (campaign) => campaign.status === "active"
        );
        const criticalCampaigns = brandingCampaigns.filter(
          (campaign) => campaign.priority === "critical"
        );

        console.log(
          `   🟢 Active: ${activeCampaigns.length}, 🚨 Critical: ${criticalCampaigns.length}`
        );
      }

      // 4. Mileage Records
      const mileageRecords = await db
        .collection("mileagerecords")
        .find({
          trainset_id: trainsetId,
        })
        .toArray();
      console.log(
        `📏 Mileage Records: ${mileageRecords.length} related records`
      );

      if (mileageRecords.length > 0) {
        const totalKm = mileageRecords.reduce(
          (sum, record) => sum + (record.total_km_run || 0),
          0
        );
        console.log(`   📊 Total KM: ${totalKm.toLocaleString()} km`);
      }

      // 5. Cleaning Slots
      const cleaningSlots = await db
        .collection("cleaningslots")
        .find({
          trainset_id: trainsetId,
        })
        .toArray();
      console.log(`🧹 Cleaning Slots: ${cleaningSlots.length} related records`);

      if (cleaningSlots.length > 0) {
        const scheduledCleanings = cleaningSlots.filter(
          (slot) => slot.status === "scheduled"
        );
        const overdueCleanings = cleaningSlots.filter(
          (slot) => slot.status === "overdue"
        );

        console.log(
          `   📅 Scheduled: ${scheduledCleanings.length}, ⏰ Overdue: ${overdueCleanings.length}`
        );
      }

      // 6. Stabling Assignments
      const stablingAssignments = await db
        .collection("stablingassignments")
        .find({
          trainset_id: trainsetId,
        })
        .toArray();
      console.log(
        `🏗️ Stabling Assignments: ${stablingAssignments.length} related records`
      );

      if (stablingAssignments.length > 0) {
        const assignment = stablingAssignments[0];
        console.log(`   🏠 Depot: ${assignment.depot_name || "N/A"}`);
        console.log(`   📍 Position: ${assignment.position_order || "N/A"}`);
        console.log(
          `   💰 Shunting Cost: ${assignment.shunting_cost || "N/A"}`
        );
      }

      // 7. Passenger Flow (if any related to this trainset)
      const passengerFlow = await db
        .collection("passengerflow")
        .find({
          trainset_id: trainsetId,
        })
        .limit(5)
        .toArray();
      console.log(
        `👥 Passenger Flow: ${passengerFlow.length} related records (showing first 5)`
      );

      // Summary for this trainset
      const totalRelatedRecords =
        fitnessCerts.length +
        jobCards.length +
        brandingCampaigns.length +
        mileageRecords.length +
        cleaningSlots.length +
        stablingAssignments.length +
        passengerFlow.length;

      console.log(`\n📊 Relationship Summary for Trainset ${trainsetId}:`);
      console.log(`   🔗 Total Related Records: ${totalRelatedRecords}`);
      console.log(
        `   ✅ Data Integration: ${totalRelatedRecords > 0 ? "GOOD" : "POOR"}`
      );

      if (totalRelatedRecords === 0) {
        console.log(`   ⚠️  WARNING: No related data found for this trainset!`);
      }
    }

    // Overall relationship analysis
    console.log(`\n📈 Overall Data Relationship Analysis:`);
    console.log("=" + "=".repeat(50));

    // Check for orphaned records (records without corresponding trainsets)
    const allTrainsetIds = trainsets.map(
      (t) => t.trainset_id || t._id.toString()
    );

    const orphanedFitness = await db
      .collection("fitnesscertificates")
      .countDocuments({
        trainset_id: { $nin: allTrainsetIds },
      });

    const orphanedJobs = await db.collection("jobcards").countDocuments({
      trainset_id: { $nin: allTrainsetIds },
    });

    const orphanedBranding = await db
      .collection("brandingcampaigns")
      .countDocuments({
        trainset_id: { $nin: allTrainsetIds },
      });

    console.log(`🔍 Orphaned Records Analysis:`);
    console.log(
      `   📜 Fitness Certificates: ${orphanedFitness} orphaned records`
    );
    console.log(`   🔧 Job Cards: ${orphanedJobs} orphaned records`);
    console.log(
      `   🎯 Branding Campaigns: ${orphanedBranding} orphaned records`
    );

    // Data consistency check
    const totalFitness = await db
      .collection("fitnesscertificates")
      .countDocuments();
    const totalJobs = await db.collection("jobcards").countDocuments();
    const totalBranding = await db
      .collection("brandingcampaigns")
      .countDocuments();

    console.log(`\n📊 Data Consistency Summary:`);
    console.log(`   🚆 Trainsets: ${trainsets.length}`);
    console.log(
      `   📜 Fitness Certificates: ${totalFitness} (${orphanedFitness} orphaned)`
    );
    console.log(`   🔧 Job Cards: ${totalJobs} (${orphanedJobs} orphaned)`);
    console.log(
      `   🎯 Branding Campaigns: ${totalBranding} (${orphanedBranding} orphaned)`
    );

    const orphanedTotal = orphanedFitness + orphanedJobs + orphanedBranding;
    const totalRecords = totalFitness + totalJobs + totalBranding;
    const consistencyPercentage = (
      ((totalRecords - orphanedTotal) / totalRecords) *
      100
    ).toFixed(1);

    console.log(`\n🎯 Data Relationship Quality: ${consistencyPercentage}%`);

    if (consistencyPercentage >= 90) {
      console.log(`✅ EXCELLENT: Data is well-integrated and related`);
    } else if (consistencyPercentage >= 70) {
      console.log(`⚠️  GOOD: Most data is related, some orphaned records`);
    } else {
      console.log(
        `❌ POOR: Many orphaned records, data relationships need improvement`
      );
    }
  } catch (error) {
    console.error("❌ Error checking data relationships:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

checkDataRelationships();
