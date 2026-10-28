import { Router } from 'express';
import { body } from 'express-validator';
import {
  createReport,
  getReports,
  getMyReports,
  getReportById,
  updateReportStatus
} from '../controllers/reportController';
import { authenticate } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { handleValidationErrors } from '../middleware/validateMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('sourceType')
      .isIn(['handpump', 'well', 'river', 'pond', 'pipeline', 'other'])
      .withMessage('Invalid water source type'),
    body('symptoms').isArray({ min: 1 }).withMessage('At least one symptom must be selected'),
    handleValidationErrors
  ],
  asyncHandler(createReport)
);

router.get('/my', asyncHandler(getMyReports));

router.get(
  '/',
  authorizeRoles('health_worker', 'admin'),
  asyncHandler(getReports)
);

router.get('/:id', asyncHandler(getReportById));

router.patch(
  '/:id/status',
  authorizeRoles('health_worker', 'admin'),
  [
    body('status')
      .optional()
      .isIn(['pending', 'under_review', 'verified', 'resolved', 'rejected'])
      .withMessage('Invalid status'),
    handleValidationErrors
  ],
  asyncHandler(updateReportStatus)
);

export default router;
