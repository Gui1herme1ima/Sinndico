import { Router } from 'express';

import { create, getById, list, update } from '../controllers/residenciaController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(asyncHandler(authenticate));
router.use(authorize('admin'));

router.post('/', asyncHandler(create));
router.get('/', asyncHandler(list));
router.get('/:id', asyncHandler(getById));
router.patch('/:id', asyncHandler(update));

export default router;
