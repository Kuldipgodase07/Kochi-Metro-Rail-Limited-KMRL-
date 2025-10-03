import express from "express";
import mongoose from "mongoose";
import Trainset from "../models/Trainset.js";
import Metrics from "../models/Metrics.js";

const router = express.Router();

// Helper function to map database status to frontend status
const mapStatusToFrontend = (dbStatus) => {
  if (!dbStatus) return "standby";

  const statusMap = {
    in_service: "ready",
    standby: "standby",
    IBL_maintenance: "maintenance",
    maintenance: "maintenance",
    critical: "critical",
    ready: "ready",
  };

  return statusMap[dbStatus] || "standby";
};

// @route   GET /api/data/trainsets
// @desc    Get all trainsets from MongoDB Atlas (fresh CSV data)
// @access  Public
router.get("/trainsets", async (req, res) => {
  try {
    console.log("📡 Trainsets API request received");

    // Use direct database query to get fresh CSV data
    const db = mongoose.connection.db;

    if (!db) {
      console.error("❌ Database connection not available");
      return res.status(503).json({
        message: "Database connection not available",
        error: "Database unavailable",
      });
    }

    console.log("🔍 Fetching trainsets from database...");
    const trainsets = await db
      .collection("trainsets")
      .find({})
      .sort({ number: 1 })
      .toArray();

    console.log(`✅ Found ${trainsets.length} trainsets`);

    // Fetch additional data for comprehensive display
    console.log("🔍 Fetching mileage records...");
    const mileageRecords = await db
      .collection("mileage_records")
      .find({})
      .toArray();
    console.log(`✅ Found ${mileageRecords.length} mileage records`);

    console.log("🔍 Fetching branding commitments...");
    const brandingRecords = await db
      .collection("branding_commitments")
      .find({})
      .toArray();
    console.log(`✅ Found ${brandingRecords.length} branding records`);

    console.log("🔍 Fetching cleaning schedule...");
    const cleaningRecords = await db
      .collection("cleaning_schedule")
      .find({})
      .toArray();
    console.log(`✅ Found ${cleaningRecords.length} cleaning records`);

    // Create lookup maps
    const mileageMap = {};
    mileageRecords.forEach((record) => {
      mileageMap[record.trainset_id] = record;
    });

    const brandingMap = {};
    brandingRecords.forEach((record) => {
      brandingMap[record.trainset_id] = record;
    });

    const cleaningMap = {};
    cleaningRecords.forEach((record) => {
      if (
        !cleaningMap[record.trainset_id] ||
        new Date(record.scheduled_date_time) >
          new Date(cleaningMap[record.trainset_id].scheduled_date_time)
      ) {
        cleaningMap[record.trainset_id] = record;
      }
    });

    // Transform CSV data to match frontend interface with comprehensive data
    const transformedTrainsets = trainsets.map((trainset) => ({
      id: trainset._id.toString(),
      number: trainset.number || trainset.rake_number || trainset.trainset_id || 'N/A', // Use number field from MongoDB
      status: mapStatusToFrontend(trainset.current_status || trainset.status), // Map status to frontend format
      bay_position: trainset.bay_position,
      mileage:
        mileageMap[trainset.trainset_id]?.total_km_run || trainset.mileage || 0,
      mileage_details: mileageMap[trainset.trainset_id]
        ? {
            total_km_run: mileageMap[trainset.trainset_id].total_km_run,
            km_since_last_POH:
              mileageMap[trainset.trainset_id].km_since_last_POH,
            km_since_last_IOH:
              mileageMap[trainset.trainset_id].km_since_last_IOH,
            km_since_last_trip_maintenance:
              mileageMap[trainset.trainset_id].km_since_last_trip_maintenance,
            bogie_condition_index:
              mileageMap[trainset.trainset_id].bogie_condition_index,
            brake_pad_wear_level:
              mileageMap[trainset.trainset_id].brake_pad_wear_level,
            hvac_runtime_hours:
              mileageMap[trainset.trainset_id].hvac_runtime_hours,
          }
        : null,
      last_cleaning: cleaningMap[trainset.trainset_id]?.scheduled_date_time
        ? new Date(
            cleaningMap[trainset.trainset_id].scheduled_date_time
          ).toISOString()
        : trainset.last_cleaning
        ? trainset.last_cleaning.toISOString()
        : new Date().toISOString(),
      branding_priority:
        brandingMap[trainset.trainset_id]?.priority ||
        trainset.branding_priority ||
        5,
      branding_details: brandingMap[trainset.trainset_id]
        ? {
            advertiser_name: brandingMap[trainset.trainset_id].advertiser_name,
            campaign_code: brandingMap[trainset.trainset_id].campaign_code,
            priority: brandingMap[trainset.trainset_id].priority,
            exposure_target_hours:
              brandingMap[trainset.trainset_id].exposure_target_hours,
            exposure_achieved_hours:
              brandingMap[trainset.trainset_id].exposure_achieved_hours,
            campaign_start: brandingMap[trainset.trainset_id].campaign_start,
            campaign_end: brandingMap[trainset.trainset_id].campaign_end,
          }
        : null,
      availability_percentage:
        trainset.availability_percentage || Math.floor(Math.random() * 20) + 80,
      created_at: trainset.createdAt
        ? trainset.createdAt.toISOString()
        : new Date().toISOString(),
      updated_at: trainset.updatedAt
        ? trainset.updatedAt.toISOString()
        : new Date().toISOString(),
      // Additional CSV fields
      rake_number: trainset.rake_number,
      make_model: trainset.make_model,
      year_commissioned: trainset.year_commissioned,
      home_depot: trainset.home_depot,
    }));

    console.log(
      `✅ Returning ${transformedTrainsets.length} transformed trainsets`
    );
    res.json(transformedTrainsets);
  } catch (error) {
    console.error("❌ Error fetching trainsets:", error.message);
    console.error("Stack trace:", error.stack);

    // Check if it's a database connection error
    if (
      error.name === "MongoNetworkError" ||
      error.message.includes("connection")
    ) {
      return res.status(503).json({
        message: "Database connection error",
        error: "Database temporarily unavailable",
      });
    }

    // Check if it's a timeout error
    if (error.name === "MongoTimeoutError") {
      return res.status(504).json({
        message: "Database query timeout",
        error: "Request took too long to process",
      });
    }

    res.status(500).json({
      message: "Server error while fetching trainsets",
      error: error.message,
    });
  }
});

// @route   GET /api/data/trainsets/:id
// @desc    Get single trainset by ID from MongoDB
// @access  Public
router.get("/trainsets/:id", async (req, res) => {
  try {
    // Use direct database query to get fresh CSV data
    const db = mongoose.connection.db;
    const trainset = await db
      .collection("trainsets")
      .findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });

    if (!trainset) {
      return res.status(404).json({
        message: "Trainset not found",
      });
    }

    // Transform CSV data to match frontend interface
    const transformedTrainset = {
      id: trainset._id.toString(),
      number: trainset.rake_number || trainset.trainset_id, // Use rake_number from CSV
      status: mapStatusToFrontend(trainset.current_status || trainset.status), // Map status to frontend format
      bay_position: trainset.bay_position,
      mileage: trainset.mileage,
      last_cleaning: trainset.last_cleaning
        ? trainset.last_cleaning.toISOString()
        : new Date().toISOString(),
      branding_priority: trainset.branding_priority,
      availability_percentage: trainset.availability_percentage,
      created_at: trainset.createdAt
        ? trainset.createdAt.toISOString()
        : new Date().toISOString(),
      updated_at: trainset.updatedAt
        ? trainset.updatedAt.toISOString()
        : new Date().toISOString(),
      // Additional CSV fields
      rake_number: trainset.rake_number,
      make_model: trainset.make_model,
      year_commissioned: trainset.year_commissioned,
      home_depot: trainset.home_depot,
    };

    res.json(transformedTrainset);
  } catch (error) {
    console.error("Error fetching trainset:", error);
    res.status(500).json({
      message: "Server error while fetching trainset",
    });
  }
});

// @route   GET /api/data/metrics
// @desc    Get current realtime metrics from MongoDB
// @access  Public
router.get("/metrics", async (req, res) => {
  try {
    console.log("📊 Metrics API request received");

    // Get the most recent metrics
    const metrics = await Metrics.findOne().sort({ timestamp: -1 });

    if (!metrics) {
      console.log("⚠️  No metrics found in database");
      return res.status(404).json({
        message: "No metrics found",
      });
    }

    console.log("✅ Metrics found, transforming data...");

    // Transform data to match frontend interface
    const transformedMetrics = {
      timestamp: metrics.timestamp.toISOString(),
      fleet_status: metrics.fleet_status,
      current_kpis: metrics.current_kpis,
      planning_status: {
        schedules_generated: metrics.planning_status.schedules_generated,
        ai_confidence_avg: metrics.planning_status.ai_confidence_avg,
        last_optimization: metrics.planning_status.last_optimization,
      },
      alerts: metrics.alerts,
    };

    console.log("✅ Returning transformed metrics");
    res.json(transformedMetrics);
  } catch (error) {
    console.error("❌ Error fetching metrics:", error.message);
    console.error("Stack trace:", error.stack);

    // Check if it's a database connection error
    if (
      error.name === "MongoNetworkError" ||
      error.message.includes("connection")
    ) {
      return res.status(503).json({
        message: "Database connection error",
        error: "Database temporarily unavailable",
      });
    }

    res.status(500).json({
      message: "Server error while fetching metrics",
      error: error.message,
    });
  }
});

// @route   PUT /api/data/trainsets/:id/status
// @desc    Update trainset status in MongoDB
// @access  Public
router.put("/trainsets/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const validStatuses = ["ready", "standby", "maintenance", "critical"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    // Use direct database query to update the trainset
    const db = mongoose.connection.db;

    // Map frontend status back to database status
    const mapStatusToDatabase = (frontendStatus) => {
      const statusMap = {
        ready: "in_service",
        standby: "standby",
        maintenance: "IBL_maintenance",
        critical: "critical",
      };
      return statusMap[frontendStatus] || "standby";
    };

    const dbStatus = mapStatusToDatabase(status);

    const result = await db.collection("trainsets").updateOne(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      {
        $set: {
          current_status: dbStatus,
          status: dbStatus,
          updated_at: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Trainset not found",
      });
    }

    // Get the updated trainset
    const updatedTrainset = await db.collection("trainsets").findOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
    });

    // Update metrics after status change
    await updateMetricsAfterStatusChange();

    res.json({
      message: "Trainset status updated successfully",
      trainset: {
        id: updatedTrainset._id.toString(),
        number: updatedTrainset.rake_number || updatedTrainset.trainset_id,
        status: mapStatusToFrontend(
          updatedTrainset.current_status || updatedTrainset.status
        ),
        availability_percentage: updatedTrainset.availability_percentage,
      },
    });
  } catch (error) {
    console.error("Error updating trainset status:", error);
    res.status(500).json({
      message: "Server error while updating trainset status",
    });
  }
});

// @route   POST /api/data/ai-schedule
// @desc    Generate AI-optimized schedule using MongoDB data
// @access  Public
router.post("/ai-schedule", async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    // Get all trainsets for comprehensive AI analysis
    const allTrainsets = await Trainset.find().sort({
      availability_percentage: -1,
      branding_priority: -1,
    });

    if (allTrainsets.length === 0) {
      return res.status(400).json({
        message: "No trainsets found for analysis",
      });
    }

    // Generate AI recommendations for all trainsets
    const recommendations = allTrainsets.map((trainset) => {
      let recommendedStatus = trainset.status;
      let confidence = 0.8;
      let priority = 5;
      const reasoning = [];
      const riskFactors = [];

      // Enhanced AI logic simulation with comprehensive analysis

      // Critical conditions (highest priority)
      if (trainset.mileage > 65000) {
        recommendedStatus = "critical";
        confidence = 0.98;
        priority = 10;
        reasoning.push("Extremely high mileage - immediate attention required");
        reasoning.push("Safety inspection required");
        riskFactors.push("Potential mechanical failure risk");
        riskFactors.push("Extended service intervals exceeded");
      } else if (trainset.availability_percentage < 55) {
        recommendedStatus = "critical";
        confidence = 0.95;
        priority = 9;
        reasoning.push("Critical availability threshold breached");
        reasoning.push("Immediate maintenance intervention required");
        riskFactors.push("Service reliability compromised");
      }

      // Maintenance conditions
      else if (
        trainset.mileage > 50000 &&
        trainset.availability_percentage < 85
      ) {
        recommendedStatus = "maintenance";
        confidence = 0.9;
        priority = 8;
        reasoning.push("High mileage combined with declining availability");
        reasoning.push("Comprehensive maintenance scheduled");
        riskFactors.push("Performance degradation trend detected");
      } else if (trainset.availability_percentage < 80) {
        recommendedStatus = "maintenance";
        confidence = 0.85;
        priority = 7;
        reasoning.push("Availability below operational threshold");
        reasoning.push("Preventive maintenance recommended");
      } else if (trainset.mileage > 45000) {
        recommendedStatus = "maintenance";
        confidence = 0.8;
        priority = 6;
        reasoning.push("Scheduled maintenance window approaching");
        reasoning.push("Proactive service optimization");
      }

      // Ready for service conditions
      else if (
        trainset.availability_percentage >= 95 &&
        trainset.branding_priority >= 8
      ) {
        recommendedStatus = "ready";
        confidence = 0.95;
        priority = 9;
        reasoning.push("Excellent performance metrics");
        reasoning.push("High revenue potential - premium branding");
        reasoning.push("Optimal passenger experience delivery");
      } else if (
        trainset.availability_percentage >= 90 &&
        trainset.mileage < 40000
      ) {
        recommendedStatus = "ready";
        confidence = 0.9;
        priority = 8;
        reasoning.push("Strong operational performance");
        reasoning.push("Low wear and tear profile");
        reasoning.push("Suitable for high-frequency service");
      }

      // Standby conditions
      else if (
        trainset.availability_percentage >= 85 &&
        trainset.branding_priority < 7
      ) {
        recommendedStatus = "standby";
        confidence = 0.85;
        priority = 5;
        reasoning.push("Good operational capacity");
        reasoning.push("Optimal for backup service role");
        reasoning.push("Cost-effective reserve deployment");
      } else {
        // Default standby recommendation
        recommendedStatus = "standby";
        confidence = 0.75;
        priority = 4;
        reasoning.push("Standard operational capacity");
        reasoning.push("Available for flexible deployment");
      }

      // Additional risk factor analysis
      const daysSinceLastCleaning = Math.floor(
        (new Date() - new Date(trainset.last_cleaning)) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastCleaning > 10) {
        riskFactors.push("Extended cleaning interval detected");
        priority = Math.min(priority + 1, 10);
      }

      if (
        trainset.branding_priority <= 3 &&
        trainset.availability_percentage < 70
      ) {
        riskFactors.push("Low priority train with declining performance");
      }

      return {
        trainset_id: trainset._id.toString(),
        recommended_status: recommendedStatus,
        confidence_score: confidence,
        reasoning,
        priority_score: priority,
        risk_factors: riskFactors,
      };
    });

    // Update planning status in metrics
    await Metrics.findOneAndUpdate(
      {},
      {
        $inc: { "planning_status.schedules_generated": 1 },
        $set: {
          "planning_status.last_optimization": new Date(),
          "planning_status.ai_confidence_avg": Math.round(
            (recommendations.reduce(
              (sum, rec) => sum + rec.confidence_score,
              0
            ) /
              recommendations.length) *
              100
          ),
        },
      },
      { sort: { timestamp: -1 } }
    );

    const summary = {
      total_trainsets: allTrainsets.length,
      recommendations: recommendations.reduce((acc, rec) => {
        acc[rec.recommended_status] = (acc[rec.recommended_status] || 0) + 1;
        return acc;
      }, {}),
      average_confidence:
        Math.round(
          (recommendations.reduce((sum, rec) => sum + rec.confidence_score, 0) /
            recommendations.length) *
            100
        ) / 100,
      high_risk_count: recommendations.filter((r) => r.risk_factors.length > 0)
        .length,
      optimization_timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      recommendations,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating AI schedule:", error);
    res.status(500).json({
      message: "Server error while generating AI schedule",
    });
  }
});

// Helper function to update metrics after status changes
const updateMetricsAfterStatusChange = async () => {
  try {
    const db = mongoose.connection.db;
    const trainsets = await db.collection("trainsets").find({}).toArray();

    // Map database statuses to frontend statuses for counting
    const statusCounts = trainsets.reduce((acc, train) => {
      const frontendStatus = mapStatusToFrontend(
        train.current_status || train.status
      );
      acc[frontendStatus] = (acc[frontendStatus] || 0) + 1;
      return acc;
    }, {});

    const totalFleet = trainsets.length;
    const readyCount = statusCounts.ready || 0;
    const standbyCount = statusCounts.standby || 0;
    const maintenanceCount = statusCounts.maintenance || 0;
    const criticalCount = statusCounts.critical || 0;

    const operationalFleet = readyCount + standbyCount;
    const serviceability =
      totalFleet > 0 ? Math.round((operationalFleet / totalFleet) * 100) : 0;
    const avgAvailability =
      totalFleet > 0
        ? Math.round(
            trainsets.reduce(
              (sum, train) => sum + (train.availability_percentage || 0),
              0
            ) / totalFleet
          )
        : 0;

    // Update the most recent metrics in the metrics collection
    await db.collection("metrics").updateOne(
      {},
      {
        $set: {
          timestamp: new Date(),
          "fleet_status.total_fleet": totalFleet,
          "fleet_status.ready": readyCount,
          "fleet_status.standby": standbyCount,
          "fleet_status.maintenance": maintenanceCount,
          "fleet_status.critical": criticalCount,
          "fleet_status.serviceability": serviceability,
          "fleet_status.avg_availability": avgAvailability,
          "current_kpis.fleet_availability": serviceability,
        },
      },
      { sort: { timestamp: -1 } }
    );
  } catch (error) {
    console.error("Error updating metrics:", error);
  }
};

// @route   PUT /api/data/trainsets/:id
// @desc    Update trainset details in MongoDB
// @access  Public
router.put("/trainsets/:id", async (req, res) => {
  try {
    const { 
      status, 
      bay_position, 
      mileage, 
      availability_percentage, 
      branding_priority,
      last_cleaning 
    } = req.body;

    const db = mongoose.connection.db;
    const updateFields = {};

    // Map frontend status back to database status if provided
    if (status) {
      const validStatuses = ["ready", "standby", "maintenance", "critical"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status value",
        });
      }

      const mapStatusToDatabase = (frontendStatus) => {
        const statusMap = {
          ready: "in_service",
          standby: "standby",
          maintenance: "IBL_maintenance",
          critical: "critical",
        };
        return statusMap[frontendStatus] || "standby";
      };

      const dbStatus = mapStatusToDatabase(status);
      updateFields.current_status = dbStatus;
      updateFields.status = dbStatus;
    }

    // Add other fields if provided
    if (bay_position !== undefined) updateFields.bay_position = parseInt(bay_position);
    if (mileage !== undefined) updateFields.mileage = parseInt(mileage);
    if (availability_percentage !== undefined) updateFields.availability_percentage = parseFloat(availability_percentage);
    if (branding_priority !== undefined) updateFields.branding_priority = parseInt(branding_priority);
    if (last_cleaning) updateFields.last_cleaning = new Date(last_cleaning);
    
    updateFields.updated_at = new Date();

    // Perform the update
    const result = await db.collection("trainsets").updateOne(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Trainset not found",
      });
    }

    // Get the updated trainset
    const updatedTrainset = await db.collection("trainsets").findOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
    });

    // Update metrics after change
    await updateMetricsAfterStatusChange();

    res.json({
      message: "Trainset updated successfully",
      trainset: {
        id: updatedTrainset._id.toString(),
        number: updatedTrainset.number || updatedTrainset.rake_number || updatedTrainset.trainset_id || 'N/A',
        status: mapStatusToFrontend(updatedTrainset.current_status || updatedTrainset.status),
        bay_position: updatedTrainset.bay_position,
        mileage: updatedTrainset.mileage,
        availability_percentage: updatedTrainset.availability_percentage,
        branding_priority: updatedTrainset.branding_priority,
        last_cleaning: updatedTrainset.last_cleaning,
      },
    });
  } catch (error) {
    console.error("Error updating trainset:", error);
    res.status(500).json({
      message: "Server error while updating trainset",
      error: error.message
    });
  }
});

export default router;
