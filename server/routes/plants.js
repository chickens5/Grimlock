import express from 'express';
import {
  getAllPlants,
  getPlantById,
  createPlant,
  updatePlant,
  deletePlant
} from '../controllers/plantController.js';
import { requireWriteAccess } from '../middleware/requireWriteAccess.js';

const router = express.Router();

router.use(requireWriteAccess);

router.get('/', getAllPlants);
router.get('/:id', getPlantById);
router.post('/', createPlant);
router.put('/:id', updatePlant);
router.delete('/:id', deletePlant);

export default router;
