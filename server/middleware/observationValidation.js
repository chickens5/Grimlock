const GROWTH_STAGES = new Set(['seedling', 'vegetative', 'pre-flower', 'flower', 'late-flower', 'harvest']);

function isObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function toTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseDateOrNull(value) {
  if (value == null || value === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseNumberOrNull(value) {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function validateNumberRange(name, value, min, max, errors) {
  if (value == null) return;
  if (value < min || value > max) {
    errors.push(`${name} must be between ${min} and ${max}`);
  }
}

function sanitizeMedia(media, errors) {
  if (!Array.isArray(media)) return undefined;

  const rows = media
    .filter(isObject)
    .map((item) => {
      const clean = {};
      const url = toTrimmedString(item.url);
      const type = toTrimmedString(item.type).toLowerCase();
      const angle = toTrimmedString(item.angle);

      if (!url) {
        errors.push('media.url is required when media item is provided');
      } else {
        clean.url = url;
      }

      if (type) {
        clean.type = type;
      }

      if (angle) {
        clean.angle = angle;
      }

      if (Array.isArray(item.ml_labels)) {
        clean.ml_labels = item.ml_labels
          .filter(isObject)
          .map((labelRow) => {
            const label = {
              label: toTrimmedString(labelRow.label),
              model_version: toTrimmedString(labelRow.model_version)
            };

            const confidence = parseNumberOrNull(labelRow.confidence);
            if (confidence != null) {
              validateNumberRange('media.ml_labels.confidence', confidence, 0, 1, errors);
              label.confidence = confidence;
            }

            if (isObject(labelRow.bounding_box)) {
              label.bounding_box = {
                x: parseNumberOrNull(labelRow.bounding_box.x),
                y: parseNumberOrNull(labelRow.bounding_box.y),
                w: parseNumberOrNull(labelRow.bounding_box.w),
                h: parseNumberOrNull(labelRow.bounding_box.h)
              };
            }

            return label;
          });
      }

      return clean;
    });

  return rows;
}

export function validateObservationPlantParam(req, res, next) {
  const plantId = toTrimmedString(req.params.plantId);
  if (!plantId) {
    res.status(400).json({ message: 'plantId param is required.' });
    return;
  }

  req.params.plantId = plantId;
  next();
}

export function validateObservationRecordIdParam(req, res, next) {
  const id = toTrimmedString(req.params.id);
  if (!id) {
    res.status(400).json({ message: 'Observation id param is required.' });
    return;
  }

  req.params.id = id;
  next();
}

export function validateObservationQuery(req, res, next) {
  const errors = [];

  if (req.query.har_grp != null) {
    const harGrp = toTrimmedString(req.query.har_grp);
    if (!harGrp) {
      errors.push('har_grp query cannot be empty when provided');
    }
    req.query.har_grp = harGrp;
  }

  if (req.query.limit != null) {
    const limit = Number(req.query.limit);
    if (!Number.isFinite(limit) || limit < 1 || limit > 500) {
      errors.push('limit query must be a number between 1 and 500');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ message: 'Invalid query parameters', errors });
    return;
  }

  next();
}

export function validateObservationPayload(req, res, next) {
  const source = req.body;
  const errors = [];

  if (!isObject(source)) {
    res.status(400).json({ message: 'Request body must be a JSON object.' });
    return;
  }

  const payload = {};

  const harGrp = toTrimmedString(source.har_grp || source.harvest_group);
  if (harGrp) payload.har_grp = harGrp;

  const plantId = source.plant_id != null ? String(source.plant_id).trim() : '';
  const hgPlantId = toTrimmedString(source.hg_plant_id);
  if (plantId) payload.plant_id = plantId;
  if (hgPlantId) payload.hg_plant_id = hgPlantId;

  const plantName = toTrimmedString(source.plant_name);
  if (plantName) payload.plant_name = plantName;

  const observImg = toTrimmedString(source.observ_img);
  if (observImg) payload.observ_img = observImg;

  const recordedAt = parseDateOrNull(source.recorded_at);
  if (source.recorded_at != null && !recordedAt) {
    errors.push('recorded_at must be a valid date');
  } else if (recordedAt) {
    payload.recorded_at = recordedAt;
  }

  const growthStage = toTrimmedString(source.growth_stage);
  if (growthStage) {
    if (!GROWTH_STAGES.has(growthStage)) {
      errors.push('growth_stage is invalid');
    } else {
      payload.growth_stage = growthStage;
    }
  }

  if (isObject(source.morphology)) {
    payload.morphology = {
      node_count: parseNumberOrNull(source.morphology.node_count),
      height_cm: parseNumberOrNull(source.morphology.height_cm),
      canopy_width_cm: parseNumberOrNull(source.morphology.canopy_width_cm),
      leaf_count: parseNumberOrNull(source.morphology.leaf_count),
      internode_length_cm: parseNumberOrNull(source.morphology.internode_length_cm),
      stem_diameter_mm: parseNumberOrNull(source.morphology.stem_diameter_mm),
      leaf_shape: toTrimmedString(source.morphology.leaf_shape)
    };
  }

  if (isObject(source.health)) {
    const overallScore = parseNumberOrNull(source.health.overall_score);
    validateNumberRange('health.overall_score', overallScore, 0, 100, errors);

    payload.health = {
      overall_score: overallScore,
      stress_type: Array.isArray(source.health.stress_type)
        ? source.health.stress_type.map(value => String(value).trim()).filter(Boolean)
        : undefined,
      symptoms: Array.isArray(source.health.symptoms)
        ? source.health.symptoms.filter(isObject).map((row) => {
            const severity = parseNumberOrNull(row.severity);
            validateNumberRange('health.symptoms.severity', severity, 0, 10, errors);
            return {
              type: toTrimmedString(row.type),
              severity,
              location: toTrimmedString(row.location),
              confirmed_by: toTrimmedString(row.confirmed_by)
            };
          })
        : undefined
    };
  }

  if (isObject(source.environment_snapshot)) {
    const env = {
      vpd_kpa: parseNumberOrNull(source.environment_snapshot.vpd_kpa),
      temp_c: parseNumberOrNull(source.environment_snapshot.temp_c),
      humidity_pct: parseNumberOrNull(source.environment_snapshot.humidity_pct),
      co2_ppm: parseNumberOrNull(source.environment_snapshot.co2_ppm),
      ppfd_umol: parseNumberOrNull(source.environment_snapshot.ppfd_umol),
      photoperiod_hrs: parseNumberOrNull(source.environment_snapshot.photoperiod_hrs),
      medium: toTrimmedString(source.environment_snapshot.medium),
      runoff_ec: parseNumberOrNull(source.environment_snapshot.runoff_ec),
      runoff_ph: parseNumberOrNull(source.environment_snapshot.runoff_ph)
    };

    validateNumberRange('environment_snapshot.humidity_pct', env.humidity_pct, 0, 100, errors);
    validateNumberRange('environment_snapshot.vpd_kpa', env.vpd_kpa, 0, 5, errors);
    validateNumberRange('environment_snapshot.runoff_ph', env.runoff_ph, 0, 14, errors);

    payload.environment_snapshot = env;
  }

  const media = sanitizeMedia(source.media, errors);
  if (media) payload.media = media;

  const dataQuality = parseNumberOrNull(source.data_quality);
  validateNumberRange('data_quality', dataQuality, 0, 100, errors);
  if (dataQuality != null) payload.data_quality = dataQuality;

  const recordedBy = toTrimmedString(source.recorded_by);
  if (recordedBy) payload.recorded_by = recordedBy;

  const isCreate = req.method.toUpperCase() === 'POST';
  if (isCreate) {
    if (!payload.har_grp) {
      errors.push('har_grp is required');
    }
    if (!payload.growth_stage) {
      errors.push('growth_stage is required');
    }
    if (!payload.plant_id && !payload.hg_plant_id) {
      errors.push('plant_id or hg_plant_id is required');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ message: 'Invalid observation payload', errors });
    return;
  }

  req.validatedObservationPayload = payload;
  next();
}
