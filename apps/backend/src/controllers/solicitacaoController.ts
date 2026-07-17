import { Request, Response } from 'express';
import { z } from 'zod';

import { ApiError } from '../middleware/errorHandler';
import {
  createSolicitacao,
  findSolicitacaoById,
  listSolicitacoes,
  Solicitacao,
  updateSolicitacao,
} from '../models/Solicitacao';

export const createSolicitacaoSchema = z.object({
  categoria: z.enum(['manutencao', 'seguranca', 'animal', 'outra']),
  titulo: z.string().min(1),
  descricao: z.string().min(1),
});

export const updateSolicitacaoSchema = z.object({
  status: z.enum(['aberto', 'em-progresso', 'resolvido']).optional(),
  prioridade: z.enum(['baixa', 'media', 'alta']).optional(),
  assignedTo: z.string().uuid().nullable().optional(),
});

function toSolicitacaoResponse(solicitacao: Solicitacao) {
  return {
    id: solicitacao.id,
    condominioId: solicitacao.condominio_id,
    moradorId: solicitacao.morador_id,
    assignedTo: solicitacao.assigned_to,
    categoria: solicitacao.categoria,
    titulo: solicitacao.titulo,
    descricao: solicitacao.descricao,
    status: solicitacao.status,
    prioridade: solicitacao.prioridade,
    dataCriacao: solicitacao.data_criacao,
    dataResolvimento: solicitacao.data_resolvimento,
  };
}

function tenantContextOf(req: Request) {
  return { userId: req.user!.id, condominioId: req.user!.condominioId };
}

export async function create(req: Request, res: Response) {
  const input = createSolicitacaoSchema.parse(req.body);

  const solicitacao = await createSolicitacao(tenantContextOf(req), {
    condominioId: req.user!.condominioId!,
    moradorId: req.user!.id,
    ...input,
  });

  res.status(201).json(toSolicitacaoResponse(solicitacao));
}

export async function list(req: Request, res: Response) {
  const filter = req.user!.role === 'morador' ? { moradorId: req.user!.id } : {};
  const solicitacoes = await listSolicitacoes(tenantContextOf(req), filter);
  res.json(solicitacoes.map(toSolicitacaoResponse));
}

export async function getById(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);

  const solicitacao = await findSolicitacaoById(tenantContextOf(req), id);
  if (!solicitacao || (req.user!.role === 'morador' && solicitacao.morador_id !== req.user!.id)) {
    throw new ApiError(404, 'Solicitação não encontrada');
  }

  res.json(toSolicitacaoResponse(solicitacao));
}

export async function update(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const input = updateSolicitacaoSchema.parse(req.body);

  const solicitacao = await updateSolicitacao(tenantContextOf(req), id, input);
  if (!solicitacao) {
    throw new ApiError(404, 'Solicitação não encontrada');
  }

  res.json(toSolicitacaoResponse(solicitacao));
}
