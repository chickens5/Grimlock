import HarvestGroup from '../models/HarvestGroup.js';
import Observation from '../models/Observation.js';

function normalizeHarGrp(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeOptionalString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function resolveCultivarName(value) {
  if (!value || typeof value !== 'object') return '';
  return normalizeOptionalString(value.cultivar_name || value.strain_name);
}

function normalizePlantEntry(plant) {
  const cultivar_name = resolveCultivarName(plant);
  if (!cultivar_name) return null;

  return {
    cultivar_name,
    // Keep legacy key populated for older clients until fully migrated.
    strain_name: cultivar_name,
    plant_count: Number(plant?.plant_count) || 1,
    current_room: normalizeOptionalString(plant?.current_room),
    notes: normalizeOptionalString(plant?.notes)
  };
}

export const getHarvestGroups = async (req, res, next) => {
  try {
    const [groups, observationStats] = await Promise.all([
      HarvestGroup.find().sort({ updatedAt: -1, har_grp: 1 }).lean(),
      Observation.aggregate([
        { $match: { har_grp: { $exists: true, $nin: [null, ''] } } },
        {
          $group: {
            _id: '$har_grp',
            observations_count: { $sum: 1 },
            latest_recorded_at: { $max: '$recorded_at' }
          }
        }
      ])
    ]);

    const statsByGroup = new Map(
      observationStats.map(item => [item._id, item])
    );

    const enrichedGroups = groups.map(group => {
      const stat = statsByGroup.get(group.har_grp);
      const plant_total_count = (group.plants || []).reduce(
        (total, plant) => total + (Number(plant.plant_count) || 0),
        0
      );

      return {
        ...group,
        observations_count: stat?.observations_count || 0,
        latest_recorded_at: stat?.latest_recorded_at || null,
        plant_count: (group.plants || []).length,
        plant_total_count
      };
    });

    res.json(enrichedGroups);
  } catch (error) {
    console.error('Error fetching harvest groups:', error);
    next(error);
  }
};

export const createHarvestGroup = async (req, res, next) => {
  try {
    const har_grp = normalizeHarGrp(req.body.har_grp);
    if (!har_grp) {
      return res.status(400).json({ message: 'har_grp is required' });
    }

    const group = new HarvestGroup({
      har_grp,
      current_room: req.body.current_room || '',
      notes: req.body.notes || '',
      image_url: normalizeOptionalString(req.body.image_url),
      plants: Array.isArray(req.body.plants)
        ? req.body.plants.map(normalizePlantEntry).filter(Boolean)
        : []
    });

    const saved = await group.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating harvest group:', error);
    res.status(400).json({ message: error.message });
  }
};

export const updateHarvestGroup = async (req, res, next) => {
  try {
    const payload = {
      ...req.body
    };

    if (typeof payload.har_grp === 'string') {
      payload.har_grp = normalizeHarGrp(payload.har_grp);
    }

    if (payload.image_url != null) {
      payload.image_url = normalizeOptionalString(payload.image_url);
    }

    if (Array.isArray(payload.plants)) {
      payload.plants = payload.plants.map(normalizePlantEntry).filter(Boolean);
    }

    const group = await HarvestGroup.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!group) return res.status(404).json({ message: 'Harvest group not found' });
    res.json(group);
  } catch (error) {
    console.error('Error updating harvest group:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteHarvestGroup = async (req, res, next) => {
  try {
    const group = await HarvestGroup.findByIdAndDelete(req.params.id);
    if (!group) return res.status(404).json({ message: 'Harvest group not found' });

    await Observation.deleteMany({ har_grp: group.har_grp });

    res.json({ message: 'Harvest group deleted', deleted_observation_group: group.har_grp });
  } catch (error) {
    console.error('Error deleting harvest group:', error);
    next(error);
  }
};

export const getPlantsByHarvestGroup = async (req, res, next) => {
  try {
    const group = await HarvestGroup.findOne({ har_grp: req.params.harGrp }).lean();
    if (!group) return res.status(404).json({ message: 'Harvest group not found' });

    res.json(group.plants || []);
  } catch (error) {
    console.error('Error fetching harvest group plants:', error);
    next(error);
  }
};

export const addPlantToHarvestGroup = async (req, res, next) => {
  try {
    const cultivar_name = resolveCultivarName(req.body);
    if (!cultivar_name) {
      return res.status(400).json({ message: 'cultivar_name is required' });
    }

    const group = await HarvestGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Harvest group not found' });

    group.plants.push({
      cultivar_name,
      strain_name: cultivar_name,
      plant_count: Number(req.body.plant_count) || 1,
      current_room: req.body.current_room || '',
      notes: req.body.notes || ''
    });

    await group.save();
    res.status(201).json(group);
  } catch (error) {
    console.error('Error adding plant to harvest group:', error);
    res.status(400).json({ message: error.message });
  }
};

export const updatePlantInHarvestGroup = async (req, res, next) => {
  try {
    const group = await HarvestGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Harvest group not found' });

    const plant = group.plants.id(req.params.plantId);
    if (!plant) return res.status(404).json({ message: 'Plant entry not found in harvest group' });

    const cultivar_name = resolveCultivarName(req.body);
    if (cultivar_name) {
      plant.cultivar_name = cultivar_name;
      plant.strain_name = cultivar_name;
    }

    if (req.body.plant_count != null) {
      const count = Number(req.body.plant_count);
      if (!Number.isNaN(count) && count > 0) {
        plant.plant_count = count;
      }
    }

    if (typeof req.body.current_room === 'string') {
      plant.current_room = req.body.current_room;
    }

    if (typeof req.body.notes === 'string') {
      plant.notes = req.body.notes;
    }

    await group.save();
    res.json(group);
  } catch (error) {
    console.error('Error updating plant in harvest group:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deletePlantFromHarvestGroup = async (req, res, next) => {
  try {
    const group = await HarvestGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Harvest group not found' });

    const plant = group.plants.id(req.params.plantId);
    if (!plant) return res.status(404).json({ message: 'Plant entry not found in harvest group' });

    const removedPlantId = String(plant._id);
    const removedPlantName = plant.cultivar_name || plant.strain_name;
    plant.deleteOne();

    await group.save();

    await Observation.deleteMany({
      har_grp: group.har_grp,
      $or: [
        { hg_plant_id: removedPlantId },
        { plant_id: removedPlantId }
      ]
    });

    res.json({ message: 'Plant removed from harvest group', removed_plant: removedPlantName });
  } catch (error) {
    console.error('Error deleting plant from harvest group:', error);
    next(error);
  }
};
