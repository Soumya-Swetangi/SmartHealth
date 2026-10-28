import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAlerts,
  getAlertById,
  updateAlertStatus,
  triggerRiskEvaluation
} from '../controllers/alertController';
import { authenticate } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { handleValidationErrors } from '../middleware/validateMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(getAlerts));
router.get('/:id', asyncHandler(getAlertById));

router.patch(
  '/:id',
  authorizeRoles('health_worker', 'admin'),
  [
    body('status').optional().isIn(['active', 'acknowledged', 'resolved']).withMessage('Invalid alert status'),
    handleValidationErrors
  ],
  asyncHandler(updateAlertStatus)
);

router.post(
  '/evaluate',
  authorizeRoles('health_worker', 'admin'),
  asyncHandler(triggerRiskEvaluation)
);

export default router;
