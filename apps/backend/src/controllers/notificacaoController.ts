import { Request, Response } from 'express';
import { z } from 'zod';

import {
  countNaoLidas,
  listNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas,
  Notificacao,
} from '../models/Notificacao';

function tenantContextOf(req: Request) {
  return { userId: req.user!.id, condominioId: req.user!.condominioId };
}

function toNotificacaoResponse(notificacao: Notificacao) {
  return {
    id: notificacao.id,
    tipo: notificacao.tipo,
    titulo: notificacao.titulo,
    corpo: notificacao.corpo,
    referenciaId: notificacao.referencia_id,
    lida: notificacao.lida,
    createdAt: notificacao.created_at,
  };
}

const listQuerySchema = z.object({
  apenasNaoLidas: z.coerce.boolean().optional(),
});

export async function list(req: Request, res: Response) {
  const query = listQuerySchema.parse(req.query);
  const notificacoes = await listNotificacoes(tenantContextOf(req), req.user!.id, query.apenasNaoLidas ?? false);
  res.json(notificacoes.map(toNotificacaoResponse));
}

export async function contagemNaoLidas(req: Request, res: Response) {
  const contagem = await countNaoLidas(tenantContextOf(req), req.user!.id);
  res.json({ contagem });
}

export async function marcarLida(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  await marcarComoLida(tenantContextOf(req), req.user!.id, id);
  res.status(204).send();
}

export async function marcarTodasLidas(req: Request, res: Response) {
  await marcarTodasComoLidas(tenantContextOf(req), req.user!.id);
  res.status(204).send();
}
