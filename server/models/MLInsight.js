import mongoose from 'mongoose';

const mlInsightSchema = new mongoose.Schema({
  run_type: {
    type: String,
    enum: ['hydroponic', 'diagnosis'],
    required: true,
    index: true
  },
  plant_id: {
    type: mongoose.Schema.Types.Mixed,
    index: true
  },
  har_grp: {
    type: String,
    trim: true,
    index: true
  },
  observation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Observation'
  },
  input_snapshot: mongoose.Schema.Types.Mixed,
  analysis: {
    risk_level: String,
    confidence: Number,
    alerts: [String],
    metrics: mongoose.Schema.Types.Mixed,
    likely_issues: [String]
  },
  recommendations: [String],
  model_version: {
    type: String,
    default: 'rules-v1'
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export default mongoose.model('MLInsight', mlInsightSchema);
