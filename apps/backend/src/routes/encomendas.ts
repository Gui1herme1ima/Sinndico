import { Router } from 'express';

import { assinar, create, getById, list } from '../controllers/encomendaController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';
import { requirePorteiroModuleAccess } from '../middleware/porteiroModuleAccess';

const router = Router();

router.use(asyncHandler(authenticate));

router.post('/', authorize('porteiro'), asyncHandler(requirePorteiroModuleAccess('encomendas')), asyncHandler(create));
router.get(
  '/',
  authorize('porteiro', 'admin', 'morador'),
  asyncHandler(requirePorteiroModuleAccess('encomendas')),
  asyncHandler(list)
);
router.get(
  '/:id',
  authorize('porteiro', 'admin', 'morador'),
  asyncHandler(requirePorteiroModuleAccess('encomendas')),
  asyncHandler(getById)
);
router.post('/:id/assinar', authorize('morador'), asyncHandler(assinar));

export default router;
