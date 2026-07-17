import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('comunicados', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    condominio_id: { type: 'uuid', notNull: true, references: 'condominios', onDelete: 'CASCADE' },
    admin_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    titulo: { type: 'text', notNull: true },
    conteudo: { type: 'text', notNull: true },
    data_criacao: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('comunicados', 'condominio_id');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('comunicados');
}
