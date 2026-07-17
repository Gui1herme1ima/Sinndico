import { pool } from '../database/connection';

export type UserRole = 'morador' | 'admin' | 'porteiro';

export interface User {
  id: string;
  condominio_id: string;
  email: string;
  nome: string;
  apto: string | null;
  telefone: string | null;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await pool.query<User>('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}

export interface CreateUserInput {
  id: string;
  condominioId: string;
  email: string;
  nome: string;
  apto?: string;
  telefone?: string;
  role: 'morador' | 'admin';
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const result = await pool.query<User>(
    `INSERT INTO users (id, condominio_id, email, nome, apto, telefone, role)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      input.id,
      input.condominioId,
      input.email,
      input.nome,
      input.apto ?? null,
      input.telefone ?? null,
      input.role,
    ]
  );
  return result.rows[0];
}
