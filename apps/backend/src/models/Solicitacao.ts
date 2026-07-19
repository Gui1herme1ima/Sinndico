import { TenantContext, withTenantContext } from '../database/tenantContext';

export type SolicitacaoCategoria = 'manutencao' | 'seguranca' | 'animal' | 'outra';
export type SolicitacaoStatus = 'aberto' | 'em-progresso' | 'resolvido';
export type SolicitacaoPrioridade = 'baixa' | 'media' | 'alta';

export interface Solicitacao {
  id: string;
  condominio_id: string;
  morador_id: string;
  assigned_to: string | null;
  categoria: SolicitacaoCategoria;
  titulo: string;
  descricao: string;
  status: SolicitacaoStatus;
  prioridade: SolicitacaoPrioridade;
  data_criacao: Date;
  data_resolvimento: Date | null;
}

export interface CreateSolicitacaoInput {
  condominioId: string;
  moradorId: string;
  categoria: SolicitacaoCategoria;
  titulo: string;
  descricao: string;
}

export async function createSolicitacao(ctx: TenantContext, input: CreateSolicitacaoInput): Promise<Solicitacao> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Solicitacao>(
      `INSERT INTO solicitacoes (condominio_id, morador_id, categoria, titulo, descricao)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [input.condominioId, input.moradorId, input.categoria, input.titulo, input.descricao]
    );
    return result.rows[0];
  });
}

export interface ListSolicitacoesFilter {
  // RLS já restringe ao condomínio do contexto; isso aqui é só o filtro extra dentro do tenant
  // (moradores só veem as próprias solicitações, admin vê todas).
  moradorId?: string;
  status?: SolicitacaoStatus;
  categoria?: SolicitacaoCategoria;
  search?: string;
  dataInicio?: string;
  dataFim?: string;
  sortColumn: string; // já resolvido via allowlist no controller — nunca vem cru do cliente
  sortOrder: 'ASC' | 'DESC';
  limit: number;
  offset: number;
}

export interface ListSolicitacoesResult {
  items: Solicitacao[];
  total: number;
}

export async function listSolicitacoes(
  ctx: TenantContext,
  filter: ListSolicitacoesFilter
): Promise<ListSolicitacoesResult> {
  return withTenantContext(ctx, async (client) => {
    const clauses: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    if (filter.moradorId) {
      clauses.push(`morador_id = $${i++}`);
      params.push(filter.moradorId);
    }
    if (filter.status) {
      clauses.push(`status = $${i++}`);
      params.push(filter.status);
    }
    if (filter.categoria) {
      clauses.push(`categoria = $${i++}`);
      params.push(filter.categoria);
    }
    if (filter.search) {
      clauses.push(`(titulo ILIKE $${i} OR descricao ILIKE $${i})`);
      params.push(`%${filter.search}%`);
      i++;
    }
    if (filter.dataInicio) {
      clauses.push(`data_criacao >= $${i++}`);
      params.push(filter.dataInicio);
    }
    if (filter.dataFim) {
      clauses.push(`data_criacao < ($${i++}::date + interval '1 day')`);
      params.push(filter.dataFim);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    params.push(filter.limit, filter.offset);

    const result = await client.query<Solicitacao & { total_count: string }>(
      `SELECT *, COUNT(*) OVER() AS total_count FROM solicitacoes ${where}
       ORDER BY ${filter.sortColumn} ${filter.sortOrder}
       LIMIT $${i++} OFFSET $${i++}`,
      params
    );

    const total = result.rows[0] ? Number(result.rows[0].total_count) : 0;
    const items = result.rows.map(({ total_count, ...row }) => row);
    return { items, total };
  });
}

export async function findSolicitacaoById(ctx: TenantContext, id: string): Promise<Solicitacao | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Solicitacao>('SELECT * FROM solicitacoes WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  });
}

export interface UpdateSolicitacaoInput {
  status?: SolicitacaoStatus;
  prioridade?: SolicitacaoPrioridade;
  assignedTo?: string | null;
}

export async function updateSolicitacao(
  ctx: TenantContext,
  id: string,
  input: UpdateSolicitacaoInput
): Promise<Solicitacao | null> {
  return withTenantContext(ctx, async (client) => {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.status !== undefined) {
      sets.push(`status = $${idx++}`);
      values.push(input.status);
      // Reabrir uma solicitação (tirar de "resolvido") limpa a data de resolução; resolver agora seta.
      sets.push(`data_resolvimento = ${input.status === 'resolvido' ? 'now()' : 'NULL'}`);
    }
    if (input.prioridade !== undefined) {
      sets.push(`prioridade = $${idx++}`);
      values.push(input.prioridade);
    }
    if (input.assignedTo !== undefined) {
      sets.push(`assigned_to = $${idx++}`);
      values.push(input.assignedTo);
    }

    if (sets.length === 0) {
      const result = await client.query<Solicitacao>('SELECT * FROM solicitacoes WHERE id = $1', [id]);
      return result.rows[0] ?? null;
    }

    values.push(id);
    const result = await client.query<Solicitacao>(
      `UPDATE solicitacoes SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] ?? null;
  });
}
