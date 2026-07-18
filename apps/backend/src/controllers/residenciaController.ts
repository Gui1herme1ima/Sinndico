import { Request, Response } from 'express';
import { z } from 'zod';

import { TenantContext } from '../database/tenantContext';
import { ApiError } from '../middleware/errorHandler';
import { findCondominioById } from '../models/Condominio';
import {
  createResidencia,
  findConflictingResidencia,
  findResidenciaById,
  listResidencias,
  Residencia,
  updateResidencia,
} from '../models/Residencia';

export const createResidenciaSchema = z.object({
  bloco: z.string().min(1).optional(),
  rua: z.string().min(1).optional(),
  numero: z.string().min(1),
});

export const updateResidenciaSchema = createResidenciaSchema;

export const importarResidenciasSchema = z.object({
  residencias: z.array(createResidenciaSchema).min(1).max(500),
});

function toResidenciaResponse(residencia: Residencia) {
  return {
    id: residencia.id,
    condominioId: residencia.condominio_id,
    bloco: residencia.bloco,
    rua: residencia.rua,
    numero: residencia.numero,
    createdAt: residencia.created_at,
  };
}

function tenantContextOf(req: Request) {
  return { userId: req.user!.id, condominioId: req.user!.condominioId };
}

// A obrigatoriedade de bloco vs rua depende do tipo do condomínio (linha de outra tabela), então não
// dá pra validar só no Zod — resolve aqui e devolve os dois campos já normalizados (o que não se aplica
// ao tipo do condomínio sempre vira null, nunca fica com lixo da requisição).
async function normalizarBlocoRua(
  condominioId: string,
  input: { bloco?: string; rua?: string }
): Promise<{ bloco: string | null; rua: string | null }> {
  const condominio = await findCondominioById(condominioId);
  if (!condominio) {
    throw new ApiError(404, 'Condomínio não encontrado');
  }

  if (condominio.tipo_residencia === 'apartamento') {
    if (!input.bloco) {
      throw new ApiError(400, 'Bloco é obrigatório para condomínios do tipo apartamento');
    }
    return { bloco: input.bloco, rua: null };
  }

  if (!input.rua) {
    throw new ApiError(400, 'Rua é obrigatória para condomínios do tipo casa');
  }
  return { bloco: null, rua: input.rua };
}

// Compartilhada por create() e importar() — checa bloco/rua vs tipo do condomínio, duplicidade, e
// insere. Lança ApiError igual ao caminho de criação individual; importar() captura por linha em vez
// de deixar propagar, pra uma linha ruim não derrubar as outras.
async function criarUmaResidencia(
  condominioId: string,
  ctx: TenantContext,
  input: { bloco?: string; rua?: string; numero: string }
): Promise<Residencia> {
  const { bloco, rua } = await normalizarBlocoRua(condominioId, input);

  const conflito = await findConflictingResidencia(ctx, { bloco, rua, numero: input.numero });
  if (conflito) {
    throw new ApiError(409, 'Já existe uma residência cadastrada com esse bloco/rua e número');
  }

  return createResidencia(ctx, { condominioId, bloco, rua, numero: input.numero });
}

export async function create(req: Request, res: Response) {
  const input = createResidenciaSchema.parse(req.body);
  const condominioId = req.user!.condominioId!;
  const ctx = tenantContextOf(req);

  const residencia = await criarUmaResidencia(condominioId, ctx, input);
  res.status(201).json(toResidenciaResponse(residencia));
}

// Importação em massa (Fatia 6) — parcial de propósito: cada linha é processada independente, uma
// linha com erro não derruba as outras (a UI mostra quantas entraram e o motivo de cada falha).
export async function importar(req: Request, res: Response) {
  const input = importarResidenciasSchema.parse(req.body);
  const condominioId = req.user!.condominioId!;
  const ctx = tenantContextOf(req);

  let criadas = 0;
  const erros: { linha: number; motivo: string }[] = [];

  for (let i = 0; i < input.residencias.length; i++) {
    try {
      await criarUmaResidencia(condominioId, ctx, input.residencias[i]);
      criadas++;
    } catch (err) {
      erros.push({ linha: i + 1, motivo: err instanceof ApiError ? err.message : 'Erro inesperado' });
    }
  }

  res.json({ criadas, erros });
}

export async function list(req: Request, res: Response) {
  const residencias = await listResidencias(tenantContextOf(req));
  res.json(residencias.map(toResidenciaResponse));
}

export async function getById(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);

  const residencia = await findResidenciaById(tenantContextOf(req), id);
  if (!residencia) {
    throw new ApiError(404, 'Residência não encontrada');
  }

  res.json(toResidenciaResponse(residencia));
}

export async function update(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const input = updateResidenciaSchema.parse(req.body);
  const condominioId = req.user!.condominioId!;
  const ctx = tenantContextOf(req);

  const { bloco, rua } = await normalizarBlocoRua(condominioId, input);

  const conflito = await findConflictingResidencia(ctx, { bloco, rua, numero: input.numero }, id);
  if (conflito) {
    throw new ApiError(409, 'Já existe uma residência cadastrada com esse bloco/rua e número');
  }

  const residencia = await updateResidencia(ctx, id, { bloco, rua, numero: input.numero });
  if (!residencia) {
    throw new ApiError(404, 'Residência não encontrada');
  }

  res.json(toResidenciaResponse(residencia));
}
