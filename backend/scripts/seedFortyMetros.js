import mongoose from "mongoose";
import dotenv from "dotenv";
import Trainset from "../models/Trainset.js";
import Metrics from "../models/Metrics.js";

dotenv.config();

const connect = async () => {
  const uri =
    "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB:", uri);
};

const statuses = ["ready", "standby", "maintenance", "critical"];

const makeTrainset = (i) => {
  // ID format e.g., KMRL-001 ... KMRL-040
  const number = `KMRL-${String(i).padStart(3, "0")}`;

  // Distribute statuses roughly: ready (55%), standby (20%), maintenance (18%), critical (7%)
  const r = Math.random();
  let status = "ready";
  if (r > 0.55 && r <= 0.75) status = "standby";
  else if (r > 0.75 && r <= 0.93) status = "maintenance";
  else if (r > 0.93) status = "critical";

  const bay_position = i; // simple unique bay mapping 1..40
  const mileage = Math.floor(20000 + Math.random() * 60000); // 20k - 80k
  const lastDays = Math.floor(Math.random() * 20) + 1; // 1-20 days ago
  const last_cleaning = new Date(Date.now() - lastDays * 24 * 60 * 60 * 1000);
  const branding_priority = Math.floor(1 + Math.random() * 10);
  const availability_percentage = Math.max(
    0,
    Math.min(100, Math.round(60 + Math.random() * 40))
  );

  return {
    number,
    status,
    bay_position,
    mileage,
    last_cleaning,
    branding_priority,
    availability_percentage,
  };
};

const seed = async () => {
  await connect();

  // Build 40 entries
  const entries = Array.from({ length: 40 }, (_, idx) => makeTrainset(idx + 1));

  // Ensure uniqueness and replace existing KMRL-001..KMRL-040 for idempotency
  const ids = entries.map((t) => t.number);
  await Trainset.deleteMany({ number: { $in: ids } });
  const inserted = await Trainset.insertMany(entries);
  console.log(
    `🚆 Inserted ${inserted.length} metro trainsets (KMRL-001..KMRL-040)`
  );

  // Update metrics snapshot
  const all = await Trainset.find();
  const tally = all.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});
  const total = all.length;
  const ready = tally.ready || 0;
  const standby = tally.standby || 0;
  const maintenance = tally.maintenance || 0;
  const critical = tally.critical || 0;
  const operational = ready + standby;
  const serviceability = total ? Math.round((operational / total) * 100) : 0;
  const avgAvailability = total
    ? Math.round(
        all.reduce((s, t) => s + (t.availability_percentage || 0), 0) / total
      )
    : 0;

  await Metrics.findOneAndUpdate(
    {},
    {
      $set: {
        timestamp: new Date(),
        "fleet_status.total_fleet": total,
        "fleet_status.ready": ready,
        "fleet_status.standby": standby,
        "fleet_status.maintenance": maintenance,
        "fleet_status.critical": critical,
        "fleet_status.serviceability": serviceability,
        "fleet_status.avg_availability": avgAvailability,
        "current_kpis.fleet_availability": serviceability,
      },
    },
    { sort: { timestamp: -1 }, upsert: true, new: true }
  );
  console.log("📈 Metrics updated with current fleet snapshot");
};

seed()
  .then(async () => {
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  });
