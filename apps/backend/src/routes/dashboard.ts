import { Router } from 'express';

import { summary } from '../controllers/dashboardController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(asyncHandler(authenticate));

router.get('/summary', authorize('admin'), asyncHandler(summary));

export default router;
