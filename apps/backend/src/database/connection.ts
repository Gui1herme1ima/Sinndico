import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não definida. Confira o .env (ver .env.example).');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
