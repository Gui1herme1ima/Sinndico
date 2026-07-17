import 'dotenv/config';

import { appPool, pool } from '../connection';
import { createUser } from '../../models/User';
import { supabaseAdmin } from '../../services/supabaseClient';

// Não existe endpoint público de auto-registro pra superadmin (gerencia a plataforma inteira, entre
// todos os condomínios) — a primeira conta precisa ser criada por aqui. Rode com:
// SUPERADMIN_EMAIL=voce@sinndico.com SUPERADMIN_PASSWORD=senha-forte npm run seed:superadmin
async function main() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Defina SUPERADMIN_EMAIL e SUPERADMIN_PASSWORD antes de rodar este script.');
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND role = $2', [email, 'superadmin']);
  if (existing.rows[0]) {
    console.log('Já existe um superadmin com este e-mail:', existing.rows[0]);
    return;
  }

  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !created.user) {
    throw new Error(error?.message ?? 'Não foi possível criar o usuário no Supabase Auth');
  }

  const user = await createUser({
    id: created.user.id,
    condominioId: null,
    username: email.split('@')[0],
    email,
    nome: 'Superadmin',
    role: 'superadmin',
  });

  console.log('Superadmin criado:', { id: user.id, email: user.email });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => Promise.all([pool.end(), appPool.end()]));
