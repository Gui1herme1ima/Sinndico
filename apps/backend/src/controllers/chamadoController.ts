import { Request, Response } from 'express';
import { z } from 'zod';

import { ApiError } from '../middleware/errorHandler';
import {
  Chamado,
  createChamado,
  findChamadoById,
  listChamados,
  updateChamado,
} from '../models/Chamado';

export const createChamadoSchema = z.object({
  categoria: z.enum(['manutencao', 'seguranca', 'animal', 'outra']),
  titulo: z.string().min(1),
  descricao: z.string().min(1),
});

export const updateChamadoSchema = z.object({
  status: z.enum(['aberto', 'em-progresso', 'resolvido']).optional(),
  prioridade: z.enum(['baixa', 'media', 'alta']).optional(),
  assignedTo: z.string().uuid().nullable().optional(),
});

function toChamadoResponse(chamado: Chamado) {
  return {
    id: chamado.id,
    condominioId: chamado.condominio_id,
    moradorId: chamado.morador_id,
    assignedTo: chamado.assigned_to,
    categoria: chamado.categoria,
    titulo: chamado.titulo,
    descricao: chamado.descricao,
    status: chamado.status,
    prioridade: chamado.prioridade,
    dataCriacao: chamado.data_criacao,
    dataResolvimento: chamado.data_resolvimento,
  };
}

function tenantContextOf(req: Request) {
  return { userId: req.user!.id, condominioId: req.user!.condominioId };
}

export async function create(req: Request, res: Response) {
  const input = createChamadoSchema.parse(req.body);

  const chamado = await createChamado(tenantContextOf(req), {
    condominioId: req.user!.condominioId!,
    moradorId: req.user!.id,
    ...input,
  });

  res.status(201).json(toChamadoResponse(chamado));
}

export async function list(req: Request, res: Response) {
  const filter = req.user!.role === 'morador' ? { moradorId: req.user!.id } : {};
  const chamados = await listChamados(tenantContextOf(req), filter);
  res.json(chamados.map(toChamadoResponse));
}

export async function getById(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);

  const chamado = await findChamadoById(tenantContextOf(req), id);
  if (!chamado || (req.user!.role === 'morador' && chamado.morador_id !== req.user!.id)) {
    throw new ApiError(404, 'Chamado não encontrado');
  }

  res.json(toChamadoResponse(chamado));
}

export async function update(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const input = updateChamadoSchema.parse(req.body);

  const chamado = await updateChamado(tenantContextOf(req), id, input);
  if (!chamado) {
    throw new ApiError(404, 'Chamado não encontrado');
  }

  res.json(toChamadoResponse(chamado));
}
