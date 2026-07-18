import { Router } from 'express';

import { create, getById, list, updateStatus, votar } from '../controllers/assembleiaController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(asyncHandler(authenticate));

router.post('/', authorize('admin'), asyncHandler(create));
router.get('/', authorize('morador', 'admin'), asyncHandler(list));
router.get('/:id', authorize('morador', 'admin'), asyncHandler(getById));
router.patch('/:id', authorize('admin'), asyncHandler(updateStatus));
router.post('/:id/votar', authorize('morador'), asyncHandler(votar));

export default router;
