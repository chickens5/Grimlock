import Observation from '../models/Observation.js';

function normalizeObservationPayload(payload) {
  if (!payload || typeof payload !== 'object') return payload;

  if (payload.harvest_group && !payload.har_grp) {
    payload.har_grp = payload.harvest_group;
  }

  if (payload.hg_plant_id && !payload.plant_id) {
    payload.plant_id = payload.hg_plant_id;
  }

  if (payload.plant_id && !payload.hg_plant_id && typeof payload.plant_id === 'string') {
    payload.hg_plant_id = payload.plant_id;
  }

  if (payload.morphology?.cola_count != null && payload.morphology?.node_count == null) {
    payload.morphology.node_count = payload.morphology.cola_count;
  }

  return payload;
}

export const getObservationsByPlant = async (req, res, next) => {
  try {
    const filter = {
      $or: [
        { hg_plant_id: req.params.plantId },
        { plant_id: req.params.plantId }
      ]
    };
    if (req.query.har_grp) {
      filter.har_grp = req.query.har_grp;
    }

    const observations = await Observation.find(filter)
      .sort({ recorded_at: -1 });
    res.json(observations);
  } catch (error) {
    console.error('Error fetching observations:', error);
    next(error);
  }
};

export const createObservation = async (req, res, next) => {
  try {
    const payload = normalizeObservationPayload({ ...req.body });
    const observation = new Observation(payload);
    const savedObservation = await observation.save();
    res.status(201).json(savedObservation);
  } catch (error) {
    console.error('Error creating observation:', error);
    res.status(400).json({ message: error.message });
  }
};

export const updateObservation = async (req, res, next) => {
  try {
    const payload = normalizeObservationPayload({ ...req.body });
    const observation = await Observation.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );
    if (!observation) return res.status(404).json({ message: 'Observation not found' });
    res.json(observation);
  } catch (error) {
    console.error('Error updating observation:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteObservation = async (req, res, next) => {
  try {
    const observation = await Observation.findByIdAndDelete(req.params.id);
    if (!observation) return res.status(404).json({ message: 'Observation not found' });
    res.json({ message: 'Observation deleted successfully' });
  } catch (error) {
    console.error('Error deleting observation:', error);
    next(error);
  }
};
