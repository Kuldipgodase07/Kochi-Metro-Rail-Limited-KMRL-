import express from 'express';
const router = express.Router();
import CleaningSlot from '../models/CleaningSlot.js';

// Ingest cleaning slot (manual/CSV)
router.post('/ingest', async (req, res) => {
  try {
    const slot = new CleaningSlot(req.body);
    await slot.save();
    res.status(201).json(slot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List cleaning slots for a trainset
router.get('/trainset/:id', async (req, res) => {
  try {
    const slots = await CleaningSlot.find({ trainset_id: req.params.id });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;