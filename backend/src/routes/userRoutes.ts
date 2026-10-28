import { Router } from 'express';
import {
  getUsers,
  updateUser,
  getUserNotifications,
  markNotificationAsRead
} from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

// User notification routes (accessible to any authenticated user)
router.get('/notifications', asyncHandler(getUserNotifications));
router.patch('/notifications/:id/read', asyncHandler(markNotificationAsRead));

// Admin management routes
router.get('/', authorizeRoles('admin'), asyncHandler(getUsers));
router.patch('/:id', authorizeRoles('admin'), asyncHandler(updateUser));

export default router;
