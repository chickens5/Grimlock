import express from 'express';
import {
  deleteMLInsightRun,
  getMLInsightRuns,
  runHydroponicAdvice,
  runPlantDiagnosis
} from '../controllers/mlInsightController.js';
import { requireLocalAdmin } from '../middleware/localAdminAuth.js';

const router = express.Router();

router.get('/', getMLInsightRuns);
router.post('/hydroponic-advice', requireLocalAdmin, runHydroponicAdvice);
router.post('/plant-diagnosis', requireLocalAdmin, runPlantDiagnosis);
router.delete('/:id', requireLocalAdmin, deleteMLInsightRun);

export default router;
