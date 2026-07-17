import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não definida. Confira o .env (ver .env.example).');
}

if (!process.env.APP_DATABASE_URL) {
  throw new Error('APP_DATABASE_URL não definida. Confira o .env (ver .env.example).');
}

// Role "postgres" — privilegiada, ignora Row Level Security. Só pra operações de superadmin
// (cross-tenant por natureza) e scripts internos (seed). Nunca usar pra servir uma request de um
// morador/admin/porteiro comum.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Role "app_user" — restrita, sem BYPASSRLS. Toda query tenant-scoped da API passa por aqui,
// sempre dentro de withTenantContext (ver ./tenantContext.ts) pra RLS aplicar de verdade.
export const appPool = new Pool({
  connectionString: process.env.APP_DATABASE_URL,
});
