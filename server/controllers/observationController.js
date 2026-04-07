import Observation from '../models/Observation.js';

export const getObservationsByPlant = async (req, res, next) => {
  try {
    const observations = await Observation.find({ plant_id: req.params.plantId })
      .sort({ recorded_at: -1 });
    res.json(observations);
  } catch (error) {
    console.error('Error fetching observations:', error);
    next(error);
  }
};

export const createObservation = async (req, res, next) => {
  try {
    const observation = new Observation(req.body);
    const savedObservation = await observation.save();
    res.status(201).json(savedObservation);
  } catch (error) {
    console.error('Error creating observation:', error);
    res.status(400).json({ message: error.message });
  }
};

export const updateObservation = async (req, res, next) => {
  try {
    const observation = await Observation.findByIdAndUpdate(
      req.params.id,
      req.body,
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
