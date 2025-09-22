import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['minor', 'major', 'critical'], required: true },
  source: { type: String, default: 'system' },
  metadata: { type: Object, default: {} },
  status: { type: String, enum: ['open', 'acknowledged', 'resolved'], default: 'open' },
  dedupeKey: { type: String },
  recipients: [{ type: String }],
  notifiedChannels: [{ type: String }],
  lastNotifiedAt: { type: Date },
  acknowledgedAt: { type: Date },
  resolvedAt: { type: Date },
  acknowledgedBy: { type: String },
  resolvedBy: { type: String },
}, { timestamps: true });

incidentSchema.index({ createdAt: -1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ dedupeKey: 1 });

const Incident = mongoose.model('Incident', incidentSchema);

export default Incident;