import mongoose from 'mongoose';

const concentrateSchema = new mongoose.Schema({
  uid: {
    type: String,
    unique: true,
    required: true
  },

  // Product Info
  product_name: String,
  status: {
    type: String,
    enum: ['Premier', 'Standard', 'Limited', 'Experimental'],
    default: 'Standard'
  },
  type: {
    type: String,
    enum: ['Rosin', 'Live Rosin', 'Hash', 'Kief', 'Wax', 'Badder', 'Sugar', 'Sauce', 'Diamond & Sauce', 'Other'],
    default: 'Other'
  },

  // VIBE Cluster Classification
  vibe_cluster: {
    type: String,
    enum: ['The Funk', 'The Juice', 'Floral Sweet', 'Summer Haze', 'Exotic'],
    required: true
  },

  // Terpene Profile
  terpenes: {
    primary_drivers: [String],
    tasting_notes: [String],
    full_profile: [{
      name: String,
      percentage: Number
    }]
  },

  // Source & Lineage
  source_plant_id: mongoose.Schema.Types.ObjectId,
  lineage: [String],

  // Analysis Data
  potency: {
    thc_percentage: Number,
    cbd_percentage: Number,
    total_terpenes: Number
  },

  // Metadata
  batch_number: String,
  lab_url: String,
  created_at: {
    type: Date,
    default: Date.now
  },
  notes: String,
  tags: [String]
});

// VIBE Cluster Data
export const vibeClusterData = {
  'The Funk': {
    primary_terpene_drivers: ['β-Caryophyllene', 'D-limonene'],
    tasting_notes: ['Gas', 'Dough', 'Sour', 'Cake']
  },
  'The Juice': {
    primary_terpene_drivers: ['Ocimene', 'Linalool'],
    tasting_notes: ['Fruit', 'Citrus', 'Cheese']
  },
  'Floral Sweet': {
    primary_terpene_drivers: ['β-Myrcene', 'α-Pinene'],
    tasting_notes: ['Floral', 'Candy', 'Pine']
  },
  'Summer Haze': {
    primary_terpene_drivers: ['Terpinolene'],
    tasting_notes: ['Lemon', 'Cleaner', 'Sweet']
  },
  'Exotic': {
    primary_terpene_drivers: ['Non-Standard Profile'],
    tasting_notes: ['Unique']
  }
};

export default mongoose.model('Concentrate', concentrateSchema);
