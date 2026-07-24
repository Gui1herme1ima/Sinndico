import { Request, Response } from 'express';
import { z } from 'zod';

import { withTenantContext } from '../database/tenantContext';
import { ApiError } from '../middleware/errorHandler';
import {
  createResidencia,
  findConflictingResidencia,
  findResidenciaById,
  findSetorNomeByResidenciaId,
  listResidenciasPorSetor,
  listTodasResidencias,
  Residencia,
  ResidenciaComContagem,
  ResidenciaComSetorInfo,
  updateResidencia,
} from '../models/Residencia';
import { findSetorById, listSetores } from '../models/Setor';
import { Encomenda } from '../models/Encomenda';
import { Solicitacao } from '../models/Solicitacao';
import { User } from '../models/User';
import { Visitante } from '../models/Visitante';

// Mappers "resumo" (só o que a aba de detalhe da residência precisa exibir em lista) — mais
// enxutos que os toXxxResponse privados dos controllers de origem, que não são exportados.
function toMoradorResumoResponse(user: User) {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    telefone: user.telefone,
    apto: user.apto,
  };
}

function toVisitanteResumoResponse(visitante: Visitante) {
  return {
    id: visitante.id,
    nomeVisitante: visitante.nome_visitante,
    dataVisita: visitante.data_visita,
    status: visitante.status,
  };
}

function toEncomendaResumoResponse(encomenda: Encomenda) {
  return {
    id: encomenda.id,
    descricao: encomenda.descricao,
    horarioChegada: encomenda.horario_chegada,
    status: encomenda.status,
  };
}

function toSolicitacaoResumoResponse(solicitacao: Solicitacao) {
  return {
    id: solicitacao.id,
    titulo: solicitacao.titulo,
    categoria: solicitacao.categoria,
    status: solicitacao.status,
    prioridade: solicitacao.prioridade,
    dataCriacao: solicitacao.data_criacao,
  };
}

export const createResidenciaSchema = z.object({
  setorId: z.string().uuid(),
  numero: z.string().min(1),
});

export const updateResidenciaSchema = createResidenciaSchema;

// A planilha não tem o UUID do setor — vem o nome (ex.: "Bloco A"), resolvido contra os setores
// já cadastrados do tenant antes de inserir (ver importar()).
export const importarResidenciaLinhaSchema = z.object({
  setor: z.string().min(1),
  numero: z.string().min(1),
});

export const importarResidenciasSchema = z.object({
  residencias: z.array(importarResidenciaLinhaSchema).min(1).max(500),
});

function toResidenciaResponse(residencia: Residencia) {
  return {
    id: residencia.id,
    condominioId: residencia.condominio_id,
    setorId: residencia.setor_id,
    numero: residencia.numero,
    createdAt: residencia.created_at,
  };
}

function toResidenciaComContagemResponse(residencia: ResidenciaComContagem) {
  return {
    ...toResidenciaResponse(residencia),
    moradoresCount: Number(residencia.moradores_count),
  };
}

function tenantContextOf(req: Request) {
  return { userId: req.user!.id, condominioId: req.user!.condominioId };
}

// Compartilhada por create() e importar() — checa se o setor existe e pertence ao tenant,
// checa duplicidade de número dentro do setor, e insere. Lança ApiError igual ao caminho de
// criação individual; importar() captura por linha em vez de deixar propagar.
async function criarUmaResidencia(
  condominioId: string,
  ctx: ReturnType<typeof tenantContextOf>,
  input: { setorId: string; numero: string }
): Promise<Residencia> {
  const setor = await findSetorById(ctx, input.setorId);
  if (!setor) {
    throw new ApiError(404, 'Setor não encontrado');
  }

  const conflito = await findConflictingResidencia(ctx, { setorId: input.setorId, numero: input.numero });
  if (conflito) {
    throw new ApiError(409, 'Já existe uma residência cadastrada com esse número neste setor');
  }

  return createResidencia(ctx, { condominioId, setorId: input.setorId, numero: input.numero });
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

  const setores = await listSetores(ctx);
  const setorIdPorNome = new Map(setores.map((s) => [s.nome.toLowerCase(), s.id]));

  let criadas = 0;
  const erros: { linha: number; motivo: string }[] = [];

  for (let i = 0; i < input.residencias.length; i++) {
    const linha = input.residencias[i];
    try {
      const setorId = setorIdPorNome.get(linha.setor.toLowerCase());
      if (!setorId) {
        throw new ApiError(404, 'Setor não encontrado para o nome informado');
      }
      await criarUmaResidencia(condominioId, ctx, { setorId, numero: linha.numero });
      criadas++;
    } catch (err) {
      erros.push({ linha: i + 1, motivo: err instanceof ApiError ? err.message : 'Erro inesperado' });
    }
  }

  res.json({ criadas, erros });
}

export const listResidenciasQuerySchema = z.object({
  setorId: z.string().uuid().optional(),
  search: z.string().optional(),
});

function toResidenciaComSetorResponse(residencia: ResidenciaComSetorInfo) {
  return {
    ...toResidenciaResponse(residencia),
    setorNome: residencia.setor_nome,
    setorTipo: residencia.setor_tipo,
  };
}

// Sem setorId: lista achatada de todas as residências do tenant, com o setor resolvido — usada
// pelo seletor de residência de Moradores (fora do contexto de um setor específico). Com setorId:
// listagem por setor (drill-down da tela de Setores), com contagem de moradores por residência.
export async function list(req: Request, res: Response) {
  const { setorId, search } = listResidenciasQuerySchema.parse(req.query);
  const ctx = tenantContextOf(req);

  if (!setorId) {
    const residencias = await listTodasResidencias(ctx);
    res.json(residencias.map(toResidenciaComSetorResponse));
    return;
  }

  const residencias = await listResidenciasPorSetor(ctx, setorId, search);
  res.json(residencias.map(toResidenciaComContagemResponse));
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
  const ctx = tenantContextOf(req);

  const setor = await findSetorById(ctx, input.setorId);
  if (!setor) {
    throw new ApiError(404, 'Setor não encontrado');
  }

  const conflito = await findConflictingResidencia(ctx, { setorId: input.setorId, numero: input.numero }, id);
  if (conflito) {
    throw new ApiError(409, 'Já existe uma residência cadastrada com esse número neste setor');
  }

  const residencia = await updateResidencia(ctx, id, { setorId: input.setorId, numero: input.numero });
  if (!residencia) {
    throw new ApiError(404, 'Residência não encontrada');
  }

  res.json(toResidenciaResponse(residencia));
}

// Fatia 4.10.2 — agrega tudo que está vinculado à residência numa única resposta, pra tela de
// detalhe montar as abas sem múltiplos round-trips. Visitantes/encomendas/solicitações não têm
// residencia_id direto (só morador_id), então filtra via subquery pelos moradores da residência.
export async function getDetalhe(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const ctx = tenantContextOf(req);

  const residencia = await findResidenciaById(ctx, id);
  if (!residencia) {
    throw new ApiError(404, 'Residência não encontrada');
  }

  const setor = await findSetorNomeByResidenciaId(ctx, residencia.setor_id);

  const detalhe = await withTenantContext(ctx, async (client) => {
    const [moradores, visitantes, encomendas, solicitacoes] = await Promise.all([
      client.query<User>('SELECT * FROM users WHERE residencia_id = $1 ORDER BY nome', [id]),
      client.query<Visitante>(
        `SELECT * FROM visitantes
         WHERE morador_id IN (SELECT id FROM users WHERE residencia_id = $1)
         ORDER BY data_visita DESC`,
        [id]
      ),
      client.query<Encomenda>(
        `SELECT * FROM encomendas
         WHERE morador_id IN (SELECT id FROM users WHERE residencia_id = $1)
         ORDER BY horario_chegada DESC`,
        [id]
      ),
      client.query<Solicitacao>(
        `SELECT * FROM solicitacoes
         WHERE morador_id IN (SELECT id FROM users WHERE residencia_id = $1)
         ORDER BY data_criacao DESC`,
        [id]
      ),
    ]);

    return {
      moradores: moradores.rows.map(toMoradorResumoResponse),
      visitantes: visitantes.rows.map(toVisitanteResumoResponse),
      encomendas: encomendas.rows.map(toEncomendaResumoResponse),
      solicitacoes: solicitacoes.rows.map(toSolicitacaoResumoResponse),
    };
  });

  res.json({
    residencia: {
      ...toResidenciaResponse(residencia),
      setorNome: setor?.nome ?? null,
      setorTipo: setor?.tipo ?? null,
    },
    ...detalhe,
  });
}
