import { Router } from 'express';
import { body } from 'express-validator';
import {
  createWaterTest,
  getWaterTests,
  getWaterTestById
} from '../controllers/waterTestController';
import { authenticate } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { handleValidationErrors } from '../middleware/validateMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorizeRoles('health_worker', 'admin'),
  [
    body('village').trim().notEmpty().withMessage('Village name is required'),
    body('sourceType').trim().notEmpty().withMessage('Source type is required'),
    body('result').isIn(['safe', 'unsafe', 'borderline']).withMessage('Result must be safe, unsafe, or borderline'),
    handleValidationErrors
  ],
  asyncHandler(createWaterTest)
);

router.get(
  '/',
  authorizeRoles('health_worker', 'admin'),
  asyncHandler(getWaterTests)
);

router.get('/:id', authorizeRoles('health_worker', 'admin'), asyncHandler(getWaterTestById));

export default router;
