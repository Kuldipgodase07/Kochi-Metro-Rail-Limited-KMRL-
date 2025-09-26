import express from 'express';
const router = express.Router();
import StablingAssignment from '../models/StablingAssignment.js';

// Ingest stabling assignment (manual/CSV)
router.post('/ingest', async (req, res) => {
  try {
    const assignment = new StablingAssignment(req.body);
    await assignment.save();
    res.status(201).json(assignment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List stabling assignments for a trainset
router.get('/trainset/:id', async (req, res) => {
  try {
    const assignments = await StablingAssignment.find({ trainset_id: req.params.id });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;