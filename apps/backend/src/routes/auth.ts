import { Router } from 'express';

import {
  changePassword,
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  resetPassword,
} from '../controllers/authController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refresh));
router.post('/logout', asyncHandler(logout));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));
router.get('/me', asyncHandler(authenticate), asyncHandler(me));
router.post('/change-password', asyncHandler(authenticate), asyncHandler(changePassword));

export default router;
