import { Router } from 'express';

import { create, diretorioMoradores, importarMoradores, list, resetSenha, update } from '../controllers/userController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(asyncHandler(authenticate));

// Antes do authorize('admin') global de propósito — porteiro também precisa escolher um morador
// (ex.: dono de uma encomenda) sem ter acesso ao resto do CRUD de usuários.
router.get('/diretorio', authorize('admin', 'porteiro'), asyncHandler(diretorioMoradores));

router.use(authorize('admin'));

router.post('/', asyncHandler(create));
router.post('/importar', asyncHandler(importarMoradores));
router.get('/', asyncHandler(list));
router.patch('/:id', asyncHandler(update));
router.patch('/:id/senha', asyncHandler(resetSenha));

export default router;
