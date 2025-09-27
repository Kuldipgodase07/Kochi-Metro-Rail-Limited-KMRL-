import dotenv from "dotenv";
import connectDB from "../config/database.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const importCsvToAtlas = async () => {
  try {
    console.log("📊 Importing CSV Data to MongoDB Atlas...");
    console.log("==========================================");

    // Atlas connection string
    const atlasUri =
      "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    process.env.MONGODB_URI = atlasUri;

    console.log("📡 Connecting to MongoDB Atlas...");

    // Connect to Atlas
    await connectDB();

    console.log("✅ Connected to MongoDB Atlas!");

    // Get database connection
    const db = mongoose.connection.db;

    // CSV file mappings
    const csvMappings = [
      {
        file: "1 trainset_master.csv",
        collection: "trainsets",
        description: "Trainset Master Data",
        transform: (row) => ({
          trainset_id: parseInt(row.trainset_id),
          rake_number: row.rake_number,
          make_model: row.make_model,
          year_commissioned: parseInt(row.year_commissioned),
          current_status: row.current_status,
          home_depot: row.home_depot,
          created_at: new Date(),
          updated_at: new Date(),
        }),
      },
      {
        file: "2 fitness_certificates.csv",
        collection: "fitnesscertificates",
        description: "Fitness Certificates",
        transform: (row) => ({
          certificate_id: parseInt(row.certificate_id),
          trainset_id: parseInt(row.trainset_id),
          certificate_type: row.certificate_type,
          valid_from: new Date(row.valid_from.split("-").reverse().join("-")),
          valid_to: new Date(row.valid_to.split("-").reverse().join("-")),
          status: row.status,
          issued_by_department: row.issued_by_department,
          remarks: row.remarks,
          created_at: new Date(),
          updated_at: new Date(),
        }),
      },
      {
        file: "3 job_cards.csv",
        collection: "jobcards",
        description: "Job Cards",
        transform: (row) => ({
          jobcard_id: parseInt(row.jobcard_id),
          trainset_id: parseInt(row.trainset_id),
          fault_category: row.fault_category,
          description: row.description,
          status: row.status,
          priority: row.priority,
          created_on: new Date(row.created_on.split("-").reverse().join("-")),
          expected_completion_date: new Date(
            row.expected_completion_date.split("-").reverse().join("-")
          ),
          responsible_team: row.responsible_team,
          created_at: new Date(),
          updated_at: new Date(),
        }),
      },
      {
        file: "4 branding_commitments.csv",
        collection: "brandingcampaigns",
        description: "Branding Campaigns",
        transform: (row) => ({
          branding_id: parseInt(row.branding_id),
          trainset_id: parseInt(row.trainset_id),
          advertiser_name: row.advertiser_name,
          campaign_code: row.campaign_code,
          exposure_target_hours: parseInt(row.exposure_target_hours),
          exposure_achieved_hours: parseInt(row.exposure_achieved_hours),
          campaign_start: new Date(
            row.campaign_start.split("-").reverse().join("-")
          ),
          campaign_end: new Date(
            row.campaign_end.split("-").reverse().join("-")
          ),
          priority: row.priority,
          penalty_clause: row.penalty_clause === "Y",
          created_at: new Date(),
          updated_at: new Date(),
        }),
      },
      {
        file: "5 mileage_records.csv",
        collection: "mileagerecords",
        description: "Mileage Records",
        transform: (row) => ({
          mileage_id: parseInt(row.mileage_id),
          trainset_id: parseInt(row.trainset_id),
          total_km_run: parseInt(row.total_km_run),
          km_since_last_POH: parseInt(row.km_since_last_POH),
          km_since_last_IOH: parseInt(row.km_since_last_IOH),
          km_since_last_trip_maintenance: parseInt(
            row.km_since_last_trip_maintenance
          ),
          bogie_condition_index: parseInt(row.bogie_condition_index),
          brake_pad_wear_level: parseInt(row.brake_pad_wear_level),
          hvac_runtime_hours: parseInt(row.hvac_runtime_hours),
          last_updated: new Date(
            row.last_updated.split("-").reverse().join("-")
          ),
          created_at: new Date(),
          updated_at: new Date(),
        }),
      },
      {
        file: "6 cleaning_schedule.csv",
        collection: "cleaningslots",
        description: "Cleaning Schedule",
        transform: (row) => ({
          cleaning_id: parseInt(row.cleaning_id),
          trainset_id: parseInt(row.trainset_id),
          scheduled_date_time: new Date(
            row.scheduled_date_time.split("-").reverse().join("-")
          ),
          cleaning_type: row.cleaning_type,
          status: row.status,
          bay_number: parseInt(row.bay_number),
          staff_assigned: row.staff_assigned,
          remarks: row.remarks,
          created_at: new Date(),
          updated_at: new Date(),
        }),
      },
      {
        file: "7 stabling_geometry.csv",
        collection: "stablingassignments",
        description: "Stabling Geometry",
        transform: (row) => ({
          bay_id: parseInt(row.bay_id),
          trainset_id: parseInt(row.trainset_id),
          depot_name: row.depot_name,
          line_name: row.line_name,
          position_order: parseInt(row.position_order),
          occupied: row.occupied === "Y",
          remarks: row.remarks,
          created_at: new Date(),
          updated_at: new Date(),
        }),
      },
      {
        file: "8 induction_history.csv",
        collection: "inductionfeedbacks",
        description: "Induction History",
        transform: (row) => ({
          induction_id: parseInt(row.induction_id),
          trainset_id: parseInt(row.trainset_id),
          induction_date: new Date(
            row.induction_date.split("-").reverse().join("-")
          ),
          route_assigned: row.route_assigned,
          performance_score: parseFloat(row.performance_score),
          incidents: parseInt(row.incidents),
          punctuality: parseFloat(row.punctuality),
          feedback: row.feedback,
          created_at: new Date(),
          updated_at: new Date(),
        }),
      },
      {
        file: "9 passenger_flow_variable_capacity.csv",
        collection: "passengerflow",
        description: "Passenger Flow Data",
        transform: (row) => ({
          flow_id: parseInt(row.flow_id),
          trainset_id: parseInt(row.trainset_id),
          date: new Date(row.date.split("-").reverse().join("-")),
          peak_hour_capacity: parseInt(row.peak_hour_capacity),
          off_peak_capacity: parseInt(row.off_peak_capacity),
          actual_passengers: parseInt(row.actual_passengers),
          utilization_rate: parseFloat(row.utilization_rate),
          created_at: new Date(),
          updated_at: new Date(),
        }),
      },
    ];

    let totalImported = 0;

    // Process each CSV file
    for (const mapping of csvMappings) {
      try {
        console.log(`\n📁 Processing ${mapping.description}...`);

        // Read CSV file
        const csvPath = path.join(
          __dirname,
          "..",
          "..",
          "csv_data_files",
          mapping.file
        );

        if (!fs.existsSync(csvPath)) {
          console.log(`⚠️  File not found: ${mapping.file}`);
          continue;
        }

        const csvContent = fs.readFileSync(csvPath, "utf-8");
        const lines = csvContent.trim().split("\n");
        const headers = lines[0].split(",");

        console.log(`   📄 Found ${lines.length - 1} records`);

        // Parse CSV data
        const records = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",");
          const row = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() || "";
          });

          try {
            const transformedRecord = mapping.transform(row);
            records.push(transformedRecord);
          } catch (error) {
            console.log(`   ⚠️  Skipping row ${i}: ${error.message}`);
          }
        }

        // Clear existing data
        await db.collection(mapping.collection).deleteMany({});
        console.log(`   🧹 Cleared existing ${mapping.collection} data`);

        // Insert new data
        if (records.length > 0) {
          await db.collection(mapping.collection).insertMany(records);
          console.log(
            `   ✅ Imported ${records.length} records to ${mapping.collection}`
          );
          totalImported += records.length;
        } else {
          console.log(`   ⚠️  No valid records to import`);
        }
      } catch (error) {
        console.log(`   ❌ Error processing ${mapping.file}: ${error.message}`);
      }
    }

    // Display summary
    console.log("\n📊 Import Summary:");
    console.log(`   📁 Files processed: ${csvMappings.length}`);
    console.log(`   📄 Total records imported: ${totalImported}`);

    // Check collections
    console.log("\n📋 Collections in Atlas:");
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      const status = count > 0 ? "✅ Has data" : "ℹ️  Empty";
      console.log(`   • ${collection.name}: ${count} documents (${status})`);
    }

    console.log("\n🎉 CSV data import to Atlas completed successfully!");
    console.log("\n💡 Your Atlas database now contains:");
    console.log("   • Trainset master data");
    console.log("   • Fitness certificates");
    console.log("   • Job cards and maintenance records");
    console.log("   • Branding campaigns");
    console.log("   • Mileage and performance data");
    console.log("   • Cleaning schedules");
    console.log("   • Stabling assignments");
    console.log("   • Induction history");
    console.log("   • Passenger flow data");
  } catch (error) {
    console.error("❌ Error importing CSV data:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  }
};

// Run the import
importCsvToAtlas();
