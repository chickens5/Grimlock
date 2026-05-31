import mongoose from 'mongoose';

const harvestGroupPlantSchema = new mongoose.Schema(
  {
    cultivar_name: {
      type: String,
      trim: true,
      default: ''
    },
    strain_name: {
      type: String,
      trim: true,
      default: ''
    },
    plant_count: {
      type: Number,
      default: 1,
      min: 1
    },
    current_room: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: true }
);

const harvestGroupSchema = new mongoose.Schema(
  {
    har_grp: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    current_room: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    image_url: {
      type: String,
      trim: true,
      default: ''
    },
    plants: {
      type: [harvestGroupPlantSchema],
      default: []
    }
  },
  { timestamps: true }
);

export default mongoose.model('HarvestGroup', harvestGroupSchema);
