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
import { requirePorteiroModuleAccess } from '../middleware/porteiroModuleAccess';

const router = Router();

router.use(asyncHandler(authenticate));

router.post('/', authorize('morador'), asyncHandler(create));
router.get(
  '/',
  authorize('morador', 'admin', 'porteiro'),
  asyncHandler(requirePorteiroModuleAccess('visitantes')),
  asyncHandler(list)
);
router.get(
  '/:id',
  authorize('morador', 'admin', 'porteiro'),
  asyncHandler(requirePorteiroModuleAccess('visitantes')),
  asyncHandler(getById)
);
router.post(
  '/:id/entrada',
  authorize('porteiro', 'admin'),
  asyncHandler(requirePorteiroModuleAccess('visitantes')),
  asyncHandler(entrada)
);
router.post(
  '/:id/saida',
  authorize('porteiro', 'admin'),
  asyncHandler(requirePorteiroModuleAccess('visitantes')),
  asyncHandler(saida)
);
router.patch(
  '/:id',
  authorize('porteiro', 'admin'),
  asyncHandler(requirePorteiroModuleAccess('visitantes')),
  asyncHandler(updateStatus)
);

export default router;
