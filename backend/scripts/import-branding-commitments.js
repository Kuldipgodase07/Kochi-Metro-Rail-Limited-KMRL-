import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import models
import BrandingCampaign from "../models/BrandingCampaign.js";
import Trainset from "../models/Trainset.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const connectDB = async () => {
  try {
    const atlasUri =
      "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    console.log("📡 Connecting to MongoDB Atlas...");
    const conn = await mongoose.connect(atlasUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

// Function to parse date from DD-MM-YYYY format
const parseDate = (dateString) => {
  if (!dateString) return null;
  const [day, month, year] = dateString.split("-");
  return new Date(year, month - 1, day);
};

// Function to determine campaign status based on dates and exposure
const determineStatus = (
  startDate,
  endDate,
  exposureTarget,
  exposureAchieved
) => {
  const now = new Date();
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end) return "pending";

  if (now < start) return "pending";
  if (now > end) return "expired";
  if (exposureAchieved >= exposureTarget) return "compliant";
  return "active";
};

// Function to calculate renewal probability based on performance
const calculateRenewalProbability = (exposureTarget, exposureAchieved) => {
  if (exposureTarget === 0) return 0.5;
  const performance = exposureAchieved / exposureTarget;
  return Math.min(Math.max(performance, 0.1), 0.9);
};

// Main import function
const importBrandingCommitments = async () => {
  try {
    await connectDB();

    // Read CSV file
    const csvPath = path.join(
      __dirname,
      "../../csv_data_files/4 branding_commitments.csv"
    );
    const csvData = fs.readFileSync(csvPath, "utf8");

    // Parse CSV data
    const lines = csvData.trim().split("\n");
    const headers = lines[0].split(",");

    console.log(
      `📊 Found ${lines.length - 1} branding commitment records to import`
    );

    // Clear existing branding campaigns
    console.log("🗑️  Clearing existing branding campaigns...");
    await BrandingCampaign.deleteMany({});
    console.log("✅ Existing branding campaigns cleared");

    let importedCount = 0;
    let errorCount = 0;

    // Process each record
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(",");

        if (values.length < headers.length) {
          console.log(`⚠️  Skipping incomplete record at line ${i + 1}`);
          continue;
        }

        // Map CSV fields to model fields
        const trainsetId = parseInt(values[1]); // trainset_id from CSV

        // Find trainset by trainset_id field (not MongoDB _id)
        const trainset = await Trainset.findOne({ trainset_id: trainsetId });
        if (!trainset) {
          console.log(
            `⚠️  Trainset with trainset_id ${trainsetId} not found, skipping record ${i}`
          );
          continue;
        }

        const brandingData = {
          trainset_id: trainset._id, // Use MongoDB ObjectId
          advertiser: values[2], // advertiser_name
          campaign_name: values[3], // campaign_code
          start_date: parseDate(values[6]), // campaign_start
          end_date: parseDate(values[7]), // campaign_end
          exposure_target: parseInt(values[4]) || 0, // exposure_target_hours
          actual_exposure: parseInt(values[5]) || 0, // exposure_achieved_hours
          wrap_area: "Full Train Wrap", // Default value
          status: determineStatus(
            values[6],
            values[7],
            parseInt(values[4]),
            parseInt(values[5])
          ),
          renewal_probability: calculateRenewalProbability(
            parseInt(values[4]),
            parseInt(values[5])
          ),
          created_at: new Date(),
          updated_at: new Date(),
        };

        // Create branding campaign
        const brandingCampaign = new BrandingCampaign(brandingData);
        await brandingCampaign.save();

        importedCount++;
        console.log(
          `✅ Imported branding campaign ${i}: ${brandingData.advertiser} - ${brandingData.campaign_name}`
        );
      } catch (error) {
        console.error(`❌ Error importing record ${i}:`, error.message);
        errorCount++;
      }
    }

    console.log("\n📈 Import Summary:");
    console.log(
      `✅ Successfully imported: ${
        lines.length - 1 - errorCount
      } branding campaigns`
    );
    console.log(`❌ Errors: ${errorCount}`);

    // Display some statistics
    const totalCampaigns = await BrandingCampaign.countDocuments();
    const activeCampaigns = await BrandingCampaign.countDocuments({
      status: "active",
    });
    const expiredCampaigns = await BrandingCampaign.countDocuments({
      status: "expired",
    });
    const compliantCampaigns = await BrandingCampaign.countDocuments({
      status: "compliant",
    });

    console.log("\n📊 Database Statistics:");
    console.log(`Total Branding Campaigns: ${totalCampaigns}`);
    console.log(`Active Campaigns: ${activeCampaigns}`);
    console.log(`Expired Campaigns: ${expiredCampaigns}`);
    console.log(`Compliant Campaigns: ${compliantCampaigns}`);
  } catch (error) {
    console.error("❌ Import failed:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
};

// Run the import
importBrandingCommitments();
