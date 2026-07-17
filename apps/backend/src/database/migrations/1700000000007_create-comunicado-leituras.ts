import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(
    'comunicado_leituras',
    {
      comunicado_id: { type: 'uuid', notNull: true, references: 'comunicados', onDelete: 'CASCADE' },
      user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
      lido_em: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    },
    {
      constraints: {
        primaryKey: ['comunicado_id', 'user_id'],
      },
    }
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('comunicado_leituras');
}
