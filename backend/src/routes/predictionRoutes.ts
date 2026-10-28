import { Router } from 'express';
import {
  createPrediction,
  getPredictionHistory,
  getModelInfo
} from '../controllers/predictionController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Publicly readable model info and prediction history
router.get('/model-info', getModelInfo);
router.get('/history', getPredictionHistory);

// Authenticated prediction generation
router.post('/', authenticate, createPrediction);

export default router;
