import { Router } from 'express';

import { create, getById, list, update } from '../controllers/areaComumController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(asyncHandler(authenticate));

router.post('/', authorize('admin'), asyncHandler(create));
router.get('/', authorize('morador', 'admin'), asyncHandler(list));
router.get('/:id', authorize('morador', 'admin'), asyncHandler(getById));
router.patch('/:id', authorize('admin'), asyncHandler(update));

export default router;
