import { Router } from 'express';

import { contagemNaoLidas, list, marcarLida, marcarTodasLidas } from '../controllers/notificacaoController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(asyncHandler(authenticate));

router.get('/', asyncHandler(list));
router.get('/nao-lidas/contagem', asyncHandler(contagemNaoLidas));
router.patch('/:id/lida', asyncHandler(marcarLida));
router.patch('/lidas', asyncHandler(marcarTodasLidas));

export default router;
