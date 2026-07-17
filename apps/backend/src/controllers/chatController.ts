import { Request, Response } from 'express';
import { z } from 'zod';

import { ApiError } from '../middleware/errorHandler';
import { Chat, createChatMessage, listChatMessages, markThreadAsRead } from '../models/Chat';
import { listTokensForUsers } from '../models/DeviceToken';
import { findUserByIdForTenant, listAdminIdsForTenant } from '../models/User';
import { sendPushToTokens } from '../services/notificationService';

export const createChatSchema = z.object({
  // Obrigatório só quando quem escreve é admin (precisa dizer com qual morador); morador escreve
  // sempre na própria thread, então esse campo é ignorado nesse caso.
  moradorId: z.string().uuid().optional(),
  mensagem: z.string().min(1),
});

const listChatQuerySchema = z.object({
  moradorId: z.string().uuid().optional(),
});

function toChatResponse(chat: Chat) {
  return {
    id: chat.id,
    condominioId: chat.condominio_id,
    moradorId: chat.morador_id,
    autorId: chat.autor_id,
    mensagem: chat.mensagem,
    lido: chat.lido,
    createdAt: chat.created_at,
  };
}

function tenantContextOf(req: Request) {
  return { userId: req.user!.id, condominioId: req.user!.condominioId };
}

async function resolveMoradorId(req: Request, moradorIdFromInput?: string): Promise<string> {
  if (req.user!.role === 'morador') {
    return req.user!.id;
  }

  if (!moradorIdFromInput) {
    throw new ApiError(400, 'moradorId é obrigatório para admin');
  }

  const morador = await findUserByIdForTenant(tenantContextOf(req), moradorIdFromInput);
  if (!morador || morador.role !== 'morador') {
    throw new ApiError(400, 'moradorId inválido: usuário não encontrado ou não é morador deste condomínio');
  }

  return moradorIdFromInput;
}

export async function create(req: Request, res: Response) {
  const input = createChatSchema.parse(req.body);
  const ctx = tenantContextOf(req);

  const moradorId = await resolveMoradorId(req, input.moradorId);

  const chat = await createChatMessage(ctx, {
    condominioId: req.user!.condominioId!,
    moradorId,
    autorId: req.user!.id,
    mensagem: input.mensagem,
  });

  const destinatarios = req.user!.role === 'morador' ? await listAdminIdsForTenant(ctx) : [moradorId];
  const tokens = await listTokensForUsers(ctx, destinatarios);
  await sendPushToTokens(tokens, {
    title: req.user!.role === 'morador' ? 'Nova mensagem de morador' : 'Nova mensagem da administração',
    body: input.mensagem,
    data: { tipo: 'chat', moradorId },
  });

  res.status(201).json(toChatResponse(chat));
}

export async function list(req: Request, res: Response) {
  const query = listChatQuerySchema.parse(req.query);
  const ctx = tenantContextOf(req);

  const moradorId = await resolveMoradorId(req, query.moradorId);

  const messages = await listChatMessages(ctx, moradorId);
  await markThreadAsRead(ctx, moradorId, req.user!.id);

  res.json(messages.map(toChatResponse));
}
