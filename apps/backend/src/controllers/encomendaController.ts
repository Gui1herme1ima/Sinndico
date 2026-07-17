import { Request, Response } from 'express';
import { z } from 'zod';

import { ApiError } from '../middleware/errorHandler';
import {
  createEncomenda,
  Encomenda,
  findEncomendaById,
  listEncomendas,
  signEncomenda,
} from '../models/Encomenda';
import { findUserByIdForTenant } from '../models/User';

export const createEncomendaSchema = z.object({
  moradorId: z.string().uuid(),
  descricao: z.string().min(1).optional(),
  fotoUrl: z.string().url().optional(),
});

function toEncomendaResponse(encomenda: Encomenda) {
  return {
    id: encomenda.id,
    condominioId: encomenda.condominio_id,
    moradorId: encomenda.morador_id,
    porteiroId: encomenda.porteiro_id,
    descricao: encomenda.descricao,
    horarioChegada: encomenda.horario_chegada,
    fotoUrl: encomenda.foto_url,
    assinado: encomenda.assinado,
    dataAssinatura: encomenda.data_assinatura,
    status: encomenda.status,
  };
}

function tenantContextOf(req: Request) {
  return { userId: req.user!.id, condominioId: req.user!.condominioId };
}

export async function create(req: Request, res: Response) {
  const input = createEncomendaSchema.parse(req.body);
  const ctx = tenantContextOf(req);

  const morador = await findUserByIdForTenant(ctx, input.moradorId);
  if (!morador || morador.role !== 'morador') {
    throw new ApiError(400, 'moradorId inválido: usuário não encontrado ou não é morador deste condomínio');
  }

  const encomenda = await createEncomenda(ctx, {
    condominioId: req.user!.condominioId!,
    moradorId: input.moradorId,
    porteiroId: req.user!.id,
    descricao: input.descricao,
    fotoUrl: input.fotoUrl,
  });

  res.status(201).json(toEncomendaResponse(encomenda));
}

export async function list(req: Request, res: Response) {
  const filter = req.user!.role === 'morador' ? { moradorId: req.user!.id } : {};
  const encomendas = await listEncomendas(tenantContextOf(req), filter);
  res.json(encomendas.map(toEncomendaResponse));
}

export async function getById(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);

  const encomenda = await findEncomendaById(tenantContextOf(req), id);
  if (!encomenda || (req.user!.role === 'morador' && encomenda.morador_id !== req.user!.id)) {
    throw new ApiError(404, 'Encomenda não encontrada');
  }

  res.json(toEncomendaResponse(encomenda));
}

export async function assinar(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);

  const encomenda = await signEncomenda(tenantContextOf(req), id, req.user!.id);
  if (!encomenda) {
    throw new ApiError(404, 'Encomenda não encontrada');
  }

  res.json(toEncomendaResponse(encomenda));
}
