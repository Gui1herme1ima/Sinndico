import { Router } from 'express';

import { create, getById, list, markAsRead } from '../controllers/comunicadoController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(asyncHandler(authenticate));

router.post('/', authorize('admin'), asyncHandler(create));
router.get('/', authorize('morador', 'admin', 'porteiro'), asyncHandler(list));
router.get('/:id', authorize('morador', 'admin', 'porteiro'), asyncHandler(getById));
router.post('/:id/ler', authorize('morador', 'admin', 'porteiro'), asyncHandler(markAsRead));

export default router;
