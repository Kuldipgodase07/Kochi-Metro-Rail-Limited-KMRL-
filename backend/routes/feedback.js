import express from 'express';
const router = express.Router();
import InductionFeedback from '../models/InductionFeedback.js';

// Submit feedback for a trainset induction
router.post('/submit', async (req, res) => {
  try {
    const feedback = new InductionFeedback(req.body);
    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get feedback history for a trainset
router.get('/trainset/:id', async (req, res) => {
  try {
    const feedbacks = await InductionFeedback.find({ trainset_id: req.params.id }).sort({ induction_date: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;