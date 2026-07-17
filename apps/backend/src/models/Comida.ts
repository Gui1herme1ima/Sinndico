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
}

export async function listComida(ctx: TenantContext, filter: ListComidaFilter): Promise<Comida[]> {
  return withTenantContext(ctx, async (client) => {
    if (filter.moradorId) {
      const result = await client.query<Comida>(
        'SELECT * FROM comida WHERE morador_id = $1 ORDER BY created_at DESC',
        [filter.moradorId]
      );
      return result.rows;
    }
    const result = await client.query<Comida>('SELECT * FROM comida ORDER BY created_at DESC');
    return result.rows;
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
