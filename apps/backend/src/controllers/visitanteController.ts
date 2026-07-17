import { Request, Response } from 'express';
import { z } from 'zod';

import { ApiError } from '../middleware/errorHandler';
import {
  findVisitanteById,
  listVisitantes,
  registrarEntrada,
  registrarSaida,
  Visitante,
  createVisitante,
  updateVisitanteStatus,
} from '../models/Visitante';

export const createVisitanteSchema = z.object({
  nomeVisitante: z.string().min(1),
  rg: z.string().min(1).optional(),
  placaVeiculo: z.string().min(1).optional(),
  dataVisita: z.string().datetime(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['aprovado', 'bloqueado']),
});

function toVisitanteResponse(visitante: Visitante) {
  return {
    id: visitante.id,
    condominioId: visitante.condominio_id,
    moradorId: visitante.morador_id,
    aprovadoPor: visitante.aprovado_por,
    nomeVisitante: visitante.nome_visitante,
    rg: visitante.rg,
    placaVeiculo: visitante.placa_veiculo,
    dataVisita: visitante.data_visita,
    horaEntrada: visitante.hora_entrada,
    horaSaida: visitante.hora_saida,
    status: visitante.status,
  };
}

function tenantContextOf(req: Request) {
  return { userId: req.user!.id, condominioId: req.user!.condominioId };
}

export async function create(req: Request, res: Response) {
  const input = createVisitanteSchema.parse(req.body);
  const ctx = tenantContextOf(req);

  const visitante = await createVisitante(ctx, {
    condominioId: req.user!.condominioId!,
    moradorId: req.user!.id,
    aprovadoPor: req.user!.id,
    ...input,
  });

  res.status(201).json(toVisitanteResponse(visitante));
}

export async function list(req: Request, res: Response) {
  const filter = req.user!.role === 'morador' ? { moradorId: req.user!.id } : {};
  const visitantes = await listVisitantes(tenantContextOf(req), filter);
  res.json(visitantes.map(toVisitanteResponse));
}

export async function getById(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);

  const visitante = await findVisitanteById(tenantContextOf(req), id);
  if (!visitante || (req.user!.role === 'morador' && visitante.morador_id !== req.user!.id)) {
    throw new ApiError(404, 'Visitante não encontrado');
  }

  res.json(toVisitanteResponse(visitante));
}

export async function entrada(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);

  const visitante = await registrarEntrada(tenantContextOf(req), id);
  if (!visitante) {
    throw new ApiError(400, 'Não foi possível registrar a entrada — visitante não encontrado ou não está aprovado');
  }

  res.json(toVisitanteResponse(visitante));
}

export async function saida(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);

  const visitante = await registrarSaida(tenantContextOf(req), id);
  if (!visitante) {
    throw new ApiError(400, 'Não foi possível registrar a saída — visitante não encontrado ou não está ativo');
  }

  res.json(toVisitanteResponse(visitante));
}

export async function updateStatus(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const input = updateStatusSchema.parse(req.body);

  const visitante = await updateVisitanteStatus(tenantContextOf(req), id, input.status);
  if (!visitante) {
    throw new ApiError(404, 'Visitante não encontrado');
  }

  res.json(toVisitanteResponse(visitante));
}
