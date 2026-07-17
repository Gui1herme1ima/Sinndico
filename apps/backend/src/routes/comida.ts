import { Router } from 'express';

import { create, getById, list, updateStatus } from '../controllers/comidaController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(asyncHandler(authenticate));

router.post('/', authorize('morador'), asyncHandler(create));
router.get('/', authorize('morador', 'admin', 'porteiro'), asyncHandler(list));
router.get('/:id', authorize('morador', 'admin', 'porteiro'), asyncHandler(getById));
router.patch('/:id', authorize('morador', 'admin', 'porteiro'), asyncHandler(updateStatus));

export default router;
