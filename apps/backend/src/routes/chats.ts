import { Router } from 'express';

import { create, list } from '../controllers/chatController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(asyncHandler(authenticate));

router.post('/', authorize('morador', 'admin'), asyncHandler(create));
router.get('/', authorize('morador', 'admin'), asyncHandler(list));

export default router;
