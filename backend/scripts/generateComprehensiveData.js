import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const atlasUri =
  "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const generateComprehensiveData = async () => {
  try {
    console.log("🚀 Generating Comprehensive KMRL Data...");
    console.log("=========================================");

    console.log("📡 Connecting to MongoDB Atlas...");
    await mongoose.connect(atlasUri);
    console.log("✅ Connected to MongoDB Atlas!");

    const db = mongoose.connection.db;

    // Clear all existing data
    console.log("\n🧹 Clearing existing data...");
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({});
      console.log(`✅ Cleared ${collection.name}`);
    }

    // Generate 25 trainsets with realistic scenarios
    console.log("\n🚆 Generating 25 Trainsets...");
    const trainsets = [];
    const makes = ["Hyundai Rotem", "BEML", "Alstom"];
    const depots = ["Depot A", "Depot B"];

    for (let i = 1; i <= 25; i++) {
      const make = makes[(i - 1) % 3];
      const depot = i <= 12 ? "Depot A" : "Depot B";

      // Create realistic status distribution
      let status = "in_service";
      let availability = 85 + Math.floor(Math.random() * 15);

      if (i <= 2) {
        status = "critical";
        availability = 30 + Math.floor(Math.random() * 20);
      } else if (i <= 5) {
        status = "maintenance";
        availability = 60 + Math.floor(Math.random() * 25);
      } else if (i <= 8) {
        status = "standby";
        availability = 80 + Math.floor(Math.random() * 15);
      }

      const trainset = {
        trainset_id: i,
        number: i,
        rake_number: `R${1000 + i}`,
        make_model: make,
        year_commissioned: 2019 + (i % 4),
        current_status: status,
        home_depot: depot,
        mileage: 20000 + i * 2000 + Math.floor(Math.random() * 10000),
        last_cleaning: new Date(Date.now() - (i % 10) * 24 * 60 * 60 * 1000),
        branding_priority: Math.floor(Math.random() * 10) + 1,
        availability_percentage: availability,
        bay_position: Math.floor(Math.random() * 20) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      trainsets.push(trainset);
    }

    await db.collection("trainsets").insertMany(trainsets);
    console.log(`✅ Generated ${trainsets.length} trainsets`);

    // Generate fitness certificates for all trainsets
    console.log("\n📜 Generating Fitness Certificates...");
    const fitnessCerts = [];
    const certTypes = ["rolling_stock", "signalling", "telecom"];

    for (const trainset of trainsets) {
      for (const certType of certTypes) {
        const daysFromNow = Math.floor(Math.random() * 365) - 30;
        const validFrom = new Date(
          Date.now() + daysFromNow * 24 * 60 * 60 * 1000
        );
        const validTo = new Date(
          validFrom.getTime() +
            (365 + Math.floor(Math.random() * 365)) * 24 * 60 * 60 * 1000
        );

        let status = "valid";
        if (validTo < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
          status = "expiring";
        }
        if (validTo < new Date()) {
          status = "expired";
        }

        fitnessCerts.push({
          trainset_id: trainset.trainset_id,
          certificate_type: certType,
          certificate_number: `FC-${
            trainset.trainset_id
          }-${certType.toUpperCase()}-${Date.now()}`,
          issued_by:
            certType === "rolling_stock"
              ? "Rolling Stock Dept"
              : certType === "signalling"
              ? "Signalling Dept"
              : "Telecom Dept",
          valid_from: validFrom,
          valid_to: validTo,
          status: status,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await db.collection("fitnesscertificates").insertMany(fitnessCerts);
    console.log(`✅ Generated ${fitnessCerts.length} fitness certificates`);

    // Generate job cards with realistic scenarios
    console.log("\n🔧 Generating Job Cards...");
    const jobCards = [];
    const jobTypes = [
      "Preventive Maintenance",
      "Corrective Maintenance",
      "Emergency Repair",
      "Inspection",
      "Overhaul",
    ];
    const priorities = ["low", "medium", "high", "emergency"];

    for (const trainset of trainsets) {
      const numJobs = Math.floor(Math.random() * 3) + 1; // 1-3 jobs per trainset

      for (let j = 0; j < numJobs; j++) {
        const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
        const priority =
          priorities[Math.floor(Math.random() * priorities.length)];
        const status =
          priority === "emergency"
            ? "open"
            : Math.random() > 0.7
            ? "in_progress"
            : "open";

        jobCards.push({
          trainset_id: trainset.trainset_id,
          job_card_number: `JC-${trainset.trainset_id}-${Date.now()}-${j}`,
          job_type: jobType,
          description: `${jobType} for ${trainset.rake_number}`,
          priority: priority,
          status: status,
          assigned_to: `Technician ${Math.floor(Math.random() * 10) + 1}`,
          estimated_duration_hours: Math.floor(Math.random() * 48) + 4,
          created_at: new Date(
            Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
          ),
          updated_at: new Date(),
          due_date: new Date(
            Date.now() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000
          ),
        });
      }
    }

    await db.collection("jobcards").insertMany(jobCards);
    console.log(`✅ Generated ${jobCards.length} job cards`);

    // Generate branding campaigns
    console.log("\n🎯 Generating Branding Campaigns...");
    const brandingCampaigns = [];
    const advertisers = [
      "Coca-Cola",
      "Pepsi",
      "McDonald's",
      "KFC",
      "Amazon",
      "Flipkart",
      "Reliance",
      "Tata",
    ];

    for (let i = 0; i < 50; i++) {
      const trainsetId = Math.floor(Math.random() * 25) + 1;
      const advertiser =
        advertisers[Math.floor(Math.random() * advertisers.length)];
      const startDate = new Date(
        Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000
      );
      const endDate = new Date(
        startDate.getTime() +
          (30 + Math.floor(Math.random() * 60)) * 24 * 60 * 60 * 1000
      );

      brandingCampaigns.push({
        trainset_id: trainsetId,
        campaign_id: `BC-${Date.now()}-${i}`,
        advertiser_name: advertiser,
        campaign_name: `${advertiser} Branding Campaign`,
        campaign_start: startDate,
        campaign_end: endDate,
        exposure_target_hours: 200 + Math.floor(Math.random() * 300),
        exposure_achieved_hours: Math.floor(Math.random() * 400),
        priority: Math.random() > 0.8 ? "critical" : "normal",
        status: endDate > new Date() ? "active" : "completed",
        revenue_value: 50000 + Math.floor(Math.random() * 200000),
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    await db.collection("brandingcampaigns").insertMany(brandingCampaigns);
    console.log(`✅ Generated ${brandingCampaigns.length} branding campaigns`);

    // Generate mileage records
    console.log("\n📏 Generating Mileage Records...");
    const mileageRecords = [];

    for (const trainset of trainsets) {
      const baseKm = 20000 + trainset.trainset_id * 2000;
      const totalKm = baseKm + Math.floor(Math.random() * 20000);

      mileageRecords.push({
        trainset_id: trainset.trainset_id,
        record_date: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ),
        total_km_run: totalKm,
        daily_km: Math.floor(Math.random() * 200) + 50,
        route_type: Math.random() > 0.5 ? "urban" : "suburban",
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    await db.collection("mileagerecords").insertMany(mileageRecords);
    console.log(`✅ Generated ${mileageRecords.length} mileage records`);

    // Generate cleaning slots
    console.log("\n🧹 Generating Cleaning Slots...");
    const cleaningSlots = [];

    for (const trainset of trainsets) {
      const numSlots = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < numSlots; i++) {
        const slotDate = new Date(
          Date.now() +
            (i * 7 + Math.floor(Math.random() * 7)) * 24 * 60 * 60 * 1000
        );
        const status = slotDate < new Date() ? "overdue" : "scheduled";

        cleaningSlots.push({
          trainset_id: trainset.trainset_id,
          slot_id: `CS-${trainset.trainset_id}-${Date.now()}-${i}`,
          scheduled_date_time: slotDate,
          cleaning_type:
            Math.random() > 0.5 ? "deep_cleaning" : "regular_cleaning",
          assigned_crew: `Crew ${Math.floor(Math.random() * 5) + 1}`,
          status: status,
          estimated_duration_hours: Math.floor(Math.random() * 8) + 2,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    await db.collection("cleaningslots").insertMany(cleaningSlots);
    console.log(`✅ Generated ${cleaningSlots.length} cleaning slots`);

    // Generate stabling assignments
    console.log("\n🏗️ Generating Stabling Assignments...");
    const stablingAssignments = [];

    for (const trainset of trainsets) {
      const depot = trainset.home_depot;
      const position = Math.floor(Math.random() * 20) + 1;

      stablingAssignments.push({
        trainset_id: trainset.trainset_id,
        depot_name: depot,
        bay_number: `Bay-${position}`,
        position_order: position,
        occupied: Math.random() > 0.3,
        shunting_cost: Math.floor(Math.random() * 100) + 10,
        access_difficulty: Math.random() > 0.5 ? "easy" : "moderate",
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    await db.collection("stablingassignments").insertMany(stablingAssignments);
    console.log(
      `✅ Generated ${stablingAssignments.length} stabling assignments`
    );

    // Generate passenger flow data
    console.log("\n👥 Generating Passenger Flow Data...");
    const passengerFlow = [];

    for (let i = 0; i < 1000; i++) {
      const trainsetId = Math.floor(Math.random() * 25) + 1;
      const date = new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
      );

      passengerFlow.push({
        trainset_id: trainsetId,
        date: date,
        peak_hour_passengers: Math.floor(Math.random() * 500) + 100,
        off_peak_passengers: Math.floor(Math.random() * 200) + 50,
        total_passengers: Math.floor(Math.random() * 700) + 150,
        route_segment: `Segment-${Math.floor(Math.random() * 10) + 1}`,
        weather_condition: Math.random() > 0.5 ? "normal" : "rainy",
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    await db.collection("passengerflow").insertMany(passengerFlow);
    console.log(`✅ Generated ${passengerFlow.length} passenger flow records`);

    // Generate user accounts
    console.log("\n👤 Generating User Accounts...");
    const users = [
      {
        username: "super_admin",
        email: "admin@trainplanwise.com",
        password: "$2b$10$example_hash", // This would be hashed in real implementation
        fullName: "Super Administrator",
        role: "super_admin",
        status: "approved",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "kmrl_admin",
        email: "admin@kmrl.com",
        password: "$2b$10$example_hash",
        fullName: "KMRL Administrator",
        role: "admin",
        status: "approved",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "operations_manager",
        email: "ops@kmrl.com",
        password: "$2b$10$example_hash",
        fullName: "Operations Manager",
        role: "user",
        status: "approved",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await db.collection("users").insertMany(users);
    console.log(`✅ Generated ${users.length} user accounts`);

    // Final summary
    console.log("\n📊 Comprehensive Data Generation Summary:");
    console.log("==========================================");
    console.log(`🚆 Trainsets: ${trainsets.length}`);
    console.log(`📜 Fitness Certificates: ${fitnessCerts.length}`);
    console.log(`🔧 Job Cards: ${jobCards.length}`);
    console.log(`🎯 Branding Campaigns: ${brandingCampaigns.length}`);
    console.log(`📏 Mileage Records: ${mileageRecords.length}`);
    console.log(`🧹 Cleaning Slots: ${cleaningSlots.length}`);
    console.log(`🏗️ Stabling Assignments: ${stablingAssignments.length}`);
    console.log(`👥 Passenger Flow: ${passengerFlow.length}`);
    console.log(`👤 Users: ${users.length}`);

    console.log("\n🎉 Comprehensive data generation completed!");
    console.log("✅ All day-to-day scenarios covered");
    console.log("🚀 Database ready for realistic scheduling");
  } catch (error) {
    console.error("❌ Error generating comprehensive data:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

generateComprehensiveData();
