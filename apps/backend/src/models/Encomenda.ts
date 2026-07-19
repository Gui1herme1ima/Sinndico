import { TenantContext, withTenantContext } from '../database/tenantContext';

export type EncomendaStatus = 'aguardando' | 'retirada';

export interface Encomenda {
  id: string;
  condominio_id: string;
  morador_id: string;
  porteiro_id: string;
  descricao: string | null;
  horario_chegada: Date;
  foto_url: string | null;
  assinado: boolean;
  data_assinatura: Date | null;
  status: EncomendaStatus;
}

export interface CreateEncomendaInput {
  condominioId: string;
  moradorId: string;
  porteiroId: string;
  descricao?: string;
  fotoUrl?: string;
}

export async function createEncomenda(ctx: TenantContext, input: CreateEncomendaInput): Promise<Encomenda> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Encomenda>(
      `INSERT INTO encomendas (condominio_id, morador_id, porteiro_id, descricao, foto_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [input.condominioId, input.moradorId, input.porteiroId, input.descricao ?? null, input.fotoUrl ?? null]
    );
    return result.rows[0];
  });
}

export interface ListEncomendasFilter {
  // RLS já restringe ao condomínio do contexto; isso aqui é só o filtro extra dentro do tenant
  // (moradores só veem as próprias encomendas; porteiro/admin veem todas).
  moradorId?: string;
  status?: EncomendaStatus;
  search?: string;
  dataInicio?: string;
  dataFim?: string;
  sortColumn: string; // já resolvido via allowlist no controller — nunca vem cru do cliente
  sortOrder: 'ASC' | 'DESC';
  limit: number;
  offset: number;
}

export interface ListEncomendasResult {
  items: Encomenda[];
  total: number;
}

export async function listEncomendas(ctx: TenantContext, filter: ListEncomendasFilter): Promise<ListEncomendasResult> {
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
    if (filter.search) {
      clauses.push(`descricao ILIKE $${i++}`);
      params.push(`%${filter.search}%`);
    }
    if (filter.dataInicio) {
      clauses.push(`horario_chegada >= $${i++}`);
      params.push(filter.dataInicio);
    }
    if (filter.dataFim) {
      clauses.push(`horario_chegada < ($${i++}::date + interval '1 day')`);
      params.push(filter.dataFim);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    params.push(filter.limit, filter.offset);

    const result = await client.query<Encomenda & { total_count: string }>(
      `SELECT *, COUNT(*) OVER() AS total_count FROM encomendas ${where}
       ORDER BY ${filter.sortColumn} ${filter.sortOrder}
       LIMIT $${i++} OFFSET $${i++}`,
      params
    );

    const total = result.rows[0] ? Number(result.rows[0].total_count) : 0;
    const items = result.rows.map(({ total_count, ...row }) => row);
    return { items, total };
  });
}

export async function findEncomendaById(ctx: TenantContext, id: string): Promise<Encomenda | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Encomenda>('SELECT * FROM encomendas WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  });
}

// Assinatura digital: só o próprio morador dono da encomenda pode assinar (WHERE morador_id = $2
// garante isso a nível de query — se não bater, não atualiza nada e retorna null).
export async function signEncomenda(ctx: TenantContext, id: string, moradorId: string): Promise<Encomenda | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Encomenda>(
      `UPDATE encomendas
       SET assinado = true, data_assinatura = now(), status = 'retirada'
       WHERE id = $1 AND morador_id = $2
       RETURNING *`,
      [id, moradorId]
    );
    return result.rows[0] ?? null;
  });
}
