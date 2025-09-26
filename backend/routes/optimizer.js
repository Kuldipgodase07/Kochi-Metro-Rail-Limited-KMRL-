import express from 'express';
const router = express.Router();
import Trainset from '../models/Trainset.js';
import FitnessCertificate from '../models/FitnessCertificate.js';
import JobCard from '../models/JobCard.js';
import BrandingCampaign from '../models/BrandingCampaign.js';
import CleaningSlot from '../models/CleaningSlot.js';
import StablingAssignment from '../models/StablingAssignment.js';

// Rule-based induction optimizer
// Accepts optional scenario overrides in req.body.scenarioOverrides
router.post('/induction', async (req, res) => {
  try {
    // Fetch all trainsets
    const trainsets = await Trainset.find();
    const scenarioOverrides = req.body.scenarioOverrides || {};
    const results = [];
    for (const trainset of trainsets) {
      // Apply overrides if present
      const override = scenarioOverrides[trainset._id] || {};

      // Gather all variable data
      const [certs, jobs, branding, cleaning, stabling] = await Promise.all([
        FitnessCertificate.find({ trainset_id: trainset._id }),
        JobCard.find({ trainset_id: trainset._id, status: { $in: ['open', 'in_progress'] } }),
        BrandingCampaign.find({ trainset_id: trainset._id, status: 'active' }),
        CleaningSlot.find({ trainset_id: trainset._id, status: { $in: ['scheduled', 'overdue'] } }),
        StablingAssignment.find({ trainset_id: trainset._id })
      ]);

      // Rule-based logic
      let recommended = 'ready';
      let reasoning = [];
      let conflicts = [];
      let priority = 5;
      let riskFactors = [];

      // Safety: Expired/expiring fitness certificate
      const hasExpiredCert = override.forceExpiredCert !== undefined ? override.forceExpiredCert : certs.some(c => c.status === 'expired');
      const hasExpiringCert = override.forceExpiringCert !== undefined ? override.forceExpiringCert : certs.some(c => c.status === 'expiring');
      if (hasExpiredCert) {
        recommended = 'critical';
        reasoning.push('Fitness certificate expired');
        priority = 10;
        riskFactors.push('Safety certificate expired');
        conflicts.push('Cannot induct: certificate expired');
      } else if (hasExpiringCert) {
        recommended = 'maintenance';
        reasoning.push('Fitness certificate expiring soon');
        priority = 8;
        riskFactors.push('Certificate expiring');
      }

      // Maintenance: Critical job cards
      const hasCriticalJob = override.forceCriticalJob !== undefined ? override.forceCriticalJob : jobs.some(j => j.priority >= 4);
      if (hasCriticalJob) {
        recommended = 'critical';
        reasoning.push('Critical job card open');
        priority = 9;
        riskFactors.push('Critical maintenance required');
        conflicts.push('Cannot induct: critical job card');
      } else if (jobs.length > 0) {
        recommended = 'maintenance';
        reasoning.push('Open maintenance job cards');
        priority = 7;
      }

      // Branding: Active campaign priority
      const brandingActive = override.forceBrandingActive !== undefined ? override.forceBrandingActive : branding.length > 0;
      if (brandingActive) {
        reasoning.push('Active branding campaign');
        priority += 1;
      }

      // Cleaning: Overdue cleaning slot
      const hasOverdueCleaning = override.forceOverdueCleaning !== undefined ? override.forceOverdueCleaning : cleaning.some(s => s.status === 'overdue');
      if (hasOverdueCleaning) {
        recommended = 'maintenance';
        reasoning.push('Cleaning overdue');
        riskFactors.push('Passenger experience risk');
        conflicts.push('Cleaning overdue');
      }

      // Stabling: High shunting cost
      const stablingInfo = stabling[0];
      const highShuntingCost = override.forceHighShuntingCost !== undefined ? override.forceHighShuntingCost : (stablingInfo && stablingInfo.shunting_cost > 50);
      if (highShuntingCost) {
        reasoning.push('High shunting cost');
        priority -= 1;
      }

      // Availability
      const availability = override.forceAvailability !== undefined ? override.forceAvailability : trainset.availability_percentage;
      if (availability < 75) {
        recommended = 'critical';
        reasoning.push('Low availability');
        riskFactors.push('Fleet availability risk');
      } else if (availability < 90) {
        recommended = 'maintenance';
        reasoning.push('Moderate availability');
      }

      // Final result
      results.push({
        trainset_id: trainset._id,
        trainset_number: trainset.number,
        recommended_status: recommended,
        reasoning,
        conflicts,
        priority_score: priority,
        risk_factors: riskFactors,
        availability
      });
    }
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
