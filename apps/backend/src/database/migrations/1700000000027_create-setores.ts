import { MigrationBuilder } from 'node-pg-migrate';

// Fatia 4.10.1: entidade de agrupamento de residências (Bloco, Rua, Quadra, Torre, Outro).
// "Setor" e não "Área" para não colidir com o módulo já existente "Áreas comuns".
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('setores', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    condominio_id: { type: 'uuid', notNull: true, references: 'condominios', onDelete: 'CASCADE' },
    nome: { type: 'text', notNull: true },
    tipo: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.sql(`
    ALTER TABLE setores
    ADD CONSTRAINT setores_tipo_check
    CHECK (tipo IN ('bloco', 'rua', 'quadra', 'torre', 'outro'));
  `);

  pgm.createIndex('setores', 'condominio_id');
  pgm.createIndex('setores', ['condominio_id', 'nome'], { unique: true });

  pgm.sql('ALTER TABLE setores ENABLE ROW LEVEL SECURITY;');
  pgm.sql(`
    CREATE POLICY tenant_isolation ON setores
    USING (condominio_id = NULLIF(current_setting('app.condominio_id', true), '')::uuid)
    WITH CHECK (condominio_id = NULLIF(current_setting('app.condominio_id', true), '')::uuid);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('setores');
}
