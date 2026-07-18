import { pool } from '../database/connection';

// Diferente de todo outro model deste projeto: superadmin não pertence a nenhum condomínio
// (condominio_id null), então withTenantContext/appPool nunca libera nada aqui — a policy de RLS em
// condominios é só `id = app.condominio_id`, e null nunca casa com nada. Por isso este model usa o
// pool privilegiado direto (ignora RLS de propósito), com authorize('superadmin') na rota como única
// porta de acesso. Mesma estratégia que os seeds (createSuperadmin.ts, run.ts) já usam.

export type TipoResidencia = 'apartamento' | 'casa';

export interface Condominio {
  id: string;
  nome: string;
  slug: string;
  endereco: string | null;
  contato_nome: string | null;
  contato_email: string | null;
  contato_telefone: string | null;
  tipo_residencia: TipoResidencia;
  // Fatia 5 (RBAC): controla se o porteiro deste condomínio acessa cada módulo — só restringe o
  // papel porteiro; admin/morador/superadmin nunca são afetados por essas flags.
  porteiro_acesso_encomendas: boolean;
  porteiro_acesso_visitantes: boolean;
  porteiro_acesso_comida: boolean;
  porteiro_acesso_comunicados: boolean;
  created_at: Date;
}

export interface PermissoesPorteiroInput {
  encomendas: boolean;
  visitantes: boolean;
  comida: boolean;
  comunicados: boolean;
}

export interface CondominioComContagem extends Condominio {
  total_usuarios: number;
}

export interface CreateCondominioInput {
  nome: string;
  slug: string;
  tipoResidencia: TipoResidencia;
  endereco?: string;
  contatoNome?: string;
  contatoEmail?: string;
  contatoTelefone?: string;
}

export async function createCondominio(input: CreateCondominioInput): Promise<Condominio> {
  const result = await pool.query<Condominio>(
    `INSERT INTO condominios (nome, slug, endereco, contato_nome, contato_email, contato_telefone, tipo_residencia)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      input.nome,
      input.slug,
      input.endereco ?? null,
      input.contatoNome ?? null,
      input.contatoEmail ?? null,
      input.contatoTelefone ?? null,
      input.tipoResidencia,
    ]
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

// Público (sem auth) — resolve o tenant a partir da URL (/<slug>/login) antes do login acontecer.
export async function findCondominioBySlug(slug: string): Promise<Condominio | null> {
  const result = await pool.query<Condominio>('SELECT * FROM condominios WHERE slug = $1', [slug]);
  return result.rows[0] ?? null;
}

export async function updateCondominioNome(id: string, nome: string): Promise<Condominio | null> {
  const result = await pool.query<Condominio>(
    'UPDATE condominios SET nome = $1 WHERE id = $2 RETURNING *',
    [nome, id]
  );
  return result.rows[0] ?? null;
}

export async function updateCondominioPermissoesPorteiro(
  id: string,
  input: PermissoesPorteiroInput
): Promise<Condominio | null> {
  const result = await pool.query<Condominio>(
    `UPDATE condominios SET
       porteiro_acesso_encomendas = $1,
       porteiro_acesso_visitantes = $2,
       porteiro_acesso_comida = $3,
       porteiro_acesso_comunicados = $4
     WHERE id = $5
     RETURNING *`,
    [input.encomendas, input.visitantes, input.comida, input.comunicados, id]
  );
  return result.rows[0] ?? null;
}
