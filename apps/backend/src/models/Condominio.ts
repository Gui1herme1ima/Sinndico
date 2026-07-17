import { pool } from '../database/connection';

// Diferente de todo outro model deste projeto: superadmin não pertence a nenhum condomínio
// (condominio_id null), então withTenantContext/appPool nunca libera nada aqui — a policy de RLS em
// condominios é só `id = app.condominio_id`, e null nunca casa com nada. Por isso este model usa o
// pool privilegiado direto (ignora RLS de propósito), com authorize('superadmin') na rota como única
// porta de acesso. Mesma estratégia que os seeds (createSuperadmin.ts, run.ts) já usam.

export interface Condominio {
  id: string;
  nome: string;
  created_at: Date;
}

export interface CondominioComContagem extends Condominio {
  total_usuarios: number;
}

export async function createCondominio(nome: string): Promise<Condominio> {
  const result = await pool.query<Condominio>(
    'INSERT INTO condominios (nome) VALUES ($1) RETURNING *',
    [nome]
  );
  return result.rows[0];
}

export async function listCondominios(): Promise<CondominioComContagem[]> {
  const result = await pool.query<CondominioComContagem>(
    `SELECT c.*, COUNT(u.id) AS total_usuarios
     FROM condominios c
     LEFT JOIN users u ON u.condominio_id = c.id
     GROUP BY c.id
     ORDER BY c.created_at DESC`
  );
  return result.rows;
}

export async function findCondominioById(id: string): Promise<CondominioComContagem | null> {
  const result = await pool.query<CondominioComContagem>(
    `SELECT c.*, COUNT(u.id) AS total_usuarios
     FROM condominios c
     LEFT JOIN users u ON u.condominio_id = c.id
     WHERE c.id = $1
     GROUP BY c.id`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function updateCondominioNome(id: string, nome: string): Promise<Condominio | null> {
  const result = await pool.query<Condominio>(
    'UPDATE condominios SET nome = $1 WHERE id = $2 RETURNING *',
    [nome, id]
  );
  return result.rows[0] ?? null;
}
