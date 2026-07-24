import { TenantContext, withTenantContext } from '../database/tenantContext';

export type SetorTipo = 'bloco' | 'rua' | 'quadra' | 'torre' | 'outro';

export interface Setor {
  id: string;
  condominio_id: string;
  nome: string;
  tipo: SetorTipo;
  created_at: Date;
}

export interface SetorComContagem extends Setor {
  residencias_count: number;
  moradores_count: number;
}

export interface CreateSetorInput {
  condominioId: string;
  nome: string;
  tipo: SetorTipo;
}

export interface UpdateSetorInput {
  nome: string;
  tipo: SetorTipo;
}

export async function createSetor(ctx: TenantContext, input: CreateSetorInput): Promise<Setor> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Setor>(
      `INSERT INTO setores (condominio_id, nome, tipo) VALUES ($1, $2, $3) RETURNING *`,
      [input.condominioId, input.nome, input.tipo]
    );
    return result.rows[0];
  });
}

export async function findConflictingSetor(
  ctx: TenantContext,
  nome: string,
  excluirId?: string
): Promise<Setor | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Setor>(
      `SELECT * FROM setores WHERE nome = $1 AND ($2::uuid IS NULL OR id <> $2)`,
      [nome, excluirId ?? null]
    );
    return result.rows[0] ?? null;
  });
}

export async function listSetores(ctx: TenantContext): Promise<SetorComContagem[]> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<SetorComContagem>(
      `SELECT s.*,
              COUNT(DISTINCT r.id) AS residencias_count,
              COUNT(DISTINCT u.id) AS moradores_count
       FROM setores s
       LEFT JOIN residencias r ON r.setor_id = s.id
       LEFT JOIN users u ON u.residencia_id = r.id
       GROUP BY s.id
       ORDER BY s.nome`
    );
    return result.rows;
  });
}

export async function findSetorById(ctx: TenantContext, id: string): Promise<Setor | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Setor>('SELECT * FROM setores WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  });
}

export async function updateSetor(
  ctx: TenantContext,
  id: string,
  input: UpdateSetorInput
): Promise<Setor | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Setor>(
      `UPDATE setores SET nome = $1, tipo = $2 WHERE id = $3 RETURNING *`,
      [input.nome, input.tipo, id]
    );
    return result.rows[0] ?? null;
  });
}
