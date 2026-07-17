import 'dotenv/config';

import { appPool, pool } from '../connection';
import { createUser } from '../../models/User';
import { supabaseAdmin } from '../../services/supabaseClient';

// Não existe endpoint público de auto-registro pra porteiro (só morador/admin no /register) — contas
// de porteiro são criadas manualmente pelo síndico/administradora. Rode com:
// PORTEIRO_EMAIL=voce@sinndico.com PORTEIRO_PASSWORD=senha-forte PORTEIRO_CONDOMINIO_ID=uuid npm run seed:porteiro
async function main() {
  const email = process.env.PORTEIRO_EMAIL;
  const password = process.env.PORTEIRO_PASSWORD;
  const condominioId = process.env.PORTEIRO_CONDOMINIO_ID;
  const nome = process.env.PORTEIRO_NOME ?? 'Porteiro';

  if (!email || !password || !condominioId) {
    throw new Error(
      'Defina PORTEIRO_EMAIL, PORTEIRO_PASSWORD e PORTEIRO_CONDOMINIO_ID antes de rodar este script.'
    );
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND role = $2', [email, 'porteiro']);
  if (existing.rows[0]) {
    console.log('Já existe um porteiro com este e-mail:', existing.rows[0]);
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
    condominioId,
    email,
    nome,
    role: 'porteiro',
  });

  console.log('Porteiro criado:', { id: user.id, email: user.email, condominioId: user.condominio_id });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => Promise.all([pool.end(), appPool.end()]));
