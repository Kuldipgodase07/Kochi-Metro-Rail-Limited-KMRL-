import express from 'express';
import { auth, requireAdmin } from '../middleware/auth.js';
import Incident from '../models/Incident.js';
import { notifyIncident, isTwilioConfigured } from '../services/notificationService.js';

const router = express.Router();

// POST /api/alerts/raise
// body: { type, message, severity: 'minor'|'major'|'critical', source?, metadata?, dedupeKey?, recipients? }
router.post('/raise', auth, requireAdmin, async (req, res) => {
  try {
    const { type, message, severity, source = 'system', metadata = {}, dedupeKey, recipients } = req.body || {};

    if (!type || !message || !severity) {
      return res.status(400).json({ message: 'type, message and severity are required' });
    }

    if (!['minor', 'major', 'critical'].includes(severity)) {
      return res.status(400).json({ message: 'Invalid severity' });
    }

    // Basic de-duplication (optional): if an open incident with same key exists in last 10 minutes, don’t spam
    let existing = null;
    if (dedupeKey) {
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
      existing = await Incident.findOne({ dedupeKey, createdAt: { $gte: tenMinAgo }, status: 'open' });
    }

    let incident = existing;
    if (!incident) {
      incident = await Incident.create({ type, message, severity, source, metadata, dedupeKey, recipients: [], notifiedChannels: [] });
    }

    // Build human-friendly message
    const composed = `[${severity.toUpperCase()}] ${type}: ${message}`;
    let notifyResult = { sms: [], whatsapp: [], voice: [], errors: [] };
    if (isTwilioConfigured()) {
      notifyResult = await notifyIncident({ message: composed, severity, recipients });
    }

    incident.lastNotifiedAt = new Date();
    incident.notifiedChannels = [
      ...(notifyResult.sms?.length ? ['sms'] : []),
      ...(notifyResult.whatsapp?.length ? ['whatsapp'] : []),
      ...(notifyResult.voice?.length ? ['voice'] : [])
    ];
    await incident.save();

    res.status(200).json({
      message: 'Incident processed',
      incident,
      notify: notifyResult,
      twilioConfigured: isTwilioConfigured()
    });
  } catch (err) {
    console.error('Alert raise error:', err);
    res.status(500).json({ message: 'Server error while raising alert' });
  }
});

// GET /api/alerts
// Query params: status=open|acknowledged|resolved, severity=minor|major|critical, since=<ISO>, limit=<n>
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const { status, severity, since, limit = 50 } = req.query;
    const q = {};
    if (status && ['open', 'acknowledged', 'resolved'].includes(status)) q.status = status;
    if (severity && ['minor', 'major', 'critical'].includes(severity)) q.severity = severity;
    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) q.createdAt = { $gte: sinceDate };
    }
    const items = await Incident.find(q).sort({ createdAt: -1 }).limit(Number(limit));
    res.json({ items });
  } catch (err) {
    console.error('List alerts error:', err);
    res.status(500).json({ message: 'Server error while listing alerts' });
  }
});

// PATCH /api/alerts/:id/ack
router.patch('/:id/ack', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findById(id);
    if (!incident) return res.status(404).json({ message: 'Incident not found' });
    if (incident.status === 'resolved') return res.status(400).json({ message: 'Incident already resolved' });
    incident.status = 'acknowledged';
    incident.acknowledgedAt = new Date();
    incident.acknowledgedBy = req.user?.username || 'unknown';
    await incident.save();
    res.json({ message: 'Incident acknowledged', incident });
  } catch (err) {
    console.error('Ack incident error:', err);
    res.status(500).json({ message: 'Server error while acknowledging alert' });
  }
});

// PATCH /api/alerts/:id/resolve
router.patch('/:id/resolve', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findById(id);
    if (!incident) return res.status(404).json({ message: 'Incident not found' });
    incident.status = 'resolved';
    incident.resolvedAt = new Date();
    incident.resolvedBy = req.user?.username || 'unknown';
    await incident.save();
    res.json({ message: 'Incident resolved', incident });
  } catch (err) {
    console.error('Resolve incident error:', err);
    res.status(500).json({ message: 'Server error while resolving alert' });
  }
});

export default router;
