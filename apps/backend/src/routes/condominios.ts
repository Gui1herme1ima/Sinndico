import { Router } from 'express';

import { create, getById, list, update } from '../controllers/condominioController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(asyncHandler(authenticate));

router.post('/', authorize('superadmin'), asyncHandler(create));
router.get('/', authorize('superadmin'), asyncHandler(list));
router.get('/:id', authorize('superadmin'), asyncHandler(getById));
router.patch('/:id', authorize('superadmin'), asyncHandler(update));

export default router;
