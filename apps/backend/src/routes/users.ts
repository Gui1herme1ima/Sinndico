import { Router } from 'express';

import { create, importarMoradores, list, resetSenha, update } from '../controllers/userController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(asyncHandler(authenticate));
router.use(authorize('admin'));

router.post('/', asyncHandler(create));
router.post('/importar', asyncHandler(importarMoradores));
router.get('/', asyncHandler(list));
router.patch('/:id', asyncHandler(update));
router.patch('/:id/senha', asyncHandler(resetSenha));

export default router;
