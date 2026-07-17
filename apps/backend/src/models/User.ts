import { withTenantContext } from '../database/tenantContext';

export type UserRole = 'morador' | 'admin' | 'porteiro' | 'superadmin';

export interface User {
  id: string;
  // null só para role = 'superadmin' — gerencia a plataforma inteira, não pertence a um condomínio.
  condominio_id: string | null;
  email: string;
  nome: string;
  apto: string | null;
  telefone: string | null;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  id: string;
  condominioId: string | null;
  email: string;
  nome: string;
  apto?: string;
  telefone?: string;
  role: UserRole;
}

// Self-lookup (RLS libera independente do condominio_id — ver policy "tenant_isolation" em users).
// Usado no bootstrap de identidade (authenticate) e nas respostas de register/login/refresh/me,
// onde só conhecemos o id do usuário autenticado, ainda não o condominio_id dele.
export async function findUserById(id: string): Promise<User | null> {
  return withTenantContext({ userId: id, condominioId: null }, async (client) => {
    const result = await client.query<User>('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  });
}

export async function createUser(input: CreateUserInput): Promise<User> {
  return withTenantContext({ userId: input.id, condominioId: input.condominioId }, async (client) => {
    const result = await client.query<User>(
      `INSERT INTO users (id, condominio_id, email, nome, apto, telefone, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [input.id, input.condominioId, input.email, input.nome, input.apto ?? null, input.telefone ?? null, input.role]
    );
    return result.rows[0];
  });
}
