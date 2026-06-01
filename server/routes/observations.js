import express from 'express';
import {
  getObservationsByPlant,
  createObservation,
  updateObservation,
  deleteObservation
} from '../controllers/observationController.js';
import { requireObservationAccess } from '../middleware/observationAccess.js';
import {
  validateObservationPayload,
  validateObservationPlantParam,
  validateObservationQuery,
  validateObservationRecordIdParam
} from '../middleware/observationValidation.js';

const router = express.Router();

router.use(requireObservationAccess);

router.get('/plant/:plantId', validateObservationPlantParam, validateObservationQuery, getObservationsByPlant);

router.post('/', validateObservationPayload, createObservation);
router.put('/:id', validateObservationRecordIdParam, validateObservationPayload, updateObservation);
router.delete('/:id', validateObservationRecordIdParam, deleteObservation);

export default router;
