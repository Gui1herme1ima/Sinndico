import { MigrationBuilder } from 'node-pg-migrate';

// Login por username OU e-mail (pedido do usuário): todo usuário ganha um `username`, único
// GLOBALMENTE (não só por tenant) — motivo: quando uma conta de admin/porteiro não tem e-mail real, o
// backend sintetiza `<username>@staff.sinndico.internal` só pra satisfazer a exigência do Supabase
// Auth de um e-mail por conta, e esse e-mail sintético precisa ser único no projeto inteiro, então o
// username que o gera também precisa ser. `email` deixa de ser obrigatório (só morador precisa, e essa
// regra fica na camada de aplicação/Zod, não em CHECK de banco).
//
// Backfill pras linhas de teste já existentes: username derivado da parte antes do "@" do e-mail
// atual, com sufixo numérico em caso de colisão (duas contas que só diferem no domínio do e-mail).
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn('users', {
    username: { type: 'text' },
  });

  pgm.sql(`
    WITH candidatos AS (
      SELECT
        id,
        CASE
          WHEN row_number() OVER (PARTITION BY split_part(email, '@', 1) ORDER BY created_at) = 1
            THEN split_part(email, '@', 1)
          ELSE split_part(email, '@', 1) || '_' || row_number() OVER (PARTITION BY split_part(email, '@', 1) ORDER BY created_at)
        END AS username
      FROM users
    )
    UPDATE users u
    SET username = candidatos.username
    FROM candidatos
    WHERE u.id = candidatos.id AND u.username IS NULL;
  `);

  pgm.alterColumn('users', 'username', { notNull: true });
  pgm.addConstraint('users', 'users_username_unique', 'UNIQUE (username)');

  pgm.alterColumn('users', 'email', { notNull: false });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.alterColumn('users', 'email', { notNull: true });
  pgm.dropConstraint('users', 'users_username_unique');
  pgm.dropColumn('users', 'username');
}
