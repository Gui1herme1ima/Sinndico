import { Router } from 'express';

import { create, getById, getBySlug, getMine, list, update } from '../controllers/condominioController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Público, antes do authenticate — usado pela tela de login pra resolver /<slug>/login.
router.get('/by-slug/:slug', asyncHandler(getBySlug));

router.use(asyncHandler(authenticate));

router.post('/', authorize('superadmin'), asyncHandler(create));
router.get('/', authorize('superadmin'), asyncHandler(list));
// Antes de /:id de propósito — senão "me" seria capturado como :id e falharia no z.string().uuid().
router.get('/me', authorize('admin'), asyncHandler(getMine));
router.get('/:id', authorize('superadmin'), asyncHandler(getById));
router.patch('/:id', authorize('superadmin'), asyncHandler(update));

export default router;
