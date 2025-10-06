// Seed realistic past maintenance logs aligned with MaintenanceLog schema
// Usage:
//   node scripts/seedMaintenanceLogs.js [--limit=20] [--perTrain=10] [--clear]
// Notes:
// - Connects to the same MongoDB Atlas as the app (via config/database.js)
// - Generates weekly, monthly, and yearly past logs with varied types/statuses
// - Some logs are left in-progress (no serviceOutTime) to simulate ongoing work

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
import Trainset from '../models/Trainset.js';

// Basic CLI args parsing
const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const found = args.find(a => a.startsWith(`--${name}=`));
  if (!found) return fallback;
  const val = found.split('=')[1];
  if (val === undefined) return fallback;
  const num = Number(val);
  return Number.isNaN(num) ? val : num;
};

const LIMIT = getArg('limit', 20);         // Max trainsets to seed
const PER_TRAIN = getArg('perTrain', 10);  // Approx logs per trainset across the year
const SHOULD_CLEAR = args.includes('--clear');

// Helpers
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, digits = 2) => {
  const n = Math.random() * (max - min) + min;
  return Number(n.toFixed(digits));
};
const sample = (arr) => arr[rand(0, arr.length - 1)];

const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

// Create a random maintenance window in the past
function makeMaintenanceWindow({ withinDays, minHours = 2, maxHours = 72, allowInProgress = true }) {
  const start = new Date(daysAgo(rand(0, withinDays)).getTime() - rand(0, 12) * 60 * 60 * 1000);
  const durationHours = rand(minHours, maxHours);
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

  // 25% chance to leave it in-progress if allowed
  const inProgress = allowInProgress && Math.random() < 0.25;
  return { serviceInTime: start, serviceOutTime: inProgress ? null : end };
}

// Generate realistic performance parameters
function makePerformanceParams({ baseline = 60, variance = 30 } = {}) {
  const clamp = (n) => Math.max(0, Math.min(100, n));
  const v = (b) => clamp(rand(baseline, Math.min(100, baseline + variance)));
  return {
    brakingEfficiency: v(70),
    doorOperationScore: v(65),
    tractionMotorHealth: v(70),
    hvacSystemStatus: v(60),
    signalCommunicationQuality: v(65),
    batteryHealthStatus: v(60)
  };
}

// Make a single seeded log document
async function makeLogForTrain(train) {
  // Distribute logs: 20% weekly, 35% monthly, 45% yearly
  const bucket = Math.random();
  const withinDays = bucket < 0.2 ? 7 : bucket < 0.55 ? 30 : 365;
  const window = makeMaintenanceWindow({ withinDays, allowInProgress: true });

  const type = sample(['scheduled', 'unscheduled', 'preventive', 'corrective', 'emergency']);
  const priority = sample(['low', 'medium', 'high', 'critical']);
  const descriptions = {
    scheduled: 'Routine scheduled maintenance and inspection',
    preventive: 'Preventive maintenance: lubrication, calibration, safety checks',
    corrective: 'Corrective action for minor faults detected during operation',
    unscheduled: 'Unscheduled maintenance due to anomaly detection',
    emergency: 'Emergency intervention for critical subsystem'
  };

  // Components replaced (optional)
  const componentPool = [
    { componentName: 'Brake Pad', partNumber: 'BRK-781', cost: 3500 },
    { componentName: 'HVAC Filter', partNumber: 'HVC-220', cost: 1200 },
    { componentName: 'Door Motor', partNumber: 'DRM-442', cost: 9800 },
    { componentName: 'Battery Module', partNumber: 'BAT-900', cost: 25000 },
    { componentName: 'Signal Antenna', partNumber: 'SIG-130', cost: 4200 },
  ];
  const componentsReplaced = Math.random() < 0.4
    ? Array.from({ length: rand(1, 3) }, () => {
        const c = sample(componentPool);
        return { ...c, quantity: rand(1, 2) };
      })
    : [];

  const techniciansAssigned = Array.from({ length: rand(1, 3) }, (_, i) => ({
    name: `Tech ${rand(100, 999)}`,
    id: `T-${rand(1000, 9999)}`,
    specialization: sample(['Electrical', 'Mechanical', 'HVAC', 'Brakes', 'Doors'])
  }));

  const log = new MaintenanceLog({
    trainsetId: train._id,
    trainNumber: train.number,
    serviceInTime: window.serviceInTime,
    serviceOutTime: window.serviceOutTime || undefined,
    maintenanceType: type,
    maintenancePriority: priority,
    workDescription: descriptions[type],
    componentsReplaced,
    techniciansAssigned,
    performanceBeforeMaintenance: makePerformanceParams({ baseline: 55, variance: 25 }),
    // Start as in-maintenance; will be updated if completed
    trainStatus: 'in-maintenance',
    createdBy: 'system-seeder',
    remarks: Math.random() < 0.5 ? 'Seeded log for demo and testing' : undefined,
  });

  // If completed, add after-maintenance performance and costs, then assess readiness
  if (window.serviceOutTime) {
    log.performanceAfterMaintenance = makePerformanceParams({ baseline: 70, variance: 25 });
    log.totalMaintenanceCost = componentsReplaced.reduce((s, c) => s + (c.cost || 0) * (c.quantity || 1), 0)
      + rand(1000, 8000); // labour and misc
    log.nextScheduledMaintenance = new Date(log.serviceInTime.getTime() + rand(20, 90) * 24 * 60 * 60 * 1000);
    log.updatedBy = 'system-seeder';

    // Calculate performance and set readiness alert/status
    log.calculatePerformanceScore();
    log.assessReadiness();
  }

  return log;
}

async function seed() {
  await connectDB();

  try {
    if (SHOULD_CLEAR) {
      console.log('🧹 Clearing existing maintenance_logs collection...');
      await MaintenanceLog.deleteMany({});
    }

    const trainCount = await Trainset.countDocuments();
    if (trainCount === 0) {
      console.log('⚠️  No trainsets found. Seed trainsets first, then re-run this script.');
      return;
    }

    const trains = await Trainset.find({}).sort({ number: 1 }).limit(LIMIT);
    console.log(`🚆 Seeding maintenance logs for ${trains.length} trainsets (limit=${LIMIT})...`);

    let totalInserted = 0;
    for (const train of trains) {
      // Create a varied number of logs around PER_TRAIN (+/- 30%)
      const count = Math.max(3, Math.round(PER_TRAIN * (0.7 + Math.random() * 0.6)));
      const batch = [];
      for (let i = 0; i < count; i++) {
        const log = await makeLogForTrain(train);
        batch.push(log);
      }
      if (batch.length) {
        await MaintenanceLog.insertMany(batch);
        totalInserted += batch.length;
        console.log(`  • ${train.number}: inserted ${batch.length} logs`);
      }
    }

    console.log(`✅ Done. Inserted ${totalInserted} maintenance logs.`);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
  }
}

seed();
