import mongoose from 'mongoose';

const JobCardSchema = new mongoose.Schema({
  trainset_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainset', required: true },
  maximo_work_order: String,
  status: { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
  description: String,
  priority: Number,
  estimated_hours: Number,
  actual_hours: Number,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  completed_at: Date
});

export default mongoose.model('JobCard', JobCardSchema);