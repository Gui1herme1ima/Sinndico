import { Request, Response } from 'express';
import { z } from 'zod';

import { ApiError } from '../middleware/errorHandler';
import { findAreaComumById } from '../models/AreaComum';
import { listTokensForUsers } from '../models/DeviceToken';
import {
  createReserva,
  findReservaById,
  hasConflictingReserva,
  listReservas,
  Reserva,
  updateReservaStatus,
} from '../models/Reserva';
import { listAdminIdsForTenant } from '../models/User';
import { sendPushToTokens } from '../services/notificationService';
import { parsePagination, resolveSortColumn } from '../utils/listQuery';

export const createReservaSchema = z
  .object({
    areaComumId: z.string().uuid(),
    horaInicio: z.string().datetime(),
    horaFim: z.string().datetime(),
  })
  .refine((data) => new Date(data.horaFim) > new Date(data.horaInicio), {
    message: 'horaFim precisa ser depois de horaInicio',
    path: ['horaFim'],
  });

export const updateStatusSchema = z.object({
  status: z.enum(['aprovada', 'cancelada']),
});

const RESERVA_SORT_COLUMNS = {
  horaInicio: 'r.hora_inicio',
  status: 'r.status',
} as const;

export const listReservasQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.enum(['horaInicio', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().trim().min(1).optional(),
  status: z.enum(['pendente', 'aprovada', 'cancelada']).optional(),
});

function toReservaResponse(reserva: Reserva) {
  return {
    id: reserva.id,
    condominioId: reserva.condominio_id,
    areaComumId: reserva.area_comum_id,
    moradorId: reserva.morador_id,
    horaInicio: reserva.hora_inicio,
    horaFim: reserva.hora_fim,
    status: reserva.status,
  };
}

function tenantContextOf(req: Request) {
  return { userId: req.user!.id, condominioId: req.user!.condominioId };
}

export async function create(req: Request, res: Response) {
  const input = createReservaSchema.parse(req.body);
  const ctx = tenantContextOf(req);

  const area = await findAreaComumById(ctx, input.areaComumId);
  if (!area) {
    throw new ApiError(400, 'areaComumId inválido: área comum não encontrada neste condomínio');
  }

  const conflito = await hasConflictingReserva(ctx, input.areaComumId, input.horaInicio, input.horaFim);
  if (conflito) {
    throw new ApiError(400, 'Já existe uma reserva pendente ou aprovada para esse horário');
  }

  const reserva = await createReserva(ctx, {
    condominioId: req.user!.condominioId!,
    areaComumId: input.areaComumId,
    moradorId: req.user!.id,
    horaInicio: input.horaInicio,
    horaFim: input.horaFim,
  });

  const adminIds = await listAdminIdsForTenant(ctx);
  const tokens = await listTokensForUsers(ctx, adminIds);
  await sendPushToTokens(tokens, {
    title: 'Nova reserva pendente',
    body: `${area.nome} — aguardando aprovação.`,
    data: { tipo: 'reserva', reservaId: reserva.id },
  });

  res.status(201).json(toReservaResponse(reserva));
}

export async function list(req: Request, res: Response) {
  const query = listReservasQuerySchema.parse(req.query);
  const { page, pageSize, limit, offset } = parsePagination(query);
  const sortColumn = resolveSortColumn(query.sortBy, RESERVA_SORT_COLUMNS, 'horaInicio');

  const filter = {
    ...(req.user!.role === 'morador' ? { moradorId: req.user!.id } : {}),
    status: query.status,
    search: query.search,
    sortColumn,
    sortOrder: (query.sortOrder ?? 'desc').toUpperCase() as 'ASC' | 'DESC',
    limit,
    offset,
  };

  const { items, total } = await listReservas(tenantContextOf(req), filter);
  res.json({
    items: items.map(toReservaResponse),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

export async function getById(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);

  const reserva = await findReservaById(tenantContextOf(req), id);
  if (!reserva || (req.user!.role === 'morador' && reserva.morador_id !== req.user!.id)) {
    throw new ApiError(404, 'Reserva não encontrada');
  }

  res.json(toReservaResponse(reserva));
}

export async function updateStatus(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const input = updateStatusSchema.parse(req.body);
  const ctx = tenantContextOf(req);

  const isMorador = req.user!.role === 'morador';

  if (input.status === 'aprovada' && isMorador) {
    throw new ApiError(403, 'Só admin pode aprovar uma reserva');
  }

  const reserva = await updateReservaStatus(ctx, id, input.status, isMorador ? req.user!.id : undefined);
  if (!reserva) {
    throw new ApiError(404, 'Reserva não encontrada');
  }

  if (!isMorador) {
    const tokens = await listTokensForUsers(ctx, [reserva.morador_id]);
    const title = input.status === 'aprovada' ? 'Reserva aprovada' : 'Reserva cancelada';
    await sendPushToTokens(tokens, {
      title,
      body: `Sua reserva foi ${input.status === 'aprovada' ? 'aprovada' : 'cancelada'} pelo síndico.`,
      data: { tipo: 'reserva', reservaId: reserva.id },
    });
  }

  res.json(toReservaResponse(reserva));
}
