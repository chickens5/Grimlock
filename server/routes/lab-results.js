import express from 'express';
import {
  getAllLabResults,
  getLabResultById,
  createLabResult,
  updateLabResult,
  deleteLabResult
} from '../controllers/labResultController.js';

const router = express.Router();

router.get('/', getAllLabResults);
router.get('/:id', getLabResultById);
router.post('/', createLabResult);
router.put('/:id', updateLabResult);
router.delete('/:id', deleteLabResult);

export default router;
