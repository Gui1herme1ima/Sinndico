import { Request, Response } from 'express';
import { z } from 'zod';

import { ApiError } from '../middleware/errorHandler';
import {
  createSetor,
  findConflictingSetor,
  findSetorById,
  listSetores,
  Setor,
  SetorComContagem,
  updateSetor,
} from '../models/Setor';

export const setorTipoEnum = z.enum(['bloco', 'rua', 'quadra', 'torre', 'outro']);

export const createSetorSchema = z.object({
  nome: z.string().min(1),
  tipo: setorTipoEnum,
});

export const updateSetorSchema = createSetorSchema;

function toSetorResponse(setor: Setor) {
  return {
    id: setor.id,
    condominioId: setor.condominio_id,
    nome: setor.nome,
    tipo: setor.tipo,
    createdAt: setor.created_at,
  };
}

function toSetorComContagemResponse(setor: SetorComContagem) {
  return {
    ...toSetorResponse(setor),
    residenciasCount: Number(setor.residencias_count),
    moradoresCount: Number(setor.moradores_count),
  };
}

function tenantContextOf(req: Request) {
  return { userId: req.user!.id, condominioId: req.user!.condominioId };
}

export async function create(req: Request, res: Response) {
  const input = createSetorSchema.parse(req.body);
  const condominioId = req.user!.condominioId!;
  const ctx = tenantContextOf(req);

  const conflito = await findConflictingSetor(ctx, input.nome);
  if (conflito) {
    throw new ApiError(409, 'Já existe um setor cadastrado com esse nome');
  }

  const setor = await createSetor(ctx, { condominioId, nome: input.nome, tipo: input.tipo });
  res.status(201).json(toSetorResponse(setor));
}

export async function list(req: Request, res: Response) {
  const setores = await listSetores(tenantContextOf(req));
  res.json(setores.map(toSetorComContagemResponse));
}

export async function getById(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);

  const setor = await findSetorById(tenantContextOf(req), id);
  if (!setor) {
    throw new ApiError(404, 'Setor não encontrado');
  }

  res.json(toSetorResponse(setor));
}

export async function update(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const input = updateSetorSchema.parse(req.body);
  const ctx = tenantContextOf(req);

  const conflito = await findConflictingSetor(ctx, input.nome, id);
  if (conflito) {
    throw new ApiError(409, 'Já existe um setor cadastrado com esse nome');
  }

  const setor = await updateSetor(ctx, id, input);
  if (!setor) {
    throw new ApiError(404, 'Setor não encontrado');
  }

  res.json(toSetorResponse(setor));
}
