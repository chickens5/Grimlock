import express from 'express';
import {
  getAllMLDatasets,
  getMLDatasetById,
  createMLDataset,
  deleteMLDataset,
  generateMLDataset,
  getCultivarRankings
} from '../controllers/mlDatasetController.js';

const router = express.Router();

router.get('/', getAllMLDatasets);
router.get('/cultivar-rankings', getCultivarRankings);
router.get('/:id', getMLDatasetById);
router.post('/', createMLDataset);
router.post('/generate', generateMLDataset);
router.delete('/:id', deleteMLDataset);

export default router;
