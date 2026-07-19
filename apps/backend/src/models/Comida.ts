import { TenantContext, withTenantContext } from '../database/tenantContext';

export type ComidaStatus = 'pedido-feito' | 'em-caminho' | 'chegou' | 'retirada';

export interface Comida {
  id: string;
  condominio_id: string;
  morador_id: string;
  restaurante: string;
  horario_chegada_estimada: Date;
  status: ComidaStatus;
  notificacao_portaria_enviada: boolean;
  created_at: Date;
}

export interface CreateComidaInput {
  condominioId: string;
  moradorId: string;
  restaurante: string;
  horarioChegadaEstimada: string;
}

export async function createComida(ctx: TenantContext, input: CreateComidaInput): Promise<Comida> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Comida>(
      `INSERT INTO comida (condominio_id, morador_id, restaurante, horario_chegada_estimada, notificacao_portaria_enviada)
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
      [input.condominioId, input.moradorId, input.restaurante, input.horarioChegadaEstimada]
    );
    return result.rows[0];
  });
}

export interface ListComidaFilter {
  // RLS já restringe ao condomínio do contexto; isso aqui é só o filtro extra dentro do tenant
  // (moradores só veem os próprios pedidos; admin/porteiro veem todos).
  moradorId?: string;
  status?: ComidaStatus;
  search?: string;
  sortColumn: string; // já resolvido via allowlist no controller — nunca vem cru do cliente
  sortOrder: 'ASC' | 'DESC';
  limit: number;
  offset: number;
}

export interface ListComidaResult {
  items: Comida[];
  total: number;
}

export async function listComida(ctx: TenantContext, filter: ListComidaFilter): Promise<ListComidaResult> {
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
      clauses.push(`restaurante ILIKE $${i++}`);
      params.push(`%${filter.search}%`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    params.push(filter.limit, filter.offset);

    const result = await client.query<Comida & { total_count: string }>(
      `SELECT *, COUNT(*) OVER() AS total_count FROM comida ${where}
       ORDER BY ${filter.sortColumn} ${filter.sortOrder}
       LIMIT $${i++} OFFSET $${i++}`,
      params
    );

    const total = result.rows[0] ? Number(result.rows[0].total_count) : 0;
    const items = result.rows.map(({ total_count, ...row }) => row);
    return { items, total };
  });
}

export async function findComidaById(ctx: TenantContext, id: string): Promise<Comida | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Comida>('SELECT * FROM comida WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  });
}

// restrictToMoradorId: quando informado, o próprio UPDATE filtra por dono (uso do morador setando
// em-caminho/retirada); sem ele, atualiza por id sem restrição de dono (uso do porteiro/admin
// setando chegou) — RLS já garante o isolamento por tenant nos dois casos.
export async function updateComidaStatus(
  ctx: TenantContext,
  id: string,
  status: Exclude<ComidaStatus, 'pedido-feito'>,
  restrictToMoradorId?: string
): Promise<Comida | null> {
  return withTenantContext(ctx, async (client) => {
    if (restrictToMoradorId) {
      const result = await client.query<Comida>(
        'UPDATE comida SET status = $1 WHERE id = $2 AND morador_id = $3 RETURNING *',
        [status, id, restrictToMoradorId]
      );
      return result.rows[0] ?? null;
    }
    const result = await client.query<Comida>(
      'UPDATE comida SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] ?? null;
  });
}
