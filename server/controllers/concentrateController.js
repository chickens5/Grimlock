import Concentrate, { vibeClusterData } from '../models/Concentrate.js';
import Plant from '../models/Plant.js';

export const getAllConcentrates = async (req, res, next) => {
  try {
    const concentrates = await Concentrate.find().sort({ created_at: -1 });
    res.json(concentrates);
  } catch (error) {
    console.error('Error fetching concentrates:', error);
    next(error);
  }
};

export const getConcentrateById = async (req, res, next) => {
  try {
    const concentrate = await Concentrate.findById(req.params.id)
      .populate('source_plant_id');
    if (!concentrate) return res.status(404).json({ message: 'Concentrate not found' });
    res.json(concentrate);
  } catch (error) {
    console.error('Error fetching concentrate:', error);
    next(error);
  }
};

export const createConcentrate = async (req, res, next) => {
  try {
    const concentrate = new Concentrate(req.body);
    const savedConcentrate = await concentrate.save();

    // If source_plant_id is provided, add concentrate to plant's concentrates array
    if (req.body.source_plant_id) {
      await Plant.findByIdAndUpdate(
        req.body.source_plant_id,
        { $push: { concentrates: savedConcentrate._id } },
        { new: true }
      );
    }

    res.status(201).json(savedConcentrate);
  } catch (error) {
    console.error('Error creating concentrate:', error);
    res.status(400).json({ message: error.message });
  }
};

export const updateConcentrate = async (req, res, next) => {
  try {
    const concentrate = await Concentrate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!concentrate) return res.status(404).json({ message: 'Concentrate not found' });
    res.json(concentrate);
  } catch (error) {
    console.error('Error updating concentrate:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteConcentrate = async (req, res, next) => {
  try {
    const concentrate = await Concentrate.findByIdAndDelete(req.params.id);
    if (!concentrate) return res.status(404).json({ message: 'Concentrate not found' });

    // Remove concentrate from plant's concentrates array
    if (concentrate.source_plant_id) {
      await Plant.findByIdAndUpdate(
        concentrate.source_plant_id,
        { $pull: { concentrates: concentrate._id } },
        { new: true }
      );
    }

    res.json({ message: 'Concentrate deleted successfully' });
  } catch (error) {
    console.error('Error deleting concentrate:', error);
    next(error);
  }
};

export const getVibeClusterInfo = async (req, res) => {
  try {
    res.json(vibeClusterData);
  } catch (error) {
    console.error('Error fetching VIBE cluster data:', error);
    res.status(400).json({ message: error.message });
  }
};
