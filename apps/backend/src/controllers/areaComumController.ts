import { Request, Response } from 'express';
import { z } from 'zod';

import { ApiError } from '../middleware/errorHandler';
import {
  AreaComum,
  createAreaComum,
  findAreaComumById,
  listAreasComuns,
  updateAreaComum,
} from '../models/AreaComum';

export const createAreaComumSchema = z.object({
  nome: z.string().min(1),
  horarioFuncionamento: z.string().min(1).optional(),
  descricao: z.string().min(1).optional(),
});

export const updateAreaComumSchema = z.object({
  nome: z.string().min(1).optional(),
  horarioFuncionamento: z.string().min(1).optional(),
  descricao: z.string().min(1).optional(),
});

function toAreaComumResponse(area: AreaComum) {
  return {
    id: area.id,
    condominioId: area.condominio_id,
    nome: area.nome,
    horarioFuncionamento: area.horario_funcionamento,
    descricao: area.descricao,
  };
}

function tenantContextOf(req: Request) {
  return { userId: req.user!.id, condominioId: req.user!.condominioId };
}

export async function create(req: Request, res: Response) {
  const input = createAreaComumSchema.parse(req.body);
  const ctx = tenantContextOf(req);

  const area = await createAreaComum(ctx, {
    condominioId: req.user!.condominioId!,
    ...input,
  });

  res.status(201).json(toAreaComumResponse(area));
}

export async function list(req: Request, res: Response) {
  const areas = await listAreasComuns(tenantContextOf(req));
  res.json(areas.map(toAreaComumResponse));
}

export async function getById(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);

  const area = await findAreaComumById(tenantContextOf(req), id);
  if (!area) {
    throw new ApiError(404, 'Área comum não encontrada');
  }

  res.json(toAreaComumResponse(area));
}

export async function update(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const input = updateAreaComumSchema.parse(req.body);

  const area = await updateAreaComum(tenantContextOf(req), id, input);
  if (!area) {
    throw new ApiError(404, 'Área comum não encontrada');
  }

  res.json(toAreaComumResponse(area));
}
