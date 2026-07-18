import { TenantContext, withTenantContext } from '../database/tenantContext';

export type AssembleiaStatus = 'planejada' | 'em-votacao' | 'encerrada';

export interface Assembleia {
  id: string;
  condominio_id: string;
  titulo: string;
  data: Date;
  descricao: string | null;
  pauta: string | null;
  status: AssembleiaStatus;
  created_at: Date;
}

export interface CreateAssembleiaInput {
  condominioId: string;
  titulo: string;
  data: string;
  descricao?: string;
  pauta?: string;
}

export async function createAssembleia(ctx: TenantContext, input: CreateAssembleiaInput): Promise<Assembleia> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Assembleia>(
      `INSERT INTO assembleias (condominio_id, titulo, data, descricao, pauta)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [input.condominioId, input.titulo, input.data, input.descricao ?? null, input.pauta ?? null]
    );
    return result.rows[0];
  });
}

export async function listAssembleias(ctx: TenantContext): Promise<Assembleia[]> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Assembleia>('SELECT * FROM assembleias ORDER BY data DESC');
    return result.rows;
  });
}

export async function findAssembleiaById(ctx: TenantContext, id: string): Promise<Assembleia | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Assembleia>('SELECT * FROM assembleias WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  });
}

export async function updateAssembleiaStatus(
  ctx: TenantContext,
  id: string,
  status: AssembleiaStatus
): Promise<Assembleia | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Assembleia>(
      'UPDATE assembleias SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] ?? null;
  });
}
