import { Request, Response } from 'express';
import { z } from 'zod';

import {
  Comida,
  createComida,
  findComidaById,
  listComida,
  updateComidaStatus,
} from '../models/Comida';
import { findUserByIdForTenant, listPorteiroIdsForTenant } from '../models/User';
import { ApiError } from '../middleware/errorHandler';
import { notifyUsers } from '../services/notificationService';
import { parsePagination, resolveSortColumn } from '../utils/listQuery';

export const createComidaSchema = z.object({
  restaurante: z.string().min(1),
  horarioChegadaEstimada: z.string().datetime(),
  moradorId: z.string().uuid().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['em-caminho', 'chegou', 'retirada']),
});

const COMIDA_SORT_COLUMNS = {
  horarioChegadaEstimada: 'horario_chegada_estimada',
  status: 'status',
} as const;

export const listComidaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.enum(['horarioChegadaEstimada', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().trim().min(1).optional(),
  status: z.enum(['pedido-feito', 'em-caminho', 'chegou', 'retirada']).optional(),
});

function toComidaResponse(comida: Comida) {
  return {
    id: comida.id,
    condominioId: comida.condominio_id,
    moradorId: comida.morador_id,
    restaurante: comida.restaurante,
    horarioChegadaEstimada: comida.horario_chegada_estimada,
    status: comida.status,
    notificacaoPortariaEnviada: comida.notificacao_portaria_enviada,
  };
}

function tenantContextOf(req: Request) {
  return { userId: req.user!.id, condominioId: req.user!.condominioId };
}

export async function create(req: Request, res: Response) {
  const input = createComidaSchema.parse(req.body);
  const ctx = tenantContextOf(req);
  const isMorador = req.user!.role === 'morador';

  let moradorId = req.user!.id;
  if (!isMorador) {
    if (!input.moradorId) {
      throw new ApiError(400, 'Selecione o morador');
    }
    const morador = await findUserByIdForTenant(ctx, input.moradorId);
    if (!morador || morador.role !== 'morador') {
      throw new ApiError(400, 'moradorId inválido: usuário não encontrado ou não é morador deste condomínio');
    }
    moradorId = input.moradorId;
  }

  const comida = await createComida(ctx, {
    condominioId: req.user!.condominioId!,
    moradorId,
    restaurante: input.restaurante,
    horarioChegadaEstimada: input.horarioChegadaEstimada,
  });

  const porteiroIds = await listPorteiroIdsForTenant(ctx);
  await notifyUsers(ctx, porteiroIds, {
    tipo: 'comida',
    titulo: 'Novo pedido de comida',
    corpo: `Pedido de ${comida.restaurante} a caminho.`,
    referenciaId: comida.id,
  });

  res.status(201).json(toComidaResponse(comida));
}

export async function list(req: Request, res: Response) {
  const query = listComidaQuerySchema.parse(req.query);
  const { page, pageSize, limit, offset } = parsePagination(query);
  const sortColumn = resolveSortColumn(query.sortBy, COMIDA_SORT_COLUMNS, 'horarioChegadaEstimada');

  const filter = {
    ...(req.user!.role === 'morador' ? { moradorId: req.user!.id } : {}),
    status: query.status,
    search: query.search,
    sortColumn,
    sortOrder: (query.sortOrder ?? 'desc').toUpperCase() as 'ASC' | 'DESC',
    limit,
    offset,
  };

  const { items, total } = await listComida(tenantContextOf(req), filter);
  res.json({
    items: items.map(toComidaResponse),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

export async function getById(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);

  const comida = await findComidaById(tenantContextOf(req), id);
  if (!comida || (req.user!.role === 'morador' && comida.morador_id !== req.user!.id)) {
    throw new ApiError(404, 'Pedido não encontrado');
  }

  res.json(toComidaResponse(comida));
}

export async function updateStatus(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const input = updateStatusSchema.parse(req.body);
  const ctx = tenantContextOf(req);

  const isMorador = req.user!.role === 'morador';
  const isPortaria = req.user!.role === 'porteiro' || req.user!.role === 'admin';

  if ((input.status === 'em-caminho' || input.status === 'retirada') && !isMorador) {
    throw new ApiError(403, 'Só o morador pode atualizar esse status');
  }
  if (input.status === 'chegou' && !isPortaria) {
    throw new ApiError(403, 'Só porteiro ou admin podem confirmar a chegada');
  }

  const comida = await updateComidaStatus(
    ctx,
    id,
    input.status,
    isMorador ? req.user!.id : undefined
  );
  if (!comida) {
    throw new ApiError(404, 'Pedido não encontrado');
  }

  if (input.status === 'chegou') {
    await notifyUsers(ctx, [comida.morador_id], {
      tipo: 'comida',
      titulo: 'Seu pedido chegou',
      corpo: `${comida.restaurante} chegou na portaria.`,
      referenciaId: comida.id,
    });
  }

  res.json(toComidaResponse(comida));
}
