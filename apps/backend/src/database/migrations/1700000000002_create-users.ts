import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('users', {
    // Mesmo id do usuário no Supabase Auth (auth.users) — identidade e senha são gerenciadas lá, esta tabela guarda só o perfil/dados de negócio.
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      references: '"auth"."users"',
      onDelete: 'CASCADE',
    },
    condominio_id: {
      type: 'uuid',
      notNull: true,
      references: 'condominios',
      onDelete: 'CASCADE',
    },
    email: { type: 'text', notNull: true },
    nome: { type: 'text', notNull: true },
    apto: { type: 'text' },
    telefone: { type: 'text' },
    role: {
      type: 'text',
      notNull: true,
      check: "role IN ('morador', 'admin', 'porteiro')",
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('users', 'condominio_id');
  pgm.createIndex('users', 'role');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('users');
}
