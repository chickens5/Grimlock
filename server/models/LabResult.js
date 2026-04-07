import mongoose from 'mongoose';

const labResultSchema = new mongoose.Schema({
  plant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: true
  },
  sample_date: Date,
  lab_name: String,
  sample_type: {
    type: String,
    enum: ['flower', 'trim', 'extract', 'leaf']
  },

  // Cannabinoids
  cannabinoids: [{
    compound: String,
    pct: Number,
    lod: Number
  }],

  // Terpenes
  terpenes: [{
    compound: String,
    pct: Number
  }],

  // Contaminants
  contaminants: [{
    type: String,
    ppm: Number,
    pass: Boolean
  }],

  // Yield
  wet_weight_g: Number,
  dry_weight_g: Number,
  cure_weight_g: Number,
  harvest_date: Date
});

export default mongoose.model('LabResult', labResultSchema);
