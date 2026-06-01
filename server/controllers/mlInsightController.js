import Observation from '../models/Observation.js';
import MLInsight from '../models/MLInsight.js';

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function resolveObservation(body) {
  const { observationId, plantId, harGrp } = body;

  if (observationId) {
    return Observation.findById(observationId).lean();
  }

  if (!plantId) {
    return null;
  }

  const filter = {
    $or: [{ plant_id: String(plantId) }, { hg_plant_id: String(plantId) }]
  };

  if (harGrp) {
    filter.har_grp = harGrp;
  }

  return Observation.findOne(filter).sort({ recorded_at: -1 }).lean();
}

function buildHydroponicAnalysis(observation) {
  const env = observation?.environment_snapshot || {};
  const tempC = toNumber(env.temp_c);
  const humidityPct = toNumber(env.humidity_pct);
  const vpdKpa = toNumber(env.vpd_kpa);
  const runoffPh = toNumber(env.runoff_ph);
  const runoffEc = toNumber(env.runoff_ec);

  const alerts = [];
  const recommendations = [];

  if (tempC != null && (tempC < 20 || tempC > 26)) {
    alerts.push(`Temperature is out of target range: ${tempC}C`);
    recommendations.push('Target canopy temperature between 20C and 26C for stable growth.');
  }

  if (humidityPct != null && (humidityPct < 50 || humidityPct > 70)) {
    alerts.push(`Humidity is out of target range: ${humidityPct}%`);
    recommendations.push('Keep RH near 50-70% and pair with airflow to reduce disease pressure.');
  }

  if (vpdKpa != null && (vpdKpa < 0.8 || vpdKpa > 1.3)) {
    alerts.push(`VPD is out of target range: ${vpdKpa} kPa`);
    recommendations.push('Adjust temp/RH to keep VPD around 0.8-1.3 kPa by stage.');
  }

  if (runoffPh != null && (runoffPh < 5.5 || runoffPh > 6.5)) {
    alerts.push(`Runoff pH is out of target range: ${runoffPh}`);
    recommendations.push('Tune nutrient solution pH to 5.5-6.5 to improve nutrient availability.');
  }

  if (runoffEc != null && (runoffEc < 1.2 || runoffEc > 2.2)) {
    alerts.push(`Runoff EC is out of target range: ${runoffEc}`);
    recommendations.push('Review feed strength and runoff strategy; target EC around 1.2-2.2 depending on stage.');
  }

  if (alerts.length === 0) {
    recommendations.push('Environment appears stable. Continue trend logging and daily checks.');
  }

  const riskLevel = alerts.length >= 3 ? 'high' : alerts.length >= 1 ? 'moderate' : 'low';
  const confidence = Math.max(40, Math.min(95, 55 + (5 * [tempC, humidityPct, vpdKpa, runoffPh, runoffEc].filter(v => v != null).length)));

  return {
    risk_level: riskLevel,
    confidence,
    alerts,
    likely_issues: alerts.length > 0 ? ['environmental drift'] : [],
    metrics: {
      temp_c: tempC,
      humidity_pct: humidityPct,
      vpd_kpa: vpdKpa,
      runoff_ph: runoffPh,
      runoff_ec: runoffEc
    },
    recommendations
  };
}

function buildDiagnosisAnalysis(observation) {
  const health = observation?.health || {};
  const symptoms = Array.isArray(health.symptoms) ? health.symptoms : [];
  const overallScore = toNumber(health.overall_score);
  const media = Array.isArray(observation?.media) ? observation.media : [];

  const alerts = [];
  const likelyIssues = [];
  const recommendations = [];

  if (overallScore != null && overallScore < 65) {
    alerts.push(`Overall health score is low: ${overallScore}`);
    likelyIssues.push('general stress');
    recommendations.push('Increase monitoring frequency and review environmental setpoints for the last 72 hours.');
  }

  symptoms.forEach(symptom => {
    const type = String(symptom?.type || '').toLowerCase();
    const severity = toNumber(symptom?.severity) || 0;

    if (!type) return;

    if (type.includes('chlorosis') || type.includes('yellow')) {
      likelyIssues.push('possible nutrient imbalance');
      recommendations.push('Check root-zone pH/EC and verify nitrogen and micronutrient availability.');
    }

    if (type.includes('spot') || type.includes('lesion')) {
      likelyIssues.push('possible pathogen pressure');
      recommendations.push('Inspect leaf undersides, isolate suspect plants, and increase airflow/dehumidification.');
    }

    if (type.includes('curl') || type.includes('wilt')) {
      likelyIssues.push('possible water stress');
      recommendations.push('Review irrigation cadence and root oxygenation in the hydroponic system.');
    }

    if (severity >= 7) {
      alerts.push(`High symptom severity detected for ${type}`);
    }
  });

  const mediaLabels = media.flatMap(item => Array.isArray(item.ml_labels) ? item.ml_labels : []);
  mediaLabels.forEach(label => {
    if (label?.label && Number(label.confidence) >= 0.75) {
      likelyIssues.push(String(label.label).toLowerCase());
    }
  });

  if (alerts.length === 0 && likelyIssues.length === 0) {
    recommendations.push('No critical diagnosis flags detected from current observation data.');
  }

  const dedupedIssues = [...new Set(likelyIssues)].filter(Boolean);
  const dedupedRecs = [...new Set(recommendations)].filter(Boolean);

  const riskLevel = alerts.length >= 2 || dedupedIssues.length >= 3 ? 'high' : dedupedIssues.length >= 1 ? 'moderate' : 'low';
  const confidence = Math.max(35, Math.min(92, 50 + (symptoms.length * 6) + (mediaLabels.length * 2)));

  return {
    risk_level: riskLevel,
    confidence,
    alerts,
    likely_issues: dedupedIssues,
    metrics: {
      overall_score: overallScore,
      symptom_count: symptoms.length,
      media_label_count: mediaLabels.length
    },
    recommendations: dedupedRecs
  };
}

async function createInsightRun({ runType, observation, analysis }) {
  const created = await MLInsight.create({
    run_type: runType,
    plant_id: observation?.plant_id || observation?.hg_plant_id || null,
    har_grp: observation?.har_grp || null,
    observation_id: observation?._id || null,
    input_snapshot: {
      recorded_at: observation?.recorded_at,
      growth_stage: observation?.growth_stage,
      health: observation?.health,
      morphology: observation?.morphology,
      environment_snapshot: observation?.environment_snapshot
    },
    analysis: {
      risk_level: analysis.risk_level,
      confidence: analysis.confidence,
      alerts: analysis.alerts,
      metrics: analysis.metrics,
      likely_issues: analysis.likely_issues
    },
    recommendations: analysis.recommendations,
    model_version: 'rules-v1'
  });

  return created;
}

export const getMLInsightRuns = async (req, res, next) => {
  try {
    const limit = Math.max(1, Math.min(Number(req.query.limit) || 20, 100));
    const filter = {};

    if (req.query.run_type) filter.run_type = req.query.run_type;
    if (req.query.plant_id) filter.plant_id = req.query.plant_id;
    if (req.query.har_grp) filter.har_grp = req.query.har_grp;

    const rows = await MLInsight.find(filter).sort({ created_at: -1 }).limit(limit);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching ML insight runs:', error);
    next(error);
  }
};

export const runHydroponicAdvice = async (req, res, next) => {
  try {
    const observation = await resolveObservation(req.body || {});
    if (!observation) {
      return res.status(400).json({ message: 'Provide observationId, or plantId (and optional harGrp).' });
    }

    const analysis = buildHydroponicAnalysis(observation);
    const run = await createInsightRun({ runType: 'hydroponic', observation, analysis });

    res.status(201).json({
      mode: 'hydroponic',
      observation_id: observation._id,
      plant_id: observation.plant_id || observation.hg_plant_id || null,
      har_grp: observation.har_grp || null,
      analysis,
      run
    });
  } catch (error) {
    console.error('Error running hydroponic advice:', error);
    next(error);
  }
};

export const runPlantDiagnosis = async (req, res, next) => {
  try {
    const observation = await resolveObservation(req.body || {});
    if (!observation) {
      return res.status(400).json({ message: 'Provide observationId, or plantId (and optional harGrp).' });
    }

    const analysis = buildDiagnosisAnalysis(observation);
    const run = await createInsightRun({ runType: 'diagnosis', observation, analysis });

    res.status(201).json({
      mode: 'diagnosis',
      observation_id: observation._id,
      plant_id: observation.plant_id || observation.hg_plant_id || null,
      har_grp: observation.har_grp || null,
      analysis,
      run
    });
  } catch (error) {
    console.error('Error running plant diagnosis:', error);
    next(error);
  }
};

export const deleteMLInsightRun = async (req, res, next) => {
  try {
    const deleted = await MLInsight.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'ML insight run not found' });
    }

    res.json({ message: 'ML insight run deleted successfully' });
  } catch (error) {
    console.error('Error deleting ML insight run:', error);
    next(error);
  }
};
