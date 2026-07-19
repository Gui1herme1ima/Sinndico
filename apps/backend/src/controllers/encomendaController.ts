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
import { listTokensForUsers } from '../models/DeviceToken';
import { sendPushToTokens } from '../services/notificationService';
import { parsePagination, resolveSortColumn } from '../utils/listQuery';

export const createEncomendaSchema = z.object({
  moradorId: z.string().uuid(),
  descricao: z.string().min(1).optional(),
  fotoUrl: z.string().url().optional(),
});

const ENCOMENDA_SORT_COLUMNS = {
  horarioChegada: 'horario_chegada',
  status: 'status',
} as const;

export const listEncomendasQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.enum(['horarioChegada', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().trim().min(1).optional(),
  status: z.enum(['aguardando', 'retirada']).optional(),
  dataInicio: z.string().date().optional(),
  dataFim: z.string().date().optional(),
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

  const tokens = await listTokensForUsers(ctx, [encomenda.morador_id]);
  await sendPushToTokens(tokens, {
    title: 'Encomenda chegou',
    body: encomenda.descricao ?? 'Você tem uma nova encomenda na portaria.',
    data: { tipo: 'encomenda', encomendaId: encomenda.id },
  });

  res.status(201).json(toEncomendaResponse(encomenda));
}

export async function list(req: Request, res: Response) {
  const query = listEncomendasQuerySchema.parse(req.query);
  const { page, pageSize, limit, offset } = parsePagination(query);
  const sortColumn = resolveSortColumn(query.sortBy, ENCOMENDA_SORT_COLUMNS, 'horarioChegada');

  const filter = {
    ...(req.user!.role === 'morador' ? { moradorId: req.user!.id } : {}),
    status: query.status,
    search: query.search,
    dataInicio: query.dataInicio,
    dataFim: query.dataFim,
    sortColumn,
    sortOrder: (query.sortOrder ?? 'desc').toUpperCase() as 'ASC' | 'DESC',
    limit,
    offset,
  };

  const { items, total } = await listEncomendas(tenantContextOf(req), filter);
  res.json({
    items: items.map(toEncomendaResponse),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
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
