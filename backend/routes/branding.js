import express from 'express';
const router = express.Router();
import BrandingCampaign from '../models/BrandingCampaign.js';

// Ingest branding campaign (manual/CSV)
router.post('/ingest', async (req, res) => {
  try {
    const campaign = new BrandingCampaign(req.body);
    await campaign.save();
    res.status(201).json(campaign);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List campaigns for a trainset
router.get('/trainset/:id', async (req, res) => {
  try {
    const campaigns = await BrandingCampaign.find({ trainset_id: req.params.id });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;