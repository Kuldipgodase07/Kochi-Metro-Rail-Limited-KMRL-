import express from "express";
import SchedulingEngine from "../services/schedulingEngine.js";

const router = express.Router();
const schedulingEngine = new SchedulingEngine();

/**
 * @route   POST /api/scheduling/generate
 * @desc    Generate optimal train schedule
 * @access  Private
 */
router.post("/generate", async (req, res) => {
  try {
    const { targetDate, constraints = {} } = req.body;

    if (!targetDate) {
      return res.status(400).json({
        success: false,
        message: "Target date is required",
      });
    }

    const schedule = await schedulingEngine.generateSchedule(
      new Date(targetDate),
      constraints
    );

    res.json({
      success: true,
      data: schedule,
      message: "Schedule generated successfully",
    });
  } catch (error) {
    console.error("Error generating schedule:", error);
    res.status(500).json({
      success: false,
      message: "Error generating schedule",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/scheduling/:date
 * @desc    Get schedule for specific date
 * @access  Private
 */
router.get("/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const schedule = await schedulingEngine.getSchedule(date);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found for the specified date",
      });
    }

    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error("Error getting schedule:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving schedule",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/scheduling
 * @desc    Get all schedules
 * @access  Private
 */
router.get("/", async (req, res) => {
  try {
    const schedules = await schedulingEngine.getAllSchedules();

    res.json({
      success: true,
      data: schedules,
      count: schedules.length,
    });
  } catch (error) {
    console.error("Error getting schedules:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving schedules",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/scheduling/simulate
 * @desc    Run what-if scenario simulation
 * @access  Private
 */
router.post("/simulate", async (req, res) => {
  try {
    const scenario = req.body;

    if (!scenario.targetDate) {
      return res.status(400).json({
        success: false,
        message: "Target date is required for simulation",
      });
    }

    const simulation = await schedulingEngine.simulateScenario(scenario);

    res.json({
      success: true,
      data: simulation,
      message: "Simulation completed successfully",
    });
  } catch (error) {
    console.error("Error running simulation:", error);
    res.status(500).json({
      success: false,
      message: "Error running simulation",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/scheduling/analytics/performance
 * @desc    Get performance analytics
 * @access  Private
 */
router.get("/analytics/performance", async (req, res) => {
  try {
    const analytics = await schedulingEngine.getPerformanceAnalytics();

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error getting performance analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving performance analytics",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/scheduling/analytics/trainset/:trainsetId
 * @desc    Get analytics for specific trainset
 * @access  Private
 */
router.get("/analytics/trainset/:trainsetId", async (req, res) => {
  try {
    const { trainsetId } = req.params;
    const analytics = await schedulingEngine.getTrainsetAnalytics(
      parseInt(trainsetId)
    );

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error getting trainset analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving trainset analytics",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/scheduling/optimize
 * @desc    Optimize existing schedule
 * @access  Private
 */
router.post("/optimize", async (req, res) => {
  try {
    const { scheduleId, optimizationParams } = req.body;

    const optimizedSchedule = await schedulingEngine.optimizeExistingSchedule(
      scheduleId,
      optimizationParams
    );

    res.json({
      success: true,
      data: optimizedSchedule,
      message: "Schedule optimized successfully",
    });
  } catch (error) {
    console.error("Error optimizing schedule:", error);
    res.status(500).json({
      success: false,
      message: "Error optimizing schedule",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/scheduling/constraints
 * @desc    Get available constraints and their options
 * @access  Private
 */
router.get("/constraints", async (req, res) => {
  try {
    const constraints = {
      requiredTrainsets: {
        min: 15,
        max: 25,
        default: 20,
        description: "Number of trainsets required for service",
      },
      maxStandby: {
        min: 3,
        max: 8,
        default: 5,
        description: "Maximum number of standby trainsets",
      },
      maxMaintenance: {
        min: 1,
        max: 5,
        default: 3,
        description: "Maximum number of trainsets in maintenance",
      },
      priorityFactors: {
        fitness: {
          weight: 0.25,
          description: "Fitness certificate validity weight",
        },
        maintenance: {
          weight: 0.2,
          description: "Maintenance status weight",
        },
        branding: {
          weight: 0.15,
          description: "Branding campaign priority weight",
        },
        mileage: {
          weight: 0.15,
          description: "Mileage balancing weight",
        },
        cleaning: {
          weight: 0.1,
          description: "Cleaning schedule weight",
        },
        stabling: {
          weight: 0.15,
          description: "Stabling geometry weight",
        },
      },
    };

    res.json({
      success: true,
      data: constraints,
    });
  } catch (error) {
    console.error("Error getting constraints:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving constraints",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/scheduling/validate
 * @desc    Validate schedule constraints
 * @access  Private
 */
router.post("/validate", async (req, res) => {
  try {
    const { constraints } = req.body;

    const validation = await schedulingEngine.validateConstraints(constraints);

    res.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error("Error validating constraints:", error);
    res.status(500).json({
      success: false,
      message: "Error validating constraints",
      error: error.message,
    });
  }
});

export default router;
