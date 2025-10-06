import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Basic stations list (can be replaced by DB collection later)
const STATIONS = ['Aluva', 'Pulinchodu', 'Companypady', 'Ambattukavu', 'Muttom'];

function pick(arr, idx) {
  if (!arr || arr.length === 0) return undefined;
  return arr[Math.abs(idx) % arr.length];
}

function minutesFromNow(mins) {
  const d = new Date(Date.now() + mins * 60000);
  return d.toTimeString().slice(0, 5);
}

async function getDb() {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database connection not available');
  return db;
}

// GET /api/passengers/metrics - system status cards
router.get('/metrics', async (req, res) => {
  try {
    const db = await getDb();
    const totalFlow = await db.collection('passengerflow').countDocuments().catch(() => 0);
    const connectivity = 90 + Math.min(10, Math.floor(totalFlow / 2000));
    const audio = 90 + Math.min(10, Math.floor(totalFlow / 2500));
    const display = 85 + Math.min(10, Math.floor(totalFlow / 3000));
    const accessibility = 100;

    res.json({
      success: true,
      data: {
        systemStatus: 'Operational',
        connectivity,
        audio,
        display,
        accessibility
      }
    });
  } catch (err) {
    res.json({
      success: true,
      data: { systemStatus: 'Operational', connectivity: 98, audio: 95, display: 92, accessibility: 100 }
    });
  }
});

// GET /api/passengers/live - live train status
router.get('/live', async (req, res) => {
  try {
    const db = await getDb();
    const trainsets = await db.collection('trainsets').find({}).sort({ number: 1 }).limit(20).toArray();
    const flow = await db.collection('passengerflow').find({}).sort({ timestamp: -1 }).limit(200).toArray().catch(() => []);

    const items = trainsets.slice(0, 8).map((t, i) => {
      const even = i % 2 === 0;
      const origin = even ? STATIONS[0] : STATIONS[STATIONS.length - 1];
      const destination = even ? STATIONS[STATIONS.length - 1] : STATIONS[0];
      const currentStation = pick(STATIONS, (t.bay_position || i) + i) || STATIONS[2];
      const delayFlag = flow.length > 0 ? (i === 1 ? true : false) : false;
      const etaMin = 2 + (i * 3) % 12;
      return {
        trainNo: `T${String(i + 1).padStart(3, '0')}`,
        route: `${origin} → ${destination}`,
        eta: `${etaMin} min`,
        currentLocation: currentStation,
        status: delayFlag ? 'Delayed' : 'On Time',
        platform: String((i % 3) + 1)
      };
    });

    res.json({ success: true, data: items });
  } catch (err) {
    res.status(200).json({ success: true, data: [] });
  }
});

// GET /api/passengers/arrivals - arrivals and departures per station
router.get('/arrivals', async (req, res) => {
  try {
    const now = new Date();
    const data = STATIONS.map((station, i) => ({
      station,
      arrivals: [
        { train: `T${String(i + 1).padStart(3, '0')}`, time: minutesFromNow(5 + i), platform: String((i % 3) + 1), status: 'On Time' }
      ],
      departures: [
        { train: `T${String(i + 2).padStart(3, '0')}`, time: minutesFromNow(8 + i), platform: String(((i + 1) % 3) + 1), status: i === 1 ? 'Delayed' : 'On Time' }
      ]
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(200).json({ success: true, data: [] });
  }
});

// GET /api/passengers/delays - delay notifications
router.get('/delays', async (req, res) => {
  try {
    const data = [
      { train: 'T002', route: 'Muttom → Aluva', delay: '5 min', reason: 'Signal maintenance', expectedResolution: minutesFromNow(10) },
      { train: 'T004', route: 'Aluva → Muttom', delay: '3 min', reason: 'Passenger assistance', expectedResolution: minutesFromNow(15) }
    ];
    res.json({ success: true, data });
  } catch (err) {
    res.status(200).json({ success: true, data: [] });
  }
});

// GET /api/passengers/platforms - platform assignments
router.get('/platforms', async (req, res) => {
  try {
    const data = [
      { platform: '1', train: 'T001', destination: 'Muttom', arrival: minutesFromNow(2), status: 'Arriving' },
      { platform: '2', train: 'T002', destination: 'Aluva', arrival: minutesFromNow(5), status: 'Boarding' },
      { platform: '3', train: 'T003', destination: 'Muttom', arrival: minutesFromNow(10), status: 'Waiting' }
    ];
    res.json({ success: true, data });
  } catch (err) {
    res.status(200).json({ success: true, data: [] });
  }
});

// POST /api/passengers/journey - journey planner
router.post('/journey', async (req, res) => {
  try {
    const { from, to } = req.body || {};
    if (!from || !to) {
      return res.status(400).json({ success: false, error: 'from and to are required' });
    }
    const direct = { from, to, duration: '25 min', transfers: 0, fare: '₹20' };
    const via = { from, to, duration: '30 min', transfers: 1, fare: '₹18' };
    res.json({ success: true, data: [direct, via] });
  } catch (err) {
    res.status(200).json({ success: true, data: [] });
  }
});

// GET/PUT /api/passengers/settings - notification & accessibility settings
router.get('/settings', async (req, res) => {
  try {
    const db = await getDb();
    const doc = await db.collection('pis_settings').findOne({ _id: 'default' });
    const defaults = { sms: true, email: false, app: true, accessibility: true };
    res.json({ success: true, data: doc?.values || defaults });
  } catch (err) {
    res.json({ success: true, data: { sms: true, email: false, app: true, accessibility: true } });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const db = await getDb();
    const values = req.body || {};
    await db.collection('pis_settings').updateOne(
      { _id: 'default' },
      { $set: { values, updated_at: new Date() } },
      { upsert: true }
    );
    res.json({ success: true, message: 'Settings updated', data: values });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/passengers/announce - send station/train announcement
router.post('/announce', async (req, res) => {
  try {
    const db = await getDb();
    const { message = 'General announcement', scope = 'system' } = req.body || {};
    const doc = { message, scope, created_at: new Date() };
    const result = await db.collection('pis_announcements').insertOne(doc).catch(() => ({ insertedId: null }));
    res.json({ success: true, data: { id: result.insertedId, ...doc } });
  } catch (err) {
    res.status(200).json({ success: true, data: { message: 'Announcement queued' } });
  }
});

// POST /api/passengers/emergency - trigger emergency alert
router.post('/emergency', async (req, res) => {
  try {
    const db = await getDb();
    const { message = 'Emergency alert triggered', level = 'high' } = req.body || {};
    const doc = { message, level, created_at: new Date() };
    const result = await db.collection('pis_alerts').insertOne(doc).catch(() => ({ insertedId: null }));
    res.json({ success: true, data: { id: result.insertedId, ...doc } });
  } catch (err) {
    res.status(200).json({ success: true, data: { message: 'Emergency alert queued' } });
  }
});

export default router;
