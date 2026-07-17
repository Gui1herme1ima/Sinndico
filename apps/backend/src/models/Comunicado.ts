import { TenantContext, withTenantContext } from '../database/tenantContext';

export interface Comunicado {
  id: string;
  condominio_id: string;
  admin_id: string;
  titulo: string;
  conteudo: string;
  data_criacao: Date;
  // Calculado via LEFT JOIN com comunicado_leituras pro usuário do contexto atual — não é coluna
  // da tabela comunicados.
  lido: boolean;
}

export interface CreateComunicadoInput {
  condominioId: string;
  adminId: string;
  titulo: string;
  conteudo: string;
}

export async function createComunicado(ctx: TenantContext, input: CreateComunicadoInput): Promise<Comunicado> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query(
      `INSERT INTO comunicados (condominio_id, admin_id, titulo, conteudo)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.condominioId, input.adminId, input.titulo, input.conteudo]
    );
    return { ...result.rows[0], lido: false };
  });
}

export async function listComunicados(ctx: TenantContext, userId: string): Promise<Comunicado[]> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Comunicado>(
      `SELECT c.*, (cl.user_id IS NOT NULL) AS lido
       FROM comunicados c
       LEFT JOIN comunicado_leituras cl ON cl.comunicado_id = c.id AND cl.user_id = $1
       ORDER BY c.data_criacao DESC`,
      [userId]
    );
    return result.rows;
  });
}

export async function findComunicadoById(ctx: TenantContext, id: string, userId: string): Promise<Comunicado | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Comunicado>(
      `SELECT c.*, (cl.user_id IS NOT NULL) AS lido
       FROM comunicados c
       LEFT JOIN comunicado_leituras cl ON cl.comunicado_id = c.id AND cl.user_id = $2
       WHERE c.id = $1`,
      [id, userId]
    );
    return result.rows[0] ?? null;
  });
}

// Idempotente: se já tiver lido, não faz nada (ON CONFLICT DO NOTHING na PK composta).
export async function markComunicadoAsRead(ctx: TenantContext, comunicadoId: string, userId: string): Promise<void> {
  return withTenantContext(ctx, async (client) => {
    await client.query(
      `INSERT INTO comunicado_leituras (comunicado_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [comunicadoId, userId]
    );
  });
}
