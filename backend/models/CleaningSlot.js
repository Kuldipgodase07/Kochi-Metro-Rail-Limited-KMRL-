import mongoose from 'mongoose';

const CleaningSlotSchema = new mongoose.Schema({
  trainset_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainset', required: true },
  scheduled_date: Date,
  slot_time: String,
  status: { type: String, enum: ['scheduled', 'completed', 'overdue'], default: 'scheduled' },
  cleaning_type: { type: String, enum: ['routine', 'deep', 'emergency'], default: 'routine' },
  remarks: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model('CleaningSlot', CleaningSlotSchema);