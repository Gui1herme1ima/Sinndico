import { Router } from 'express';

import {
  create,
  entrada,
  getById,
  list,
  saida,
  updateStatus,
} from '../controllers/visitanteController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(asyncHandler(authenticate));

router.post('/', authorize('morador'), asyncHandler(create));
router.get('/', authorize('morador', 'admin', 'porteiro'), asyncHandler(list));
router.get('/:id', authorize('morador', 'admin', 'porteiro'), asyncHandler(getById));
router.post('/:id/entrada', authorize('porteiro', 'admin'), asyncHandler(entrada));
router.post('/:id/saida', authorize('porteiro', 'admin'), asyncHandler(saida));
router.patch('/:id', authorize('porteiro', 'admin'), asyncHandler(updateStatus));

export default router;
