import mongoose from "mongoose";

class SchedulingEngine {
  constructor() {
    this.db = mongoose.connection.db;
    this.weights = {
      fitness: 0.25, // Fitness certificate validity
      maintenance: 0.2, // Job card status
      branding: 0.15, // Branding priorities
      mileage: 0.15, // Mileage balancing
      cleaning: 0.1, // Cleaning schedules
      stabling: 0.15, // Stabling geometry
    };
  }

  /**
   * Ensure Atlas connection
   */
  async ensureAtlasConnection() {
    if (!this.db || mongoose.connection.readyState !== 1) {
      const atlasUri =
        "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
      await mongoose.connect(atlasUri);
      this.db = mongoose.connection.db;
    }
  }

  /**
   * Generate optimal train schedule for the next day
   * @param {Date} targetDate - Date for which to generate schedule
   * @param {Object} constraints - Operational constraints
   * @returns {Object} Optimized schedule with reasoning
   */
  async generateSchedule(targetDate, constraints = {}) {
    try {
      console.log(`🚆 Generating schedule for ${targetDate.toDateString()}`);

      // Ensure Atlas connection
      await this.ensureAtlasConnection();

      // Get all operational data
      const [
        trainsets,
        fitnessCertificates,
        jobCards,
        brandingCampaigns,
        mileageRecords,
        cleaningSlots,
        stablingAssignments,
        passengerFlow,
      ] = await this.getAllOperationalData();

      console.log(`📊 Found ${trainsets.length} trainsets in database`);

      // Calculate scores for each trainset
      const trainsetScores = await this.calculateTrainsetScores({
        trainsets,
        fitnessCertificates,
        jobCards,
        brandingCampaigns,
        mileageRecords,
        cleaningSlots,
        stablingAssignments,
        passengerFlow,
        targetDate,
        constraints,
      });

      // Generate optimized schedule
      const schedule = await this.optimizeSchedule(trainsetScores, constraints);

      // Generate detailed reasoning
      const reasoning = await this.generateReasoning(schedule, trainsetScores);

      // Create schedule document
      const scheduleDoc = {
        date: targetDate,
        generated_at: new Date(),
        status: "generated",
        schedule: schedule,
        reasoning: reasoning,
        constraints: constraints,
        metadata: {
          total_trainsets: trainsets.length,
          available_trainsets: schedule.induction_list.length,
          standby_trainsets: schedule.standby_list.length,
          maintenance_trainsets: schedule.maintenance_list.length,
          coverage: schedule.summary.coverage,
        },
      };

      // Save to database
      await this.saveSchedule(scheduleDoc);

      return scheduleDoc;
    } catch (error) {
      console.error("Error generating schedule:", error);
      throw error;
    }
  }

  /**
   * Get all operational data from Atlas
   */
  async getAllOperationalData() {
    const [
      trainsets,
      fitnessCertificates,
      jobCards,
      brandingCampaigns,
      mileageRecords,
      cleaningSlots,
      stablingAssignments,
      passengerFlow,
    ] = await Promise.all([
      this.db.collection("trainsets").find({}).toArray(),
      this.db.collection("fitnesscertificates").find({}).toArray(),
      this.db.collection("jobcards").find({}).toArray(),
      this.db.collection("brandingcampaigns").find({}).toArray(),
      this.db.collection("mileagerecords").find({}).toArray(),
      this.db.collection("cleaningslots").find({}).toArray(),
      this.db.collection("stablingassignments").find({}).toArray(),
      this.db.collection("passengerflow").find({}).toArray(),
    ]);

    return [
      trainsets,
      fitnessCertificates,
      jobCards,
      brandingCampaigns,
      mileageRecords,
      cleaningSlots,
      stablingAssignments,
      passengerFlow,
    ];
  }

  /**
   * Calculate comprehensive scores for each trainset
   */
  async calculateTrainsetScores(data) {
    const {
      trainsets,
      fitnessCertificates,
      jobCards,
      brandingCampaigns,
      mileageRecords,
      cleaningSlots,
      stablingAssignments,
      passengerFlow,
      targetDate,
      constraints,
    } = data;

    const scores = [];

    for (const trainset of trainsets) {
      const score = {
        trainset_id: trainset.trainset_id,
        rake_number: trainset.rake_number,
        make_model: trainset.make_model,
        current_status: trainset.current_status,
        home_depot: trainset.home_depot,
        scores: {},
        total_score: 0,
        eligibility: true,
        issues: [],
      };

      // 1. Fitness Certificate Score (0-100)
      score.scores.fitness = await this.calculateFitnessScore(
        trainset.trainset_id,
        fitnessCertificates,
        targetDate
      );

      // 2. Maintenance Score (0-100)
      score.scores.maintenance = await this.calculateMaintenanceScore(
        trainset.trainset_id,
        jobCards,
        targetDate
      );

      // 3. Branding Score (0-100)
      score.scores.branding = await this.calculateBrandingScore(
        trainset.trainset_id,
        brandingCampaigns,
        targetDate
      );

      // 4. Mileage Score (0-100)
      score.scores.mileage = await this.calculateMileageScore(
        trainset.trainset_id,
        mileageRecords
      );

      // 5. Cleaning Score (0-100)
      score.scores.cleaning = await this.calculateCleaningScore(
        trainset.trainset_id,
        cleaningSlots,
        targetDate
      );

      // 6. Stabling Score (0-100)
      score.scores.stabling = await this.calculateStablingScore(
        trainset.trainset_id,
        stablingAssignments
      );

      // Calculate weighted total score
      score.total_score = Object.keys(score.scores).reduce((total, key) => {
        return total + score.scores[key] * this.weights[key];
      }, 0);

      // Check eligibility
      if (score.scores.fitness < 30) {
        score.eligibility = false;
        score.issues.push("Fitness certificate expired or expiring soon");
      }

      if (score.scores.maintenance < 20) {
        score.eligibility = false;
        score.issues.push("Critical maintenance required");
      }

      if (trainset.current_status === "critical") {
        score.eligibility = false;
        score.issues.push("Trainset in critical condition");
      }

      scores.push(score);
    }

    return scores.sort((a, b) => b.total_score - a.total_score);
  }

  /**
   * Calculate fitness certificate score
   */
  async calculateFitnessScore(trainsetId, fitnessCertificates, targetDate) {
    const certificates = fitnessCertificates.filter(
      (cert) => cert.trainset_id === trainsetId
    );

    if (certificates.length === 0) return 0;

    let totalScore = 0;
    const requiredTypes = ["rolling_stock", "signalling", "telecom"];

    for (const type of requiredTypes) {
      const cert = certificates.find((c) => c.certificate_type === type);
      if (!cert) {
        return 0; // Missing required certificate
      }

      const daysToExpiry = Math.ceil(
        (new Date(cert.valid_to) - targetDate) / (1000 * 60 * 60 * 24)
      );

      if (daysToExpiry < 0) return 0; // Expired
      if (daysToExpiry < 7) return 20; // Expiring soon
      if (daysToExpiry < 30) return 60; // Expiring in a month

      totalScore += 100; // Valid for more than a month
    }

    return totalScore / requiredTypes.length;
  }

  /**
   * Calculate maintenance score
   */
  async calculateMaintenanceScore(trainsetId, jobCards, targetDate) {
    const activeJobs = jobCards.filter(
      (job) =>
        job.trainset_id === trainsetId &&
        ["open", "in-progress"].includes(job.status)
    );

    if (activeJobs.length === 0) return 100; // No active maintenance

    let score = 100;
    const criticalJobs = activeJobs.filter(
      (job) => job.priority === "emergency"
    );
    const highPriorityJobs = activeJobs.filter(
      (job) => job.priority === "high"
    );

    score -= criticalJobs.length * 50; // Heavy penalty for critical jobs
    score -= highPriorityJobs.length * 25; // Penalty for high priority jobs
    score -= activeJobs.length * 5; // Small penalty for any active job

    return Math.max(0, score);
  }

  /**
   * Calculate branding score
   */
  async calculateBrandingScore(trainsetId, brandingCampaigns, targetDate) {
    const activeCampaigns = brandingCampaigns.filter(
      (campaign) =>
        campaign.trainset_id === trainsetId &&
        new Date(campaign.campaign_start) <= targetDate &&
        new Date(campaign.campaign_end) >= targetDate
    );

    if (activeCampaigns.length === 0) return 50; // Neutral score

    let score = 0;
    for (const campaign of activeCampaigns) {
      const exposureRatio =
        campaign.exposure_achieved_hours / campaign.exposure_target_hours;

      if (campaign.priority === "critical") {
        score += exposureRatio < 0.8 ? 100 : 50; // High priority if behind target
      } else {
        score += exposureRatio < 0.9 ? 80 : 40; // Normal priority
      }
    }

    return Math.min(100, score / activeCampaigns.length);
  }

  /**
   * Calculate mileage score
   */
  async calculateMileageScore(trainsetId, mileageRecords) {
    const record = mileageRecords.find((r) => r.trainset_id === trainsetId);
    if (!record) return 50; // Neutral if no data

    // Calculate mileage balance score
    const avgMileage =
      mileageRecords.reduce((sum, r) => sum + r.total_km_run, 0) /
      mileageRecords.length;
    const mileageRatio = record.total_km_run / avgMileage;

    // Prefer trainsets with lower mileage (more balanced)
    if (mileageRatio < 0.8) return 100; // Well below average
    if (mileageRatio < 0.9) return 80; // Below average
    if (mileageRatio < 1.1) return 60; // Near average
    if (mileageRatio < 1.2) return 40; // Above average
    return 20; // Well above average
  }

  /**
   * Calculate cleaning score
   */
  async calculateCleaningScore(trainsetId, cleaningSlots, targetDate) {
    const recentCleanings = cleaningSlots
      .filter(
        (slot) =>
          slot.trainset_id === trainsetId &&
          slot.scheduled_date_time <= targetDate
      )
      .sort(
        (a, b) =>
          new Date(b.scheduled_date_time) - new Date(a.scheduled_date_time)
      );

    if (recentCleanings.length === 0) return 30; // No recent cleaning

    const lastCleaning = recentCleanings[0];
    const daysSinceCleaning = Math.ceil(
      (targetDate - new Date(lastCleaning.scheduled_date_time)) /
        (1000 * 60 * 60 * 24)
    );

    if (daysSinceCleaning < 1) return 100; // Cleaned today
    if (daysSinceCleaning < 3) return 80; // Cleaned recently
    if (daysSinceCleaning < 7) return 60; // Cleaned this week
    if (daysSinceCleaning < 14) return 40; // Cleaned this month
    return 20; // Needs cleaning
  }

  /**
   * Calculate stabling score
   */
  async calculateStablingScore(trainsetId, stablingAssignments) {
    const assignment = stablingAssignments.find(
      (a) => a.trainset_id === trainsetId
    );
    if (!assignment) return 50; // Neutral if no assignment

    let score = 100;

    // Penalty for occupied bays
    if (assignment.occupied) score -= 30;

    // Bonus for optimal position
    if (assignment.position_order <= 5) score += 20;
    else if (assignment.position_order <= 10) score += 10;

    // Bonus for preferred depot
    if (assignment.depot_name === "Depot A") score += 10;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Optimize schedule based on scores
   */
  async optimizeSchedule(trainsetScores, constraints) {
    const {
      requiredTrainsets = 20,
      maxStandby = 5,
      maxMaintenance = 3,
    } = constraints;

    const eligible = trainsetScores.filter((t) => t.eligibility);
    const ineligible = trainsetScores.filter((t) => !t.eligibility);

    // Select top performers for induction
    const inductionList = eligible.slice(0, requiredTrainsets).map((t) => ({
      trainset_id: t.trainset_id,
      rake_number: t.rake_number,
      score: t.total_score,
      reasoning: this.getTrainsetReasoning(t),
    }));

    // Select standby trainsets
    const standbyList = eligible
      .slice(requiredTrainsets, requiredTrainsets + maxStandby)
      .map((t) => ({
        trainset_id: t.trainset_id,
        rake_number: t.rake_number,
        score: t.total_score,
        reasoning: this.getTrainsetReasoning(t),
      }));

    // Maintenance trainsets
    const maintenanceList = ineligible.map((t) => ({
      trainset_id: t.trainset_id,
      rake_number: t.rake_number,
      issues: t.issues,
      score: t.total_score,
    }));

    return {
      induction_list: inductionList,
      standby_list: standbyList,
      maintenance_list: maintenanceList,
      summary: {
        total_available: eligible.length,
        total_required: requiredTrainsets,
        total_standby: standbyList.length,
        total_maintenance: maintenanceList.length,
        coverage: Math.round((inductionList.length / requiredTrainsets) * 100),
      },
    };
  }

  /**
   * Get reasoning for individual trainset
   */
  getTrainsetReasoning(trainset) {
    const reasons = [];

    if (trainset.scores.fitness > 80)
      reasons.push("Excellent fitness certificates");
    if (trainset.scores.maintenance > 80)
      reasons.push("No critical maintenance");
    if (trainset.scores.branding > 70) reasons.push("Good branding exposure");
    if (trainset.scores.mileage < 60) reasons.push("Balanced mileage");
    if (trainset.scores.cleaning > 70) reasons.push("Recently cleaned");
    if (trainset.scores.stabling > 70)
      reasons.push("Optimal stabling position");

    return reasons;
  }

  /**
   * Generate comprehensive reasoning
   */
  async generateReasoning(schedule, trainsetScores) {
    return {
      optimization_summary: `Generated schedule with ${schedule.induction_list.length} trainsets for induction`,
      key_factors: [
        "Fitness certificate validity",
        "Maintenance status",
        "Branding campaign priorities",
        "Mileage balancing",
        "Cleaning schedules",
        "Stabling geometry",
      ],
      recommendations: [
        "Monitor fitness certificate expiry dates",
        "Prioritize maintenance for standby trainsets",
        "Optimize branding exposure for selected trainsets",
        "Plan cleaning schedules for maintenance trainsets",
      ],
      alerts:
        schedule.maintenance_list.length > 0
          ? [
              `${schedule.maintenance_list.length} trainsets require immediate attention`,
            ]
          : [],
    };
  }

  /**
   * Save schedule to database
   */
  async saveSchedule(scheduleDoc) {
    try {
      await this.db.collection("schedules").insertOne(scheduleDoc);
      console.log("✅ Schedule saved to database");
    } catch (error) {
      console.error("Error saving schedule:", error);
      throw error;
    }
  }

  /**
   * Get schedule for specific date
   */
  async getSchedule(date) {
    try {
      const schedule = await this.db.collection("schedules").findOne({
        date: new Date(date),
      });
      return schedule;
    } catch (error) {
      console.error("Error getting schedule:", error);
      throw error;
    }
  }

  /**
   * Get all schedules
   */
  async getAllSchedules() {
    try {
      const schedules = await this.db
        .collection("schedules")
        .find({})
        .sort({ date: -1 })
        .toArray();
      return schedules;
    } catch (error) {
      console.error("Error getting schedules:", error);
      throw error;
    }
  }

  /**
   * What-if scenario simulation
   */
  async simulateScenario(scenario) {
    try {
      console.log("🔮 Running what-if simulation...");

      const { targetDate, constraints, modifications = {} } = scenario;

      // Apply modifications to data
      const modifiedData = await this.applyModifications(modifications);

      // Generate schedule with modified data
      const schedule = await this.generateSchedule(targetDate, constraints);

      return {
        scenario: scenario,
        schedule: schedule,
        impact_analysis: await this.analyzeImpact(schedule, modifications),
      };
    } catch (error) {
      console.error("Error in simulation:", error);
      throw error;
    }
  }

  /**
   * Apply modifications for simulation
   */
  async applyModifications(modifications) {
    // This would modify the data based on scenario parameters
    // For now, return the original data
    return await this.getAllOperationalData();
  }

  /**
   * Analyze impact of modifications
   */
  async analyzeImpact(schedule, modifications) {
    return {
      trainsets_affected: schedule.schedule.induction_list.length,
      performance_impact: "Moderate",
      recommendations: [
        "Monitor performance closely",
        "Prepare contingency plans",
        "Update maintenance schedules",
      ],
    };
  }

  /**
   * Get performance analytics
   */
  async getPerformanceAnalytics() {
    try {
      const schedules = await this.getAllSchedules();
      const recentSchedules = schedules.slice(0, 30); // Last 30 schedules

      const analytics = {
        total_schedules: schedules.length,
        recent_schedules: recentSchedules.length,
        average_coverage: 0,
        performance_trends: {
          fitness_scores: [],
          maintenance_scores: [],
          branding_scores: [],
          mileage_scores: [],
        },
        recommendations: [],
      };

      if (recentSchedules.length > 0) {
        analytics.average_coverage =
          recentSchedules.reduce(
            (sum, s) => sum + (s.metadata?.coverage || 0),
            0
          ) / recentSchedules.length;

        // Analyze trends
        for (const schedule of recentSchedules) {
          if (schedule.schedule && schedule.schedule.induction_list) {
            const avgFitness =
              schedule.schedule.induction_list.reduce(
                (sum, t) => sum + (t.scores?.fitness || 0),
                0
              ) / schedule.schedule.induction_list.length;
            analytics.performance_trends.fitness_scores.push(avgFitness);
          }
        }
      }

      return analytics;
    } catch (error) {
      console.error("Error getting performance analytics:", error);
      throw error;
    }
  }

  /**
   * Get analytics for specific trainset
   */
  async getTrainsetAnalytics(trainsetId) {
    try {
      const schedules = await this.getAllSchedules();
      const trainsetSchedules = schedules.filter(
        (s) =>
          s.schedule?.induction_list?.some(
            (t) => t.trainset_id === trainsetId
          ) ||
          s.schedule?.standby_list?.some((t) => t.trainset_id === trainsetId) ||
          s.schedule?.maintenance_list?.some(
            (t) => t.trainset_id === trainsetId
          )
      );

      const analytics = {
        trainset_id: trainsetId,
        total_appearances: trainsetSchedules.length,
        induction_count: 0,
        standby_count: 0,
        maintenance_count: 0,
        average_score: 0,
        performance_trend: "stable",
        recommendations: [],
      };

      let totalScore = 0;
      for (const schedule of trainsetSchedules) {
        if (
          schedule.schedule?.induction_list?.some(
            (t) => t.trainset_id === trainsetId
          )
        ) {
          analytics.induction_count++;
          const trainset = schedule.schedule.induction_list.find(
            (t) => t.trainset_id === trainsetId
          );
          totalScore += trainset?.score || 0;
        }
        if (
          schedule.schedule?.standby_list?.some(
            (t) => t.trainset_id === trainsetId
          )
        ) {
          analytics.standby_count++;
        }
        if (
          schedule.schedule?.maintenance_list?.some(
            (t) => t.trainset_id === trainsetId
          )
        ) {
          analytics.maintenance_count++;
        }
      }

      analytics.average_score =
        totalScore / Math.max(1, analytics.induction_count);

      if (analytics.maintenance_count > analytics.induction_count) {
        analytics.performance_trend = "declining";
        analytics.recommendations.push("Consider maintenance review");
      } else if (analytics.induction_count > analytics.standby_count) {
        analytics.performance_trend = "improving";
      }

      return analytics;
    } catch (error) {
      console.error("Error getting trainset analytics:", error);
      throw error;
    }
  }

  /**
   * Optimize existing schedule
   */
  async optimizeExistingSchedule(scheduleId, optimizationParams) {
    try {
      const schedule = await this.db
        .collection("schedules")
        .findOne({ _id: scheduleId });
      if (!schedule) {
        throw new Error("Schedule not found");
      }

      // Apply optimization parameters
      const optimizedSchedule = await this.generateSchedule(
        new Date(schedule.date),
        { ...schedule.constraints, ...optimizationParams }
      );

      // Save optimized version
      optimizedSchedule.original_schedule_id = scheduleId;
      optimizedSchedule.optimization_params = optimizationParams;
      await this.saveSchedule(optimizedSchedule);

      return optimizedSchedule;
    } catch (error) {
      console.error("Error optimizing schedule:", error);
      throw error;
    }
  }

  /**
   * Validate constraints
   */
  async validateConstraints(constraints) {
    const validation = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // Validate required trainsets
    if (constraints.requiredTrainsets) {
      if (
        constraints.requiredTrainsets < 15 ||
        constraints.requiredTrainsets > 25
      ) {
        validation.valid = false;
        validation.errors.push("Required trainsets must be between 15 and 25");
      }
    }

    // Validate standby trainsets
    if (constraints.maxStandby) {
      if (constraints.maxStandby < 3 || constraints.maxStandby > 8) {
        validation.warnings.push("Standby trainsets should be between 3 and 8");
      }
    }

    // Validate maintenance trainsets
    if (constraints.maxMaintenance) {
      if (constraints.maxMaintenance < 1 || constraints.maxMaintenance > 5) {
        validation.warnings.push(
          "Maintenance trainsets should be between 1 and 5"
        );
      }
    }

    // Check total capacity
    const totalCapacity =
      (constraints.requiredTrainsets || 20) +
      (constraints.maxStandby || 5) +
      (constraints.maxMaintenance || 3);

    if (totalCapacity > 30) {
      validation.warnings.push("Total capacity exceeds recommended limit");
    }

    return validation;
  }
}

export default SchedulingEngine;
