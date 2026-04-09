import Plant from '../models/Plant.js';
import Observation from '../models/Observation.js';

const ALLOWED_STRAIN_STATUSES = ['R&D', 'House', 'Premier', 'Retired'];

export const getAllPlants = async (req, res, next) => {
  try {
    const { strain_status: strainStatusQuery } = req.query;
    const filter = {};

    if (typeof strainStatusQuery === 'string' && strainStatusQuery.trim()) {
      const requestedStatuses = strainStatusQuery
        .split(',')
        .map(status => status.trim())
        .filter(Boolean);

      const invalidStatuses = requestedStatuses.filter(
        status => !ALLOWED_STRAIN_STATUSES.includes(status)
      );

      if (invalidStatuses.length > 0) {
        return res.status(400).json({
          message: `Invalid strain_status values: ${invalidStatuses.join(', ')}`,
          allowed: ALLOWED_STRAIN_STATUSES
        });
      }

      if (requestedStatuses.length > 0) {
        filter.strain_status = { $in: requestedStatuses };
      }
    }

    const plants = await Plant.find(filter)
      .populate('concentrates')
      .sort({ created_at: -1 });
    res.json(plants);
  } catch (error) {
    console.error('Error fetching plants:', error);
    next(error);
  }
};

export const getPlantById = async (req, res, next) => {
  try {
    const plant = await Plant.findById(req.params.id)
      .populate('concentrates');
    if (!plant) return res.status(404).json({ message: 'Plant not found' });
    
    const observations = await Observation.find({ plant_id: plant._id })
      .sort({ recorded_at: -1 });
    
    res.json({ plant, observations });
  } catch (error) {
    console.error('Error fetching plant:', error);
    next(error);
  }
};

export const createPlant = async (req, res, next) => {
  try {
    const plant = new Plant(req.body);
    const savedPlant = await plant.save();
    res.status(201).json(savedPlant);
  } catch (error) {
    console.error('Error creating plant:', error);
    res.status(400).json({ message: error.message });
  }
};

export const updatePlant = async (req, res, next) => {
  try {
    const plant = await Plant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!plant) return res.status(404).json({ message: 'Plant not found' });
    res.json(plant);
  } catch (error) {
    console.error('Error updating plant:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deletePlant = async (req, res, next) => {
  try {
    const plant = await Plant.findByIdAndDelete(req.params.id);
    if (!plant) return res.status(404).json({ message: 'Plant not found' });
    await Observation.deleteMany({ plant_id: req.params.id });
    res.json({ message: 'Plant deleted successfully' });
  } catch (error) {
    console.error('Error deleting plant:', error);
    next(error);
  }
};
