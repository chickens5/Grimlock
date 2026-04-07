import mongoose from 'mongoose';

const growCycleSchema = new mongoose.Schema({
  plant_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant'
  }],
  room_id: String,
  start_date: Date,
  end_date: Date,

  // Sensor readings
  sensor_readings: [{
    ts: Date,
    temp_c: Number,
    humidity_pct: Number,
    vpd_kpa: Number,
    co2_ppm: Number,
    ppfd_umol: Number,
    ec_ms: Number,
    ph: Number
  }],

  // Nutrient schedule
  nutrient_schedule: [{
    date: Date,
    formula: String,
    ec_target: Number,
    ph_target: Number,
    additives: [{
      name: String,
      ml_per_gal: Number
    }]
  }]
});

export default mongoose.model('GrowCycle', growCycleSchema);
