import 'dotenv/config';
import { pool } from '../connection';

async function main() {
  const existing = await pool.query('SELECT id, nome FROM condominios LIMIT 1');
  if (existing.rows[0]) {
    console.log('Condomínio de teste já existe:', existing.rows[0]);
    return;
  }

  const result = await pool.query(
    "INSERT INTO condominios (nome) VALUES ('Condomínio de Teste') RETURNING id, nome"
  );
  console.log('Condomínio de teste criado:', result.rows[0]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
