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
import { parsePagination, resolveSortColumn } from '../utils/listQuery';

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

const SOLICITACAO_SORT_COLUMNS = {
  dataCriacao: 'data_criacao',
  prioridade: 'prioridade',
  status: 'status',
} as const;

export const listSolicitacoesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.enum(['dataCriacao', 'prioridade', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().trim().min(1).optional(),
  status: z.enum(['aberto', 'em-progresso', 'resolvido']).optional(),
  categoria: z.enum(['manutencao', 'seguranca', 'animal', 'outra']).optional(),
  dataInicio: z.string().date().optional(),
  dataFim: z.string().date().optional(),
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
  const query = listSolicitacoesQuerySchema.parse(req.query);
  const { page, pageSize, limit, offset } = parsePagination(query);
  const sortColumn = resolveSortColumn(query.sortBy, SOLICITACAO_SORT_COLUMNS, 'dataCriacao');

  const filter = {
    ...(req.user!.role === 'morador' ? { moradorId: req.user!.id } : {}),
    status: query.status,
    categoria: query.categoria,
    search: query.search,
    dataInicio: query.dataInicio,
    dataFim: query.dataFim,
    sortColumn,
    sortOrder: (query.sortOrder ?? 'desc').toUpperCase() as 'ASC' | 'DESC',
    limit,
    offset,
  };

  const { items, total } = await listSolicitacoes(tenantContextOf(req), filter);
  res.json({
    items: items.map(toSolicitacaoResponse),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
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
