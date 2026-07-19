import { Request, Response } from 'express';
import { z } from 'zod';

import {
  Assembleia,
  createAssembleia,
  findAssembleiaById,
  listAssembleias,
  updateAssembleiaStatus,
} from '../models/Assembleia';
import { listUsersForTenant } from '../models/User';
import {
  ContagemVotos,
  contarVotos,
  contarVotosPorAssembleias,
  createVoto,
  findVotoDoMorador,
  listVotosDoMorador,
  OpcaoVoto,
} from '../models/Voto';
import { ApiError } from '../middleware/errorHandler';
import { notifyUsers } from '../services/notificationService';

export const createAssembleiaSchema = z.object({
  titulo: z.string().min(1),
  data: z.string().datetime(),
  descricao: z.string().optional(),
  pauta: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['em-votacao', 'encerrada']),
});

export const votarSchema = z.object({
  voto: z.enum(['sim', 'nao', 'abstencao']),
});

// Transições válidas — sempre pra frente, uma etapa por vez.
const PROXIMO_STATUS_VALIDO: Record<string, string> = {
  planejada: 'em-votacao',
  'em-votacao': 'encerrada',
};

function tenantContextOf(req: Request) {
  return { userId: req.user!.id, condominioId: req.user!.condominioId };
}

function toAssembleiaResponse(assembleia: Assembleia, votos: ContagemVotos, meuVoto?: OpcaoVoto | null) {
  return {
    id: assembleia.id,
    condominioId: assembleia.condominio_id,
    titulo: assembleia.titulo,
    data: assembleia.data,
    descricao: assembleia.descricao,
    pauta: assembleia.pauta,
    status: assembleia.status,
    votos,
    ...(meuVoto !== undefined ? { meuVoto } : {}),
  };
}

async function notificarMoradores(req: Request, titulo: string, corpo: string, assembleiaId: string) {
  const ctx = tenantContextOf(req);
  const moradores = await listUsersForTenant(ctx, ['morador']);
  await notifyUsers(ctx, moradores.map((m) => m.id), {
    tipo: 'assembleia',
    titulo,
    corpo,
    referenciaId: assembleiaId,
  });
}

export async function create(req: Request, res: Response) {
  const input = createAssembleiaSchema.parse(req.body);
  const ctx = tenantContextOf(req);

  const assembleia = await createAssembleia(ctx, {
    condominioId: req.user!.condominioId!,
    titulo: input.titulo,
    data: input.data,
    descricao: input.descricao,
    pauta: input.pauta,
  });

  await notificarMoradores(req, 'Nova assembleia convocada', input.titulo, assembleia.id);

  res.status(201).json(toAssembleiaResponse(assembleia, { sim: 0, nao: 0, abstencao: 0, total: 0 }));
}

export async function list(req: Request, res: Response) {
  const ctx = tenantContextOf(req);
  const assembleias = await listAssembleias(ctx);
  const ids = assembleias.map((a) => a.id);

  const contagens = await contarVotosPorAssembleias(ctx, ids);
  const meusVotos =
    req.user!.role === 'morador' ? await listVotosDoMorador(ctx, ids, req.user!.id) : null;

  res.json(
    assembleias.map((a) =>
      toAssembleiaResponse(
        a,
        contagens.get(a.id) ?? { sim: 0, nao: 0, abstencao: 0, total: 0 },
        meusVotos ? meusVotos.get(a.id) ?? null : undefined
      )
    )
  );
}

export async function getById(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const ctx = tenantContextOf(req);

  const assembleia = await findAssembleiaById(ctx, id);
  if (!assembleia) {
    throw new ApiError(404, 'Assembleia não encontrada');
  }

  const votos = await contarVotos(ctx, id);
  const meuVoto =
    req.user!.role === 'morador' ? (await findVotoDoMorador(ctx, id, req.user!.id))?.voto ?? null : undefined;

  res.json(toAssembleiaResponse(assembleia, votos, meuVoto));
}

export async function updateStatus(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const input = updateStatusSchema.parse(req.body);
  const ctx = tenantContextOf(req);

  const assembleia = await findAssembleiaById(ctx, id);
  if (!assembleia) {
    throw new ApiError(404, 'Assembleia não encontrada');
  }

  if (PROXIMO_STATUS_VALIDO[assembleia.status] !== input.status) {
    throw new ApiError(400, `Não é possível mudar de "${assembleia.status}" para "${input.status}"`);
  }

  const atualizada = await updateAssembleiaStatus(ctx, id, input.status);
  if (!atualizada) {
    throw new ApiError(404, 'Assembleia não encontrada');
  }

  if (input.status === 'em-votacao') {
    await notificarMoradores(req, 'Assembleia aberta para votação', atualizada.titulo, atualizada.id);
  }

  const votos = await contarVotos(ctx, id);
  res.json(toAssembleiaResponse(atualizada, votos));
}

export async function votar(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const input = votarSchema.parse(req.body);
  const ctx = tenantContextOf(req);

  const assembleia = await findAssembleiaById(ctx, id);
  if (!assembleia) {
    throw new ApiError(404, 'Assembleia não encontrada');
  }
  if (assembleia.status !== 'em-votacao') {
    throw new ApiError(400, 'Esta assembleia não está em votação no momento');
  }

  const votoExistente = await findVotoDoMorador(ctx, id, req.user!.id);
  if (votoExistente) {
    throw new ApiError(409, 'Você já votou nesta assembleia');
  }

  await createVoto(ctx, id, req.user!.id, input.voto);

  const votos = await contarVotos(ctx, id);
  res.status(201).json(toAssembleiaResponse(assembleia, votos, input.voto));
}
