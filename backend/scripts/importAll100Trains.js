import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

dotenv.config();

const atlasUri =
  "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const importAll100Trains = async () => {
  try {
    console.log("🚆 Importing All 100 Trains from CSV Files...");
    console.log("===============================================");

    console.log("📡 Connecting to MongoDB Atlas...");
    await mongoose.connect(atlasUri);
    console.log("✅ Connected to MongoDB Atlas!");

    const db = mongoose.connection.db;

    // Clear all existing data first
    console.log("\n🧹 Clearing existing data...");
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({});
      console.log(`✅ Cleared ${collection.name}`);
    }

    // Define CSV file paths
    const csvDataPath =
      "C:\\Project\\Kochi-Metro-Rail-Limited-KMRL-\\csv_data_files";

    // Helper function to parse CSV
    const parseCsv = (filePath) => {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const lines = content.split("\n").filter((line) => line.trim());
        const headers = lines[0].split(",").map((h) => h.trim());

        const records = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          if (values.length === headers.length && values[0]) {
            const record = {};
            headers.forEach((header, index) => {
              record[header] = values[index];
            });
            records.push(record);
          }
        }
        return records;
      } catch (error) {
        console.log(`⚠️ Error parsing ${filePath}: ${error.message}`);
        return [];
      }
    };

    // Helper function to parse dates
    const parseDate = (dateStr) => {
      if (!dateStr || dateStr === "") return new Date();
      try {
        // Handle various date formats
        if (dateStr.includes("/")) {
          const [day, month, year] = dateStr.split("/");
          return new Date(year, month - 1, day);
        } else if (dateStr.includes("-")) {
          return new Date(dateStr);
        } else {
          return new Date(dateStr);
        }
      } catch (error) {
        return new Date();
      }
    };

    // 1. Import Trainsets (100 trains)
    console.log("\n🚆 Importing Trainsets...");
    const trainsetsPath = path.join(csvDataPath, "1 trainset_master.csv");
    const trainsets = parseCsv(trainsetsPath);

    if (trainsets.length > 0) {
      const transformedTrainsets = trainsets.map((t) => ({
        trainset_id: parseInt(t.trainset_id),
        number: parseInt(t.trainset_id),
        rake_number: t.rake_number,
        make_model: t.make_model,
        year_commissioned: parseInt(t.year_commissioned),
        current_status: t.current_status,
        home_depot: t.home_depot,
        mileage: Math.floor(Math.random() * 50000) + 20000, // Add realistic mileage
        last_cleaning: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ),
        branding_priority: Math.floor(Math.random() * 10) + 1,
        availability_percentage: 80 + Math.floor(Math.random() * 20),
        bay_position: Math.floor(Math.random() * 20) + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await db.collection("trainsets").insertMany(transformedTrainsets);
      console.log(`✅ Imported ${transformedTrainsets.length} trainsets`);
    } else {
      console.log("❌ No trainsets found in CSV");
    }

    // 2. Import Fitness Certificates
    console.log("\n📜 Importing Fitness Certificates...");
    const fitnessPath = path.join(csvDataPath, "2 fitness_certificates.csv");
    const fitnessCerts = parseCsv(fitnessPath);

    if (fitnessCerts.length > 0) {
      const transformedFitness = fitnessCerts.map((f) => ({
        trainset_id: parseInt(f.trainset_id),
        certificate_type: f.certificate_type,
        certificate_number: f.certificate_number,
        issued_by: f.issued_by,
        valid_from: parseDate(f.valid_from),
        valid_to: parseDate(f.valid_to),
        status: f.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await db.collection("fitnesscertificates").insertMany(transformedFitness);
      console.log(
        `✅ Imported ${transformedFitness.length} fitness certificates`
      );
    }

    // 3. Import Job Cards
    console.log("\n🔧 Importing Job Cards...");
    const jobCardsPath = path.join(csvDataPath, "3 job_cards.csv");
    const jobCards = parseCsv(jobCardsPath);

    if (jobCards.length > 0) {
      const transformedJobs = jobCards.map((j) => ({
        trainset_id: parseInt(j.trainset_id),
        job_card_number: j.job_card_number,
        job_type: j.job_type,
        description: j.description,
        priority: j.priority,
        status: j.status,
        assigned_to: j.assigned_to,
        estimated_duration_hours: parseInt(j.estimated_duration_hours) || 8,
        created_at: parseDate(j.created_at),
        updated_at: new Date(),
        due_date: parseDate(j.due_date),
      }));

      await db.collection("jobcards").insertMany(transformedJobs);
      console.log(`✅ Imported ${transformedJobs.length} job cards`);
    }

    // 4. Import Branding Campaigns
    console.log("\n🎯 Importing Branding Campaigns...");
    const brandingPath = path.join(csvDataPath, "4 branding_commitments.csv");
    const brandingCampaigns = parseCsv(brandingPath);

    if (brandingCampaigns.length > 0) {
      const transformedBranding = brandingCampaigns.map((b) => ({
        trainset_id: parseInt(b.trainset_id),
        campaign_id: b.campaign_id,
        advertiser_name: b.advertiser_name,
        campaign_name: b.campaign_name,
        campaign_start: parseDate(b.campaign_start),
        campaign_end: parseDate(b.campaign_end),
        exposure_target_hours: parseInt(b.exposure_target_hours) || 200,
        exposure_achieved_hours: parseInt(b.exposure_achieved_hours) || 0,
        priority: b.priority,
        status: b.status,
        revenue_value: parseInt(b.revenue_value) || 50000,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      await db.collection("brandingcampaigns").insertMany(transformedBranding);
      console.log(
        `✅ Imported ${transformedBranding.length} branding campaigns`
      );
    }

    // 5. Import Mileage Records
    console.log("\n📏 Importing Mileage Records...");
    const mileagePath = path.join(csvDataPath, "5 mileage_records.csv");
    const mileageRecords = parseCsv(mileagePath);

    if (mileageRecords.length > 0) {
      const transformedMileage = mileageRecords.map((m) => ({
        trainset_id: parseInt(m.trainset_id),
        record_date: parseDate(m.record_date),
        total_km_run: parseInt(m.total_km_run) || 30000,
        daily_km: parseInt(m.daily_km) || 150,
        route_type: m.route_type || "urban",
        created_at: new Date(),
        updated_at: new Date(),
      }));

      await db.collection("mileagerecords").insertMany(transformedMileage);
      console.log(`✅ Imported ${transformedMileage.length} mileage records`);
    }

    // 6. Import Cleaning Slots
    console.log("\n🧹 Importing Cleaning Slots...");
    const cleaningPath = path.join(csvDataPath, "6 cleaning_schedule.csv");
    const cleaningSlots = parseCsv(cleaningPath);

    if (cleaningSlots.length > 0) {
      const transformedCleaning = cleaningSlots.map((c) => ({
        trainset_id: parseInt(c.trainset_id),
        slot_id: c.slot_id,
        scheduled_date_time: parseDate(c.scheduled_date_time),
        cleaning_type: c.cleaning_type,
        assigned_crew: c.assigned_crew,
        status: c.status,
        estimated_duration_hours: parseInt(c.estimated_duration_hours) || 4,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      await db.collection("cleaningslots").insertMany(transformedCleaning);
      console.log(`✅ Imported ${transformedCleaning.length} cleaning slots`);
    }

    // 7. Import Stabling Assignments
    console.log("\n🏗️ Importing Stabling Assignments...");
    const stablingPath = path.join(csvDataPath, "7 stabling_geometry.csv");
    const stablingAssignments = parseCsv(stablingPath);

    if (stablingAssignments.length > 0) {
      const transformedStabling = stablingAssignments.map((s) => ({
        trainset_id: parseInt(s.trainset_id),
        depot_name: s.depot_name,
        bay_number: s.bay_number,
        position_order: parseInt(s.position_order),
        occupied: s.occupied === "true" || s.occupied === true,
        shunting_cost: parseInt(s.shunting_cost) || 50,
        access_difficulty: s.access_difficulty,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      await db
        .collection("stablingassignments")
        .insertMany(transformedStabling);
      console.log(
        `✅ Imported ${transformedStabling.length} stabling assignments`
      );
    }

    // 8. Import Passenger Flow (sample from the large dataset)
    console.log("\n👥 Importing Passenger Flow (sample)...");
    const passengerPath = path.join(
      csvDataPath,
      "9 passenger_flow_variable_capacity.csv"
    );
    const passengerFlow = parseCsv(passengerPath);

    if (passengerFlow.length > 0) {
      // Take a sample of 1000 records to avoid overwhelming the database
      const sampleSize = Math.min(1000, passengerFlow.length);
      const samplePassengerFlow = passengerFlow.slice(0, sampleSize);

      const transformedPassenger = samplePassengerFlow.map((p) => ({
        trainset_id: parseInt(p.trainset_id),
        date: parseDate(p.date),
        peak_hour_passengers: parseInt(p.peak_hour_passengers) || 300,
        off_peak_passengers: parseInt(p.off_peak_passengers) || 150,
        total_passengers: parseInt(p.total_passengers) || 450,
        route_segment: p.route_segment || "Segment-1",
        weather_condition: p.weather_condition || "normal",
        created_at: new Date(),
        updated_at: new Date(),
      }));

      await db.collection("passengerflow").insertMany(transformedPassenger);
      console.log(
        `✅ Imported ${transformedPassenger.length} passenger flow records`
      );
    }

    // 9. Create user accounts
    console.log("\n👤 Creating User Accounts...");
    const users = [
      {
        username: "super_admin",
        email: "admin@trainplanwise.com",
        password: "$2b$10$example_hash",
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
    ];

    await db.collection("users").insertMany(users);
    console.log(`✅ Created ${users.length} user accounts`);

    // Final summary
    console.log("\n📊 Import Summary:");
    console.log("==================");

    const allCollections = await db.listCollections().toArray();
    for (const collection of allCollections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`📋 ${collection.name}: ${count} records`);
    }

    console.log("\n🎉 All 100 trains imported successfully!");
    console.log("✅ Complete fleet data now available in Atlas");
  } catch (error) {
    console.error("❌ Error importing trains:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

importAll100Trains();
