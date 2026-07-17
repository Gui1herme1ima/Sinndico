import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('reservas', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    condominio_id: { type: 'uuid', notNull: true, references: 'condominios', onDelete: 'CASCADE' },
    area_comum_id: { type: 'uuid', notNull: true, references: 'areas_comuns', onDelete: 'CASCADE' },
    morador_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    hora_inicio: { type: 'timestamptz', notNull: true },
    hora_fim: { type: 'timestamptz', notNull: true },
    status: {
      type: 'text',
      notNull: true,
      default: 'pendente',
      check: "status IN ('pendente', 'aprovada', 'cancelada')",
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('reservas', 'condominio_id');
  pgm.createIndex('reservas', 'area_comum_id');
  pgm.createIndex('reservas', 'morador_id');

  pgm.sql('ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;');
  pgm.sql(`
    CREATE POLICY tenant_isolation ON reservas
    USING (condominio_id = NULLIF(current_setting('app.condominio_id', true), '')::uuid)
    WITH CHECK (condominio_id = NULLIF(current_setting('app.condominio_id', true), '')::uuid);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('reservas');
}
