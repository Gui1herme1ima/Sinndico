import { pool } from '../database/connection';
import { TenantContext, withTenantContext } from '../database/tenantContext';

export type UserRole = 'morador' | 'admin' | 'porteiro' | 'superadmin';

// Domínio usado só como identificador técnico do Supabase Auth (que exige e-mail único por conta) —
// nunca exibido/enviado a ninguém. Só existe pra contas de admin/porteiro criadas sem e-mail real.
const SYNTHETIC_EMAIL_DOMAIN = 'staff.sinndico.internal';

export function syntheticEmailFor(username: string): string {
  return `${username}@${SYNTHETIC_EMAIL_DOMAIN}`;
}

export interface User {
  id: string;
  // null só para role = 'superadmin' — gerencia a plataforma inteira, não pertence a um condomínio.
  condominio_id: string | null;
  // null quando a conta (admin/porteiro) foi criada sem e-mail real — nesse caso o Supabase Auth
  // guarda um e-mail sintético (ver syntheticEmailFor), nunca espelhado aqui.
  email: string | null;
  username: string;
  nome: string;
  apto: string | null;
  telefone: string | null;
  role: UserRole;
  // obrigatório (CHECK NOT VALID) pra role = 'morador' daqui pra frente; null pra admin/porteiro/
  // superadmin e pra moradores de teste criados antes da Fatia 3 existir (ver migration 22).
  residencia_id: string | null;
  senha_temporaria: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  id: string;
  condominioId: string | null;
  username: string;
  email?: string | null;
  nome: string;
  apto?: string;
  telefone?: string;
  role: UserRole;
  residenciaId?: string | null;
  senhaTemporaria?: boolean;
}

// Resumo de residência embutido na listagem de usuários (Moradores), pra tela não precisar de uma
// segunda chamada só pra saber a unidade de cada morador.
export interface UserComResidencia extends User {
  residencia_bloco: string | null;
  residencia_rua: string | null;
  residencia_numero: string | null;
}

export interface UpdateUserInput {
  nome?: string;
  telefone?: string | null;
  residenciaId?: string | null;
}

// Self-lookup (RLS libera independente do condominio_id — ver policy "tenant_isolation" em users).
// Usado no bootstrap de identidade (authenticate) e nas respostas de login/refresh/me,
// onde só conhecemos o id do usuário autenticado, ainda não o condominio_id dele.
export async function findUserById(id: string): Promise<User | null> {
  return withTenantContext({ userId: id, condominioId: null }, async (client) => {
    const result = await client.query<User>('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  });
}

// Lookup de outro usuário dentro do próprio tenant (ex.: porteiro validando o morador_id de uma
// encomenda). Diferente de findUserById: usa o contexto de quem está pedindo (ctx), não o id alvo
// como se fosse self-lookup — a policy libera porque ambos têm o mesmo condominio_id.
export async function findUserByIdForTenant(ctx: TenantContext, id: string): Promise<User | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<User>('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  });
}

// Lookup por username pra resolver login: acontece ANTES de qualquer autenticação (não sabemos ainda
// o id nem o condominio_id de ninguém — é exatamente o que este lookup existe pra resolver), então usa
// o pool privilegiado direto, bypassando RLS de propósito. Mesma justificativa do model Condominio.ts
// pra operações cross-tenant do superadmin: não há como fazer esse lookup dentro de um tenant context
// que ainda não existe.
export async function findUserByUsername(username: string): Promise<User | null> {
  const result = await pool.query<User>('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0] ?? null;
}

// Usado pelo gatilho de notificação do chat: quando um morador escreve, notifica todos os admins
// do mesmo condomínio (não tem um "admin dono da conversa" fixo).
export async function listAdminIdsForTenant(ctx: TenantContext): Promise<string[]> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<{ id: string }>("SELECT id FROM users WHERE role = 'admin'");
    return result.rows.map((r) => r.id);
  });
}

// Usado pelo gatilho de notificação de novo pedido de comida: avisa todos os porteiros do
// condomínio (não tem um "porteiro dono do portão" fixo), mesmo espírito de listAdminIdsForTenant.
export async function listPorteiroIdsForTenant(ctx: TenantContext): Promise<string[]> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<{ id: string }>("SELECT id FROM users WHERE role = 'porteiro'");
    return result.rows.map((r) => r.id);
  });
}

export async function createUser(input: CreateUserInput): Promise<User> {
  return withTenantContext({ userId: input.id, condominioId: input.condominioId }, async (client) => {
    const result = await client.query<User>(
      `INSERT INTO users (id, condominio_id, email, username, nome, apto, telefone, role, residencia_id, senha_temporaria)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        input.id,
        input.condominioId,
        input.email ?? null,
        input.username,
        input.nome,
        input.apto ?? null,
        input.telefone ?? null,
        input.role,
        input.residenciaId ?? null,
        input.senhaTemporaria ?? false,
      ]
    );
    return result.rows[0];
  });
}

export async function setSenhaTemporaria(ctx: TenantContext, id: string, value: boolean): Promise<void> {
  await withTenantContext(ctx, async (client) => {
    await client.query('UPDATE users SET senha_temporaria = $1 WHERE id = $2', [value, id]);
  });
}

// Listagem completa (não só ids, ao contrário de listAdminIdsForTenant/listPorteiroIdsForTenant) —
// usada pelas telas de Moradores/Equipe. LEFT JOIN com residencias pra Moradores não precisar de uma
// segunda chamada só pra saber a unidade de cada um; para admin/porteiro os 3 campos vêm null.
export async function listUsersForTenant(ctx: TenantContext, roles?: UserRole[]): Promise<UserComResidencia[]> {
  return withTenantContext(ctx, async (client) => {
    const where = roles && roles.length > 0 ? 'WHERE u.role = ANY($1)' : '';
    const params = roles && roles.length > 0 ? [roles] : [];
    const result = await client.query<UserComResidencia>(
      `SELECT u.*, r.bloco AS residencia_bloco, r.rua AS residencia_rua, r.numero AS residencia_numero
       FROM users u
       LEFT JOIN residencias r ON r.id = u.residencia_id
       ${where}
       ORDER BY u.nome`,
      params
    );
    return result.rows;
  });
}

export async function updateUser(ctx: TenantContext, id: string, input: UpdateUserInput): Promise<User | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<User>(
      `UPDATE users SET
         nome = COALESCE($1, nome),
         telefone = COALESCE($2, telefone),
         residencia_id = COALESCE($3, residencia_id)
       WHERE id = $4
       RETURNING *`,
      [input.nome ?? null, input.telefone ?? null, input.residenciaId ?? null, id]
    );
    return result.rows[0] ?? null;
  });
}
