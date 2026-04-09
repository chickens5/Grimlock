import mongoose from 'mongoose';

const symptomSchema = new mongoose.Schema(
  {
    type: { type: String },
    severity: Number,
    location: String,
    confirmed_by: String
  },
  { _id: false }
);

const observationSchema = new mongoose.Schema({
  plant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: true
  },
  
  observ_img: String,

  recorded_at: {
    type: Date,
    default: Date.now
  },
  growth_stage: {
    type: String,
    enum: ['seedling', 'vegetative', 'pre-flower', 'flower', 'late-flower', 'harvest'],
    required: true
  },

  // Morphology
  morphology: {
    height_cm: Number,
    canopy_width_cm: Number,
    internode_length_cm: Number,
    leaf_count: Number,
    leaf_shape: String,
    stem_diameter_mm: Number,
    cola_count: Number
  },

  // Health & stress
  health: {
    overall_score: Number,
    symptoms: [symptomSchema],
    stress_type: [String]
  },

  // Environment snapshot
  environment_snapshot: {
    vpd_kpa: Number,
    temp_c: Number,
    humidity_pct: Number,
    co2_ppm: Number,
    ppfd_umol: Number,
    photoperiod_hrs: Number,
    medium: String,
    runoff_ec: Number,
    runoff_ph: Number
  },

  // Media
  media: [{
    url: String,
    type: {
      type: String,
      enum: ['rgb', 'infrared', 'uv', 'microscope']
    },
    angle: String,
    ml_labels: [{
      label: String,
      confidence: Number,
      model_version: String,
      bounding_box: {
        x: Number,
        y: Number,
        w: Number,
        h: Number
      }
    }]
  }],

  recorded_by: String,
  data_quality: Number
});



export default mongoose.model('Observation', observationSchema);
