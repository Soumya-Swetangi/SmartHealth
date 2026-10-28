import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refreshToken, getCurrentUser, logout, requestOtp, verifyOtp } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { handleValidationErrors } from '../middleware/validateMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('village').trim().notEmpty().withMessage('Village is required'),
    handleValidationErrors
  ],
  asyncHandler(register)
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors
  ],
  asyncHandler(login)
);

router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    handleValidationErrors
  ],
  asyncHandler(refreshToken)
);

router.get('/me', authenticate, asyncHandler(getCurrentUser));
router.post('/logout', authenticate, asyncHandler(logout));

// OTP routes
router.post(
  '/request-otp',
  [
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    handleValidationErrors
  ],
  asyncHandler(requestOtp)
);

router.post(
  '/verify-otp',
  [
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('code').trim().notEmpty().withMessage('OTP code is required'),
    handleValidationErrors
  ],
  asyncHandler(verifyOtp)
);

export default router;
