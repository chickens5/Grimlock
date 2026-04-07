import express from 'express';
import {
  getObservationsByPlant,
  createObservation,
  updateObservation,
  deleteObservation
} from '../controllers/observationController.js';

const router = express.Router();

router.get('/plant/:plantId', getObservationsByPlant);
router.post('/', createObservation);
router.put('/:id', updateObservation);
router.delete('/:id', deleteObservation);

export default router;
