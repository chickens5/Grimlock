import express from 'express';
import {
  getAllConcentrates,
  getConcentrateById,
  createConcentrate,
  updateConcentrate,
  deleteConcentrate,
  getVibeClusterInfo
} from '../controllers/concentrateController.js';

const router = express.Router();

// Specific routes first (before /:id)
router.get('/vibe-clusters', getVibeClusterInfo);

// CRUD routes
router.get('/', getAllConcentrates);
router.get('/:id', getConcentrateById);
router.post('/', createConcentrate);
router.put('/:id', updateConcentrate);
router.delete('/:id', deleteConcentrate);

export default router;
