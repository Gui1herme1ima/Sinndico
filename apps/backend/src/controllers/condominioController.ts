import { Request, Response } from 'express';
import { z } from 'zod';

import { ApiError } from '../middleware/errorHandler';
import {
  Condominio,
  CondominioComContagem,
  createCondominio,
  findCondominioById,
  listCondominios,
  updateCondominioNome,
} from '../models/Condominio';

export const createCondominioSchema = z.object({
  nome: z.string().min(1),
});

export const updateCondominioSchema = z.object({
  nome: z.string().min(1),
});

function toCondominioResponse(condominio: Condominio | CondominioComContagem) {
  return {
    id: condominio.id,
    nome: condominio.nome,
    createdAt: condominio.created_at,
    totalUsuarios: 'total_usuarios' in condominio ? Number(condominio.total_usuarios) : undefined,
  };
}

export async function create(req: Request, res: Response) {
  const input = createCondominioSchema.parse(req.body);
  const condominio = await createCondominio(input.nome);
  res.status(201).json(toCondominioResponse(condominio));
}

export async function list(_req: Request, res: Response) {
  const condominios = await listCondominios();
  res.json(condominios.map(toCondominioResponse));
}

export async function getById(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);

  const condominio = await findCondominioById(id);
  if (!condominio) {
    throw new ApiError(404, 'Condomínio não encontrado');
  }

  res.json(toCondominioResponse(condominio));
}

export async function update(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const input = updateCondominioSchema.parse(req.body);

  const condominio = await updateCondominioNome(id, input.nome);
  if (!condominio) {
    throw new ApiError(404, 'Condomínio não encontrado');
  }

  res.json(toCondominioResponse(condominio));
}
