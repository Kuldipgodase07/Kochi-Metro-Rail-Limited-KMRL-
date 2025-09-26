import mongoose from 'mongoose';

const StablingAssignmentSchema = new mongoose.Schema({
  trainset_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainset', required: true },
  bay_position: Number,
  assigned_date: Date,
  shunting_cost: Number,
  slot_efficiency: Number,
  remarks: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model('StablingAssignment', StablingAssignmentSchema);