import mongoose from 'mongoose';
import { vibeClusterData } from './Concentrate.js';

const plantSchema = new mongoose.Schema({
  uid: {
    type: String,
    unique: true,
    required: true
  },

  // Product / cultivar fields
  product_name: String,
  breeder: String,
  strain_status: {
    type: String,
    enum: ["R&D", "House", "Premier", "Retired"]
  },
  type: {
    type: String,
    default: 'Flower'
  },
  lineage: [String],
  batch_number: String,
  terpene: {
    type: [String],
    default: [],
    alias: 'Terpene'
  },

  // Legacy genotype support (kept for backward compatibility)
  genotype: {
    strain_name: String,
    breeder: String,
    lineage: [String]
  },

  // VIBE Cluster Classification
  vibe_cluster: {
    type: String,
    enum: ['The Funk', 'The Juice', 'Floral Sweet', 'Summer Haze', 'Exotic', 'unclassified'],
    default: 'unclassified'
  },

  // Concentrates derived from this plant
  concentrates: [mongoose.Schema.Types.ObjectId],

  strain_image: String,

  // Metadata
  created_at: {
    type: Date,
    default: Date.now
  },
  tags: [String],
  notes: String,
  source_seed_id: mongoose.Schema.Types.ObjectId,
  is_clone: Boolean
});

// Keep fields in sync for mixed old/new payloads and auto-fill terpene drivers.
plantSchema.pre('validate', function syncSchemaFields(next) {
  if (!this.product_name && this.genotype?.strain_name) {
    this.product_name = this.genotype.strain_name;
  }

  if (!this.breeder && this.genotype?.breeder) {
    this.breeder = this.genotype.breeder;
  }

  if ((!this.lineage || this.lineage.length === 0) && this.genotype?.lineage?.length) {
    this.lineage = this.genotype.lineage;
  }

  const hasTerpene = Array.isArray(this.terpene) && this.terpene.length > 0;
  const clusterInfo = vibeClusterData[this.vibe_cluster];
  if (!hasTerpene && clusterInfo?.primary_terpene_drivers?.length) {
    this.terpene = clusterInfo.primary_terpene_drivers;
  }

  next();
});

export default mongoose.model('Plant', plantSchema);
