import { TenantContext, withTenantContext } from '../database/tenantContext';

export type VisitanteStatus = 'aprovado' | 'bloqueado' | 'ativo';

export interface Visitante {
  id: string;
  condominio_id: string;
  morador_id: string;
  aprovado_por: string;
  nome_visitante: string;
  rg: string | null;
  placa_veiculo: string | null;
  data_visita: Date;
  hora_entrada: Date | null;
  hora_saida: Date | null;
  status: VisitanteStatus;
  created_at: Date;
}

export interface CreateVisitanteInput {
  condominioId: string;
  moradorId: string;
  aprovadoPor: string;
  nomeVisitante: string;
  rg?: string;
  placaVeiculo?: string;
  dataVisita: string;
}

export async function createVisitante(ctx: TenantContext, input: CreateVisitanteInput): Promise<Visitante> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Visitante>(
      `INSERT INTO visitantes (condominio_id, morador_id, aprovado_por, nome_visitante, rg, placa_veiculo, data_visita)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        input.condominioId,
        input.moradorId,
        input.aprovadoPor,
        input.nomeVisitante,
        input.rg ?? null,
        input.placaVeiculo ?? null,
        input.dataVisita,
      ]
    );
    return result.rows[0];
  });
}

export interface ListVisitantesFilter {
  // RLS já restringe ao condomínio do contexto; isso aqui é só o filtro extra dentro do tenant
  // (moradores só veem os próprios visitantes; admin/porteiro veem todos).
  moradorId?: string;
  status?: VisitanteStatus;
  search?: string;
  sortColumn: string; // já resolvido via allowlist no controller — nunca vem cru do cliente
  sortOrder: 'ASC' | 'DESC';
  limit: number;
  offset: number;
}

export interface ListVisitantesResult {
  items: Visitante[];
  total: number;
}

export async function listVisitantes(ctx: TenantContext, filter: ListVisitantesFilter): Promise<ListVisitantesResult> {
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
      clauses.push(`nome_visitante ILIKE $${i++}`);
      params.push(`%${filter.search}%`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    params.push(filter.limit, filter.offset);

    const result = await client.query<Visitante & { total_count: string }>(
      `SELECT *, COUNT(*) OVER() AS total_count FROM visitantes ${where}
       ORDER BY ${filter.sortColumn} ${filter.sortOrder}
       LIMIT $${i++} OFFSET $${i++}`,
      params
    );

    const total = result.rows[0] ? Number(result.rows[0].total_count) : 0;
    const items = result.rows.map(({ total_count, ...row }) => row);
    return { items, total };
  });
}

export async function findVisitanteById(ctx: TenantContext, id: string): Promise<Visitante | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Visitante>('SELECT * FROM visitantes WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  });
}

// A condição de status no próprio WHERE evita entrada fora de ordem (ex.: check-in duplicado ou de
// visitante bloqueado) — se não bater, RETURNING vem vazio e o controller trata como 400.
export async function registrarEntrada(ctx: TenantContext, id: string): Promise<Visitante | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Visitante>(
      `UPDATE visitantes SET hora_entrada = now(), status = 'ativo'
       WHERE id = $1 AND status = 'aprovado'
       RETURNING *`,
      [id]
    );
    return result.rows[0] ?? null;
  });
}

export async function registrarSaida(ctx: TenantContext, id: string): Promise<Visitante | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Visitante>(
      `UPDATE visitantes SET hora_saida = now()
       WHERE id = $1 AND status = 'ativo' AND hora_saida IS NULL
       RETURNING *`,
      [id]
    );
    return result.rows[0] ?? null;
  });
}

export async function updateVisitanteStatus(
  ctx: TenantContext,
  id: string,
  status: 'aprovado' | 'bloqueado'
): Promise<Visitante | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Visitante>(
      'UPDATE visitantes SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] ?? null;
  });
}
