import { Request, Response } from 'express';
import { z } from 'zod';

import { ApiError } from '../middleware/errorHandler';
import {
  Comunicado,
  createComunicado,
  findComunicadoById,
  listComunicados,
  markComunicadoAsRead,
} from '../models/Comunicado';
import { listTokensForCondominio } from '../models/DeviceToken';
import { sendPushToTokens } from '../services/notificationService';

export const createComunicadoSchema = z.object({
  titulo: z.string().min(1),
  conteudo: z.string().min(1),
});

function toComunicadoResponse(comunicado: Comunicado) {
  return {
    id: comunicado.id,
    condominioId: comunicado.condominio_id,
    adminId: comunicado.admin_id,
    titulo: comunicado.titulo,
    conteudo: comunicado.conteudo,
    dataCriacao: comunicado.data_criacao,
    lido: comunicado.lido,
  };
}

function tenantContextOf(req: Request) {
  return { userId: req.user!.id, condominioId: req.user!.condominioId };
}

export async function create(req: Request, res: Response) {
  const input = createComunicadoSchema.parse(req.body);
  const ctx = tenantContextOf(req);

  const comunicado = await createComunicado(ctx, {
    condominioId: req.user!.condominioId!,
    adminId: req.user!.id,
    ...input,
  });

  const tokens = await listTokensForCondominio(ctx);
  await sendPushToTokens(tokens, {
    title: 'Novo comunicado',
    body: input.titulo,
    data: { tipo: 'comunicado', comunicadoId: comunicado.id },
  });

  res.status(201).json(toComunicadoResponse(comunicado));
}

export async function list(req: Request, res: Response) {
  const comunicados = await listComunicados(tenantContextOf(req), req.user!.id);
  res.json(comunicados.map(toComunicadoResponse));
}

export async function getById(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);

  const comunicado = await findComunicadoById(tenantContextOf(req), id, req.user!.id);
  if (!comunicado) {
    throw new ApiError(404, 'Comunicado não encontrado');
  }

  res.json(toComunicadoResponse(comunicado));
}

export async function markAsRead(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const ctx = tenantContextOf(req);

  const comunicado = await findComunicadoById(ctx, id, req.user!.id);
  if (!comunicado) {
    throw new ApiError(404, 'Comunicado não encontrado');
  }

  if (!comunicado.lido) {
    await markComunicadoAsRead(ctx, id, req.user!.id);
  }

  res.json(toComunicadoResponse({ ...comunicado, lido: true }));
}
