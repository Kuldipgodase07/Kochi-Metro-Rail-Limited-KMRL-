import express from 'express';
import MaintenanceLog from '../models/MaintenanceLog.js';
import Trainset from '../models/Trainset.js';

const router = express.Router();

// Helper: Map database/raw status to frontend status labels
const mapStatusToFrontend = (dbStatus) => {
  if (!dbStatus) return 'standby';
  const statusMap = {
    in_service: 'ready',
    ready: 'ready',
    standby: 'standby',
    IBL_maintenance: 'maintenance',
    maintenance: 'maintenance',
    critical: 'critical'
  };
  const key = typeof dbStatus === 'string' ? dbStatus : `${dbStatus}`;
  return statusMap[key] || 'standby';
};

// GET /api/maintenance/stats - Get maintenance statistics (MUST be before /:id)
router.get('/maintenance/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const [
      totalLogs,
      inMaintenance,
      readyTrains,
      dropoutTrains,
      avgPerformanceResult
    ] = await Promise.all([
      MaintenanceLog.countDocuments(dateFilter),
      MaintenanceLog.countDocuments({ ...dateFilter, trainStatus: 'in-maintenance' }),
      MaintenanceLog.countDocuments({ ...dateFilter, trainStatus: 'ready' }),
      MaintenanceLog.countDocuments({ ...dateFilter, trainStatus: 'dropout' }),
      MaintenanceLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, avgScore: { $avg: '$overallPerformanceScore' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalLogs,
        inMaintenance,
        ready: readyTrains,
        dropout: dropoutTrains,
        averageScore: avgPerformanceResult[0]?.avgScore || 0
      }
    });
  } catch (error) {
    console.error('Error fetching maintenance stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/maintenance/alerts/active - Get active alerts (MUST be before /:id)
router.get('/maintenance/alerts/active', async (req, res) => {
  try {
    const alerts = await MaintenanceLog.find({
      alertGenerated: true,
      trainStatus: { $in: ['ready', 'dropout', 'testing'] }
    })
      .populate('trainsetId', 'number depot')
      .sort({ alertTimestamp: -1 })
      .limit(20);

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/maintenance - Get all maintenance logs with filters
router.get('/maintenance', async (req, res) => {
  try {
    const { trainNumber, status, startDate, endDate, limit = 50 } = req.query;

    const query = {};
    
    if (trainNumber) {
      query.trainNumber = trainNumber;
    }
    
    if (status) {
      query.trainStatus = status;
    }
    
    if (startDate || endDate) {
      query.serviceInTime = {};
      if (startDate) query.serviceInTime.$gte = new Date(startDate);
      if (endDate) query.serviceInTime.$lte = new Date(endDate);
    }

    const logs = await MaintenanceLog.find(query)
      .populate('trainsetId', 'number status depot')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching maintenance logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/maintenance/duration-report - Get maintenance duration report for all trains
router.get('/maintenance/duration-report', async (req, res) => {
  try {
    const { period = 'month' } = req.query; // period: week, month, year
    
    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

  // Get all trainsets
  const trainsets = await Trainset.find({}).sort({ number: 1 });

    // For each train, calculate maintenance days in the period
    const report = await Promise.all(
      trainsets.map(async (train) => {
        // Get all maintenance logs for this train in the date range
        const logs = await MaintenanceLog.find({
          $and: [
            {
              $or: [
                { trainsetId: train._id },
                { trainNumber: train.number }
              ]
            },
            { serviceInTime: { $gte: startDate, $lte: now } }
          ]
        }).sort({ serviceInTime: -1 });

        // Calculate total maintenance days
        let totalDays = 0;
        let totalMaintenanceSessions = logs.length;
        let completedSessions = 0;
        let averagePerformance = 0;
        let totalCost = 0;

        logs.forEach((log) => {
          const inTime = new Date(log.serviceInTime).getTime();
          if (log.serviceOutTime) {
            const outTime = new Date(log.serviceOutTime).getTime();
            const duration = (outTime - inTime) / (1000 * 60 * 60 * 24);
            totalDays += Math.max(duration, 0);
            completedSessions++;
            averagePerformance += log.overallPerformanceScore || 0;
            totalCost += log.totalMaintenanceCost || 0;
          } else {
            // Count ongoing maintenance time up to now
            const duration = (now.getTime() - inTime) / (1000 * 60 * 60 * 24);
            totalDays += Math.max(duration, 0);
          }
        });

        if (completedSessions > 0) {
          averagePerformance = averagePerformance / completedSessions;
        }

        return {
          trainNumber: train.number,
          trainId: train._id,
          currentStatus: mapStatusToFrontend(train.current_status || train.status),
          totalMaintenanceDays: Math.round(totalDays * 100) / 100,
          totalMaintenanceSessions,
          completedSessions,
          inProgressSessions: totalMaintenanceSessions - completedSessions,
          averagePerformanceScore: Math.round(averagePerformance * 100) / 100,
          totalMaintenanceCost: totalCost,
          mileage: train.mileage,
          availability: train.availability_percentage,
          lastMaintenance: logs[0] ? logs[0].serviceInTime : null,
          maintenanceLogs: logs.map(log => ({
            _id: log._id,
            serviceInTime: log.serviceInTime,
            serviceOutTime: log.serviceOutTime,
            maintenanceType: log.maintenanceType,
            description: log.workDescription,
            maintenanceDuration: log.maintenanceDuration || (log.calculatedDuration ?? 0),
            overallPerformanceScore: log.overallPerformanceScore || 0,
            totalMaintenanceCost: log.totalMaintenanceCost || 0,
            trainStatus: log.trainStatus,
            alertType: log.alertType,
            status: log.trainStatus,
            performanceParameters: log.performanceAfterMaintenance
              ? {
                  braking_system_score: log.performanceAfterMaintenance.brakingEfficiency,
                  traction_system_score: log.performanceAfterMaintenance.tractionMotorHealth,
                  door_system_score: log.performanceAfterMaintenance.doorOperationScore,
                  signaling_score: log.performanceAfterMaintenance.signalCommunicationQuality,
                  hvac_score: log.performanceAfterMaintenance.hvacSystemStatus,
                  battery_health_score: log.performanceAfterMaintenance.batteryHealthStatus
                }
              : undefined
          }))
        };
      })
    );

    // Sort by total maintenance days (descending)
    report.sort((a, b) => b.totalMaintenanceDays - a.totalMaintenanceDays);

    res.json({
      success: true,
      period,
      periodStart: startDate,
      periodEnd: now,
      totalTrains: report.length,
      data: report
    });
  } catch (error) {
    console.error('Error generating duration report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/maintenance/issues - Detect trains with back-to-back or frequent maintenance
// Query params (optional): periodDays (default 30), gapHours (default 48)
router.get('/maintenance/issues', async (req, res) => {
  try {
    const periodDays = Math.max(1, parseInt(req.query.periodDays) || 30);
    const gapHoursThreshold = Math.max(1, parseInt(req.query.gapHours) || 48);
    const now = new Date();
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // Pull recent logs needed for analysis
    const logs = await MaintenanceLog.find({
      serviceInTime: { $gte: startDate, $lte: now }
    })
      .select('trainsetId trainNumber serviceInTime serviceOutTime maintenanceType overallPerformanceScore performanceAfterMaintenance componentsReplaced')
      .sort({ trainNumber: 1, serviceInTime: 1 });

    const byTrain = new Map();
    for (const log of logs) {
      const key = log.trainNumber || (log.trainsetId?.toString() ?? 'unknown');
      if (!byTrain.has(key)) byTrain.set(key, []);
      byTrain.get(key).push(log);
    }

    const issues = [];
    for (const [trainNumber, tlogs] of byTrain.entries()) {
      if (!tlogs || tlogs.length < 2) continue; // Need at least 2 to assess back-to-back

      // Compute gaps between consecutive visits
      let minGapHours = Infinity;
      let backToBackCount = 0;
      let repeatedTypeStreaks = 0;
      let topRepeatedType = null;
      const typeCounts = {};

      for (let i = 1; i < tlogs.length; i++) {
        const prev = tlogs[i - 1];
        const curr = tlogs[i];
        const prevOut = prev.serviceOutTime ? new Date(prev.serviceOutTime).getTime() : new Date(prev.serviceInTime).getTime();
        const currIn = new Date(curr.serviceInTime).getTime();
        const gapH = Math.max(0, (currIn - prevOut) / (1000 * 60 * 60));
        if (gapH < minGapHours) minGapHours = gapH;
        if (gapH <= gapHoursThreshold) backToBackCount++;
        if (prev.maintenanceType && curr.maintenanceType && prev.maintenanceType === curr.maintenanceType && gapH <= 14 * 24) {
          repeatedTypeStreaks++;
          topRepeatedType = curr.maintenanceType;
        }
      }

      // Count visits and assess last performance
      const visits = tlogs.length;
      const completedDesc = [...tlogs].filter(l => !!l.serviceOutTime);
      const lastCompleted = completedDesc.length ? completedDesc[completedDesc.length - 1] : null;
      const lastPerformance = lastCompleted ? (lastCompleted.overallPerformanceScore || 0) : null;

      // Component frequency (to hint likely subsystem)
      const compFreq = {};
      for (const l of tlogs) {
        (l.componentsReplaced || []).forEach(c => {
          if (!c || !c.componentName) return;
          compFreq[c.componentName] = (compFreq[c.componentName] || 0) + 1;
        });
      }
      const topComponent = Object.entries(compFreq).sort((a,b) => b[1]-a[1])[0]?.[0] || null;

      // Determine severity
      let severity = null;
      if (visits >= 4 || minGapHours < 24 || (lastPerformance !== null && lastPerformance < 60)) {
        severity = 'high';
      } else if (visits >= 3 || minGapHours < gapHoursThreshold || (lastPerformance !== null && lastPerformance < 70)) {
        severity = 'medium';
      }

      if (!severity) continue;

      // Build description explaining WHY
      const reasons = [];
      reasons.push(`${visits} maintenance visit${visits>1?'s':''} in the last ${periodDays} days`);
      if (Number.isFinite(minGapHours)) reasons.push(`shortest gap ${Math.round(minGapHours)}h (threshold ${gapHoursThreshold}h)`);
      if (backToBackCount > 0) reasons.push(`${backToBackCount} back-to-back visit${backToBackCount>1?'s':''}`);
      if (repeatedTypeStreaks > 0 && topRepeatedType) reasons.push(`repeated ${topRepeatedType} maintenance`);
      if (lastPerformance !== null) reasons.push(`last performance ${Math.round(lastPerformance)}%`);
      if (topComponent) reasons.push(`frequent component: ${topComponent}`);

      const description = `Train ${trainNumber} flagged due to ${reasons.join(', ')}. Suggest investigating recurring faults and root cause.`;

      // Prepare recent log summary (up to last 3)
      const recentLogs = tlogs.slice(-3).map(l => ({
        _id: l._id,
        serviceInTime: l.serviceInTime,
        serviceOutTime: l.serviceOutTime,
        maintenanceType: l.maintenanceType,
        overallPerformanceScore: l.overallPerformanceScore || 0
      }));

      issues.push({
        trainId: tlogs[0].trainsetId,
        trainNumber,
        severity,
        description,
        stats: {
          periodDays,
          visitsLastNDays: visits,
          backToBackCount,
          minGapHours: Number.isFinite(minGapHours) ? Math.round(minGapHours) : null,
          repeatedTypeStreaks,
          lastPerformance: lastPerformance !== null ? Math.round(lastPerformance) : null
        },
        recentLogs
      });
    }

    // Sort by severity then by visits descending
    const order = { high: 0, medium: 1 };
    issues.sort((a,b) => (order[a.severity]-order[b.severity]) || (b.stats.visitsLastNDays - a.stats.visitsLastNDays));

    res.json({ success: true, count: issues.length, data: issues });
  } catch (error) {
    console.error('Error generating maintenance issues:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/maintenance/:id - Get single maintenance log
router.get('/maintenance/:id', async (req, res) => {
  try {
    const log = await MaintenanceLog.findById(req.params.id)
      .populate('trainsetId', 'number status depot mileage');

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Error fetching maintenance log:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/maintenance - Create new maintenance log
router.post('/maintenance', async (req, res) => {
  try {
    const {
      trainsetId,
      trainNumber,
      serviceInTime,
      maintenanceType,
      maintenancePriority,
      workDescription,
      componentsReplaced,
      techniciansAssigned,
      performanceBeforeMaintenance,
      createdBy,
      remarks
    } = req.body;

    // Validate required fields
    if (!trainsetId || !trainNumber || !serviceInTime || !maintenanceType || !workDescription || !createdBy) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Check if trainset exists
    const trainset = await Trainset.findById(trainsetId);
    if (!trainset) {
      return res.status(404).json({
        success: false,
        error: 'Trainset not found'
      });
    }

    const maintenanceLog = new MaintenanceLog({
      trainsetId,
      trainNumber,
      serviceInTime: new Date(serviceInTime),
      maintenanceType,
      maintenancePriority: maintenancePriority || 'medium',
      workDescription,
      componentsReplaced: componentsReplaced || [],
      techniciansAssigned: techniciansAssigned || [],
      performanceBeforeMaintenance,
      trainStatus: 'in-maintenance',
      createdBy,
      remarks
    });

    await maintenanceLog.save();

    // Update trainset status
    trainset.status = 'maintenance';
    await trainset.save();

    res.status(201).json({
      success: true,
      message: 'Maintenance log created successfully',
      data: maintenanceLog
    });
  } catch (error) {
    console.error('Error creating maintenance log:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/maintenance/:id/complete - Complete maintenance with performance data
router.put('/maintenance/:id/complete', async (req, res) => {
  try {
    const {
      serviceOutTime,
      performanceAfterMaintenance,
      totalMaintenanceCost,
      nextScheduledMaintenance,
      updatedBy,
      readinessCheckedBy,
      remarks
    } = req.body;

    if (!serviceOutTime || !performanceAfterMaintenance || !updatedBy) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for completion'
      });
    }

    const log = await MaintenanceLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance log not found'
      });
    }

    // Update maintenance completion details
    log.serviceOutTime = new Date(serviceOutTime);
    log.performanceAfterMaintenance = performanceAfterMaintenance;
    log.totalMaintenanceCost = totalMaintenanceCost || 0;
    log.nextScheduledMaintenance = nextScheduledMaintenance;
    log.updatedBy = updatedBy;
    log.readinessCheckedBy = readinessCheckedBy || updatedBy;
    if (remarks) log.remarks = remarks;

    // Calculate performance and assess readiness
    log.calculatePerformanceScore();
    const readinessResult = log.assessReadiness();

    await log.save();

    // Update trainset status based on readiness
    const trainset = await Trainset.findById(log.trainsetId);
    if (trainset) {
      if (readinessResult.ready) {
        trainset.status = 'ready';  // Changed from 'available' to match enum
      } else if (readinessResult.status === 'dropout') {
        trainset.status = 'critical';  // Changed from 'out-of-service' to match enum
      } else {
        trainset.status = 'standby';  // Changed from 'testing' to match enum
      }
      await trainset.save();
    }

    res.json({
      success: true,
      message: 'Maintenance completed and performance assessed',
      data: log,
      readiness: readinessResult
    });
  } catch (error) {
    console.error('Error completing maintenance:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/maintenance/:id - Update maintenance log
router.put('/maintenance/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    const log = await MaintenanceLog.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedBy: updates.updatedBy },
      { new: true, runValidators: true }
    );

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance log not found'
      });
    }

    res.json({
      success: true,
      message: 'Maintenance log updated successfully',
      data: log
    });
  } catch (error) {
    console.error('Error updating maintenance log:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/maintenance/:id - Delete maintenance log
router.delete('/maintenance/:id', async (req, res) => {
  try {
    const log = await MaintenanceLog.findByIdAndDelete(req.params.id);

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance log not found'
      });
    }

    res.json({
      success: true,
      message: 'Maintenance log deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting maintenance log:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/maintenance/performance-trend/:trainsetId - Get performance trend for a train
router.get('/maintenance/performance-trend/:trainsetId', async (req, res) => {
  try {
    const logs = await MaintenanceLog.find({
      trainsetId: req.params.trainsetId,
      performanceAfterMaintenance: { $exists: true }
    })
      .sort({ serviceOutTime: 1 })
      .limit(20);

    const trend = logs.map(log => ({
      date: log.serviceOutTime,
      score: log.overallPerformanceScore,
      status: log.trainStatus,
      parameters: log.performanceAfterMaintenance
    }));

    res.json({
      success: true,
      count: trend.length,
      data: trend
    });
  } catch (error) {
    console.error('Error fetching performance trend:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
