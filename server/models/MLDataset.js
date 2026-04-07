import mongoose from 'mongoose';

const mlDatasetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  task: String,
  target_field: String,
  feature_fields: [String],
  query_filter: mongoose.Schema.Types.Mixed,
  observation_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Observation'
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  version: String,
  notes: String
});

export default mongoose.model('MLDataset', mlDatasetSchema);
