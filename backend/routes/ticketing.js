import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Helper to get DB
async function getDb() {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database connection not available');
  return db;
}

// Date range helper
function getRangeFilter(range) {
  const now = new Date();
  let from;
  switch ((range || 'today').toLowerCase()) {
    case 'week':
      from = new Date(now);
      from.setDate(now.getDate() - 7);
      break;
    case 'month':
      from = new Date(now);
      from.setMonth(now.getMonth() - 1);
      break;
    case 'today':
    default:
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
  }
  return { created_at: { $gte: from, $lte: now } };
}

// Fallback mock data in case transactions collection not available
function mockMetrics(range = 'today') {
  if (range === 'today') {
    return { revenue: 425000, transactions: 2847, average: 149, successRate: 94.5 };
  } else if (range === 'week') {
    return { revenue: 2920000, transactions: 19850, average: 147, successRate: 94.1 };
  }
  return { revenue: 12100000, transactions: 81720, average: 148, successRate: 94.3 };
}

function mockTicketTypes() {
  return [
    { type: 'Single Journey', tickets: 1847, revenue: 184700 },
    { type: 'Return Journey', tickets: 892, revenue: 178400 },
    { type: 'Monthly Pass', tickets: 108, revenue: 61900 },
    { type: 'Student Pass', tickets: 156, revenue: 23400 },
  ];
}

function mockPayments() {
  return [
    { method: 'Card Payments', transactions: 1456 },
    { method: 'Mobile Wallets', transactions: 892 },
    { method: 'Cash', transactions: 499 },
    { method: 'UPI', transactions: 234 },
  ];
}

// GET /api/ticketing/metrics?range=today|week|month
router.get('/metrics', async (req, res) => {
  const { range = 'today' } = req.query;
  try {
    const db = await getDb();
    const coll = db.collection('transactions');
    const filter = getRangeFilter(range);

    // If collection exists, aggregate
    const exists = await coll.findOne({});
    if (exists) {
      const pipeline = [
        { $match: filter },
        {
          $group: {
            _id: null,
            revenue: { $sum: { $ifNull: ['$amount', 0] } },
            transactions: { $sum: 1 },
            success: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
          },
        },
        {
          $project: {
            _id: 0,
            revenue: 1,
            transactions: 1,
            average: { $cond: [{ $gt: ['$transactions', 0] }, { $divide: ['$revenue', '$transactions'] }, 0] },
            successRate: {
              $cond: [{ $gt: ['$transactions', 0] }, { $multiply: [{ $divide: ['$success', '$transactions'] }, 100] }, 0],
            },
          },
        },
      ];
      const [doc] = await coll.aggregate(pipeline).toArray();
      const data = doc || { revenue: 0, transactions: 0, average: 0, successRate: 0 };
      return res.json({ success: true, data });
    }
  } catch (err) {
    // ignore and fall back
  }
  return res.json({ success: true, data: mockMetrics(range) });
});

// GET /api/ticketing/ticket-types?range=
router.get('/ticket-types', async (req, res) => {
  const { range = 'today' } = req.query;
  try {
    const db = await getDb();
    const coll = db.collection('transactions');
    const filter = getRangeFilter(range);
    const exists = await coll.findOne({});
    if (exists) {
      const pipeline = [
        { $match: filter },
        {
          $group: {
            _id: { $ifNull: ['$ticket_type', 'Single Journey'] },
            tickets: { $sum: 1 },
            revenue: { $sum: { $ifNull: ['$amount', 0] } },
          },
        },
        { $project: { _id: 0, type: '$_id', tickets: 1, revenue: 1 } },
        { $sort: { tickets: -1 } },
      ];
      const rows = await coll.aggregate(pipeline).toArray();
      return res.json({ success: true, data: rows });
    }
  } catch (err) {
    // ignore
  }
  return res.json({ success: true, data: mockTicketTypes() });
});

// GET /api/ticketing/payments?range=
router.get('/payments', async (req, res) => {
  const { range = 'today' } = req.query;
  try {
    const db = await getDb();
    const coll = db.collection('transactions');
    const filter = getRangeFilter(range);
    const exists = await coll.findOne({});
    if (exists) {
      const pipeline = [
        { $match: filter },
        {
          $group: {
            _id: { $ifNull: ['$payment_method', 'Card Payments'] },
            transactions: { $sum: 1 },
          },
        },
        { $project: { _id: 0, method: '$_id', transactions: 1 } },
        { $sort: { transactions: -1 } },
      ];
      const rows = await coll.aggregate(pipeline).toArray();
      return res.json({ success: true, data: rows });
    }
  } catch (err) {
    // ignore
  }
  return res.json({ success: true, data: mockPayments() });
});

export default router;
