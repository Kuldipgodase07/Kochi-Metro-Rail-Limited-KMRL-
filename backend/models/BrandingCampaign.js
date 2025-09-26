import mongoose from 'mongoose';

const BrandingCampaignSchema = new mongoose.Schema({
  trainset_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainset', required: true },
  advertiser: String,
  campaign_name: String,
  contract_value: Number,
  start_date: Date,
  end_date: Date,
  exposure_target: Number,
  actual_exposure: Number,
  wrap_area: String,
  status: { type: String, enum: ['active', 'expired', 'pending', 'compliant'], default: 'pending' },
  last_inspection_date: Date,
  renewal_probability: Number,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model('BrandingCampaign', BrandingCampaignSchema);