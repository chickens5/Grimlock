import LabResult from '../models/LabResult.js';

export const getAllLabResults = async (req, res, next) => {
  try {
    const {
      plant_id: plantId,
      sample_type: sampleType,
      start_date: startDate,
      end_date: endDate
    } = req.query;

    const filter = {};

    if (plantId) {
      filter.plant_id = plantId;
    }

    if (sampleType) {
      filter.sample_type = sampleType;
    }

    if (startDate || endDate) {
      filter.sample_date = {};
      if (startDate) filter.sample_date.$gte = new Date(startDate);
      if (endDate) filter.sample_date.$lte = new Date(endDate);
    }

    const labResults = await LabResult.find(filter)
      .populate('plant_id')
      .sort({ sample_date: -1, _id: -1 });

    res.json(labResults);
  } catch (error) {
    console.error('Error fetching lab results:', error);
    next(error);
  }
};

export const getLabResultById = async (req, res, next) => {
  try {
    const labResult = await LabResult.findById(req.params.id).populate('plant_id');
    if (!labResult) {
      return res.status(404).json({ message: 'Lab result not found' });
    }

    res.json(labResult);
  } catch (error) {
    console.error('Error fetching lab result:', error);
    next(error);
  }
};

export const createLabResult = async (req, res) => {
  try {
    const labResult = new LabResult(req.body);
    const savedLabResult = await labResult.save();
    res.status(201).json(savedLabResult);
  } catch (error) {
    console.error('Error creating lab result:', error);
    res.status(400).json({ message: error.message });
  }
};

export const updateLabResult = async (req, res) => {
  try {
    const labResult = await LabResult.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!labResult) {
      return res.status(404).json({ message: 'Lab result not found' });
    }

    res.json(labResult);
  } catch (error) {
    console.error('Error updating lab result:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteLabResult = async (req, res, next) => {
  try {
    const labResult = await LabResult.findByIdAndDelete(req.params.id);
    if (!labResult) {
      return res.status(404).json({ message: 'Lab result not found' });
    }

    res.json({ message: 'Lab result deleted successfully' });
  } catch (error) {
    console.error('Error deleting lab result:', error);
    next(error);
  }
};
