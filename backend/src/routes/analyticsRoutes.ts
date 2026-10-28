import { Router } from 'express';
import {
  getDashboardOverview,
  getReportsTrend,
  getSymptomDistribution,
  getVillageComparison,
  getMapData
} from '../controllers/analyticsController';
import { authenticate } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Public map data so LandingPage can display regional surveillance markers without 401
router.get('/map-data', asyncHandler(getMapData));

// Authenticated analytics endpoints
router.use(authenticate);

router.get('/overview', asyncHandler(getDashboardOverview));
router.get('/trends', asyncHandler(getReportsTrend));
router.get('/symptoms', asyncHandler(getSymptomDistribution));
router.get('/villages', asyncHandler(getVillageComparison));

export default router;
