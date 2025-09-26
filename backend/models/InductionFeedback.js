import mongoose from 'mongoose';

const InductionFeedbackSchema = new mongoose.Schema({
  trainset_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainset', required: true },
  induction_date: Date,
  recommended_status: String,
  actual_status: String,
  punctuality: Number,
  incidents: Number,
  notes: String,
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('InductionFeedback', InductionFeedbackSchema);