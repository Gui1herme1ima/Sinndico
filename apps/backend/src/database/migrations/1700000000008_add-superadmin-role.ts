import { MigrationBuilder } from 'node-pg-migrate';

// Superadmin gerencia a plataforma inteira (todos os condomínios), então não pertence a nenhum
// condominio_id específico — por isso a coluna vira opcional, com uma constraint garantindo que só
// superadmin pode ter condominio_id nulo.
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.alterColumn('users', 'condominio_id', { notNull: false });

  pgm.dropConstraint('users', 'users_role_check');
  pgm.addConstraint('users', 'users_role_check', "CHECK (role IN ('morador', 'admin', 'porteiro', 'superadmin'))");

  pgm.addConstraint(
    'users',
    'users_superadmin_sem_condominio_check',
    `CHECK (
      (role = 'superadmin' AND condominio_id IS NULL)
      OR (role <> 'superadmin' AND condominio_id IS NOT NULL)
    )`
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropConstraint('users', 'users_superadmin_sem_condominio_check');
  pgm.dropConstraint('users', 'users_role_check');
  pgm.addConstraint('users', 'users_role_check', "CHECK (role IN ('morador', 'admin', 'porteiro'))");
  pgm.alterColumn('users', 'condominio_id', { notNull: true });
}
