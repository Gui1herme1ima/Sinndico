import { Router } from 'express';

import { create, getById, getBySlug, list, update } from '../controllers/condominioController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Público, antes do authenticate — usado pela tela de login pra resolver /<slug>/login.
router.get('/by-slug/:slug', asyncHandler(getBySlug));

router.use(asyncHandler(authenticate));

router.post('/', authorize('superadmin'), asyncHandler(create));
router.get('/', authorize('superadmin'), asyncHandler(list));
router.get('/:id', authorize('superadmin'), asyncHandler(getById));
router.patch('/:id', authorize('superadmin'), asyncHandler(update));

export default router;
