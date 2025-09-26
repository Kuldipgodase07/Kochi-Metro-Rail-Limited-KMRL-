import mongoose from 'mongoose';

const FitnessCertificateSchema = new mongoose.Schema({
  trainset_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainset', required: true },
  certificate_type: { type: String, required: true },
  issue_date: { type: Date, required: true },
  expiry_date: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'expiring'], default: 'active' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model('FitnessCertificate', FitnessCertificateSchema);