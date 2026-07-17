import { Router } from 'express';

import { resetSenha } from '../controllers/userController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(asyncHandler(authenticate));

router.patch('/:id/senha', authorize('admin'), asyncHandler(resetSenha));

export default router;
