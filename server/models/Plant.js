import mongoose from 'mongoose';

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

// Keep fields in sync for mixed old/new payloads.
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

  next();
});

export default mongoose.model('Plant', plantSchema);
