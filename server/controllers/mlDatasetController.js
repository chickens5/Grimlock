import MLDataset from '../models/MLDataset.js';
import Plant from '../models/Plant.js';
import Observation from '../models/Observation.js';

const DEFAULT_SCORE_WEIGHTS = {
  cbd: 0.4,
  minorCannabinoids: 0.25,
  terpeneUniqueness: 0.25,
  confidence: 0.1
};

const MINOR_CANNABINOIDS = ['cbg', 'cbc', 'cbdv', 'thcv', 'cbn'];

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeCompoundName(name) {
  return String(name || '').trim().toLowerCase();
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function minMaxNormalize(value, min, max) {
  if (max <= min) return 0;
  return (value - min) / (max - min);
}

function parseLineage(lineageRows) {
  const parents = [];

  lineageRows.forEach(row => {
    const cleaned = String(row || '').trim();
    if (!cleaned) return;

    cleaned
      .split(/\s+[xX]\s+|\s*\/\s*/)
      .map(part => part.trim())
      .filter(Boolean)
      .forEach(parent => parents.push(parent));
  });

  const unresolvedCount = parents.filter(
    parent => parent.includes('?') || /^#?n\/a$/i.test(parent)
  ).length;

  return {
    parentCount: parents.length,
    unresolvedParentRatio: parents.length > 0 ? unresolvedCount / parents.length : 1,
    parents
  };
}

function collectCannabinoids(labResults) {
  const cbdValues = [];
  const minorValues = [];

  labResults.forEach(result => {
    safeArray(result.cannabinoids).forEach(item => {
      const name = normalizeCompoundName(item.compound);
      const pct = Number(item.pct);
      if (!Number.isFinite(pct)) return;

      if (name === 'cbd' || name === 'cbda') {
        cbdValues.push(pct);
      }

      if (MINOR_CANNABINOIDS.includes(name)) {
        minorValues.push(pct);
      }
    });
  });

  return {
    cbdAvg: average(cbdValues),
    minorAvg: average(minorValues),
    sampleCount: labResults.length,
    cannabinoidObservationCount: cbdValues.length + minorValues.length
  };
}

function collectTerpenes(plant, labResults) {
  const compounds = [];

  safeArray(plant.terpene).forEach(compound => {
    compounds.push(String(compound).trim().toLowerCase());
  });

  labResults.forEach(result => {
    safeArray(result.terpenes).forEach(item => {
      const name = normalizeCompoundName(item.compound);
      if (name) compounds.push(name);
    });
  });

  return [...new Set(compounds.filter(Boolean))];
}

function getObservationQuality(observations) {
  const qualityValues = observations
    .map(obs => Number(obs.data_quality))
    .filter(value => Number.isFinite(value));

  return average(qualityValues);
}

function getScoreWeights(queryWeights) {
  const raw = {
    cbd: Number(queryWeights.cbd ?? DEFAULT_SCORE_WEIGHTS.cbd),
    minorCannabinoids: Number(queryWeights.minorCannabinoids ?? DEFAULT_SCORE_WEIGHTS.minorCannabinoids),
    terpeneUniqueness: Number(queryWeights.terpeneUniqueness ?? DEFAULT_SCORE_WEIGHTS.terpeneUniqueness),
    confidence: Number(queryWeights.confidence ?? DEFAULT_SCORE_WEIGHTS.confidence)
  };

  const sum = Object.values(raw).reduce((acc, value) => acc + (Number.isFinite(value) ? value : 0), 0);

  if (!sum) return DEFAULT_SCORE_WEIGHTS;

  return {
    cbd: raw.cbd / sum,
    minorCannabinoids: raw.minorCannabinoids / sum,
    terpeneUniqueness: raw.terpeneUniqueness / sum,
    confidence: raw.confidence / sum
  };
}

async function buildCultivarRows({ strainStatus }) {
  const plantFilter = {};
  if (strainStatus) plantFilter.strain_status = strainStatus;

  const [plants, observations] = await Promise.all([
    Plant.find(plantFilter).lean(),
    Observation.find({}).lean()
  ]);
  const labResults = [];

  const observationsByPlantId = new Map();
  observations.forEach(obs => {
    const key = obs.plant_id ? String(obs.plant_id) : '';
    if (!key) return;
    const rows = observationsByPlantId.get(key) || [];
    rows.push(obs);
    observationsByPlantId.set(key, rows);
  });

  const labsByPlantId = new Map();
  labResults.forEach(result => {
    const key = result.plant_id ? String(result.plant_id) : '';
    if (!key) return;
    const rows = labsByPlantId.get(key) || [];
    rows.push(result);
    labsByPlantId.set(key, rows);
  });

  const rows = plants.map(plant => {
    const plantId = String(plant._id);
    const plantObservations = observationsByPlantId.get(plantId) || [];
    const plantLabResults = labsByPlantId.get(plantId) || [];
    const lineage = parseLineage(safeArray(plant.lineage));
    const cannabinoid = collectCannabinoids(plantLabResults);
    const terpeneCompounds = collectTerpenes(plant, plantLabResults);
    const observationQuality = getObservationQuality(plantObservations);

    return {
      plant_id: plant._id,
      uid: plant.uid,
      product_name: plant.product_name || plant.genotype?.strain_name || plant.uid,
      strain_status: plant.strain_status || 'Unknown',
      cultivar_segment: plant.strain_status || 'Unknown',
      observation_ids: plantObservations.map(obs => obs._id).filter(Boolean),
      feature_vector: {
        lineage_parent_count: lineage.parentCount,
        lineage_unresolved_parent_ratio: lineage.unresolvedParentRatio,
        terpene_compound_count: terpeneCompounds.length,
        observation_count: plantObservations.length,
        observation_quality_avg: observationQuality,
        cannabinoid_sample_count: cannabinoid.sampleCount,
        cbd_avg_pct: cannabinoid.cbdAvg,
        minor_cannabinoid_avg_pct: cannabinoid.minorAvg
      },
      terpene_compounds: terpeneCompounds,
      lineage_parents: lineage.parents,
      provenance: 'assembly-reference-only'
    };
  });

  const terpeneFrequency = new Map();
  rows.forEach(row => {
    row.terpene_compounds.forEach(compound => {
      terpeneFrequency.set(compound, (terpeneFrequency.get(compound) || 0) + 1);
    });
  });

  rows.forEach(row => {
    const uniquenessValues = row.terpene_compounds.map(compound => {
      const freq = terpeneFrequency.get(compound) || 1;
      return 1 / freq;
    });
    row.feature_vector.terpene_uniqueness_raw = average(uniquenessValues);
  });

  return rows;
}

function scoreCultivarRows(rows, scoreWeights) {
  const cbdValues = rows.map(r => r.feature_vector.cbd_avg_pct);
  const minorValues = rows.map(r => r.feature_vector.minor_cannabinoid_avg_pct);
  const terpeneValues = rows.map(r => r.feature_vector.terpene_uniqueness_raw || 0);

  const cbdMin = Math.min(...cbdValues, 0);
  const cbdMax = Math.max(...cbdValues, 1);
  const minorMin = Math.min(...minorValues, 0);
  const minorMax = Math.max(...minorValues, 1);
  const terpeneMin = Math.min(...terpeneValues, 0);
  const terpeneMax = Math.max(...terpeneValues, 1);

  return rows
    .map(row => {
      const cbdScore = minMaxNormalize(row.feature_vector.cbd_avg_pct, cbdMin, cbdMax);
      const minorScore = minMaxNormalize(row.feature_vector.minor_cannabinoid_avg_pct, minorMin, minorMax);
      const terpeneScore = minMaxNormalize(row.feature_vector.terpene_uniqueness_raw || 0, terpeneMin, terpeneMax);

      const unresolvedPenalty = row.feature_vector.lineage_unresolved_parent_ratio * 0.5;
      const samplePenalty = row.feature_vector.cannabinoid_sample_count > 0 ? 0 : 0.5;
      const confidenceBase = row.feature_vector.observation_quality_avg > 0
        ? Math.min(row.feature_vector.observation_quality_avg / 100, 1)
        : 0.4;
      const confidenceScore = Math.max(0, Math.min(1, confidenceBase - unresolvedPenalty - samplePenalty));

      const composite = (
        cbdScore * scoreWeights.cbd +
        minorScore * scoreWeights.minorCannabinoids +
        terpeneScore * scoreWeights.terpeneUniqueness +
        confidenceScore * scoreWeights.confidence
      ) * 100;

      return {
        ...row,
        score: {
          composite: Number(composite.toFixed(2)),
          breakdown: {
            cbd: Number((cbdScore * 100).toFixed(2)),
            minor_cannabinoids: Number((minorScore * 100).toFixed(2)),
            terpene_uniqueness: Number((terpeneScore * 100).toFixed(2)),
            confidence: Number((confidenceScore * 100).toFixed(2))
          },
          weights: scoreWeights
        }
      };
    })
    .sort((a, b) => b.score.composite - a.score.composite);
}

export const getAllMLDatasets = async (req, res, next) => {
  try {
    const docs = await MLDataset.find().sort({ created_at: -1 });
    res.json(docs);
  } catch (error) {
    console.error('Error fetching ML datasets:', error);
    next(error);
  }
};

export const getMLDatasetById = async (req, res, next) => {
  try {
    const doc = await MLDataset.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'ML dataset not found' });
    }
    res.json(doc);
  } catch (error) {
    console.error('Error fetching ML dataset:', error);
    next(error);
  }
};

export const createMLDataset = async (req, res) => {
  try {
    const doc = new MLDataset(req.body);
    const saved = await doc.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating ML dataset:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteMLDataset = async (req, res, next) => {
  try {
    const deleted = await MLDataset.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'ML dataset not found' });
    }
    res.json({ message: 'ML dataset deleted successfully' });
  } catch (error) {
    console.error('Error deleting ML dataset:', error);
    next(error);
  }
};

export const generateMLDataset = async (req, res) => {
  try {
    const {
      name,
      task = 'cultivar-composite-ranking',
      target_field = 'score.composite',
      feature_fields = [
        'lineage_parent_count',
        'lineage_unresolved_parent_ratio',
        'terpene_compound_count',
        'observation_count',
        'observation_quality_avg',
        'cannabinoid_sample_count',
        'cbd_avg_pct',
        'minor_cannabinoid_avg_pct',
        'terpene_uniqueness_raw'
      ],
      query_filter = {},
      notes,
      version = 'v1'
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    const scoreWeights = getScoreWeights(req.body.score_weights || {});
    const rows = await buildCultivarRows({
      strainStatus: query_filter?.strain_status
    });
    const scoredRows = scoreCultivarRows(rows, scoreWeights);

    const observationIds = [...new Set(
      scoredRows
        .flatMap(row => row.observation_ids || [])
        .map(id => String(id))
        .filter(Boolean)
    )];

    const dataset = await MLDataset.create({
      name,
      task,
      target_field,
      feature_fields,
      query_filter,
      observation_ids: observationIds,
      version,
      notes: notes || `Generated with ${scoredRows.length} cultivar rows; provenance=assembly-reference-only`
    });

    res.status(201).json({
      dataset,
      summary: {
        row_count: scoredRows.length,
        provenance: 'assembly-reference-only',
        score_weights: scoreWeights
      },
      rows: scoredRows
    });
  } catch (error) {
    console.error('Error generating ML dataset:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getCultivarRankings = async (req, res, next) => {
  try {
    const scoreWeights = getScoreWeights({
      cbd: req.query.w_cbd,
      minorCannabinoids: req.query.w_minor,
      terpeneUniqueness: req.query.w_terpene,
      confidence: req.query.w_confidence
    });

    const rows = await buildCultivarRows({
      strainStatus: req.query.strain_status
    });
    const scoredRows = scoreCultivarRows(rows, scoreWeights);

    const limit = Math.max(1, Math.min(Number(req.query.limit) || 50, 250));

    res.json({
      summary: {
        total_rows: scoredRows.length,
        returned_rows: Math.min(limit, scoredRows.length),
        provenance: 'assembly-reference-only',
        score_weights: scoreWeights
      },
      rows: scoredRows.slice(0, limit)
    });
  } catch (error) {
    console.error('Error fetching cultivar rankings:', error);
    next(error);
  }
};
