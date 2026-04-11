import express from 'express';
import {
  getHarvestGroups,
  createHarvestGroup,
  updateHarvestGroup,
  deleteHarvestGroup,
  getPlantsByHarvestGroup,
  addPlantToHarvestGroup,
  updatePlantInHarvestGroup,
  deletePlantFromHarvestGroup
} from '../controllers/harvestGroupController.js';

const router = express.Router();

router.get('/', getHarvestGroups);
router.post('/', createHarvestGroup);
router.put('/:id', updateHarvestGroup);
router.delete('/:id', deleteHarvestGroup);

router.get('/:harGrp/plants', getPlantsByHarvestGroup);
router.post('/:id/plants', addPlantToHarvestGroup);
router.put('/:id/plants/:plantId', updatePlantInHarvestGroup);
router.delete('/:id/plants/:plantId', deletePlantFromHarvestGroup);

export default router;
