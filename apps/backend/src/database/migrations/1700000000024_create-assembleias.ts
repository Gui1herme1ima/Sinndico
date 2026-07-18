import { MigrationBuilder } from 'node-pg-migrate';

// Retoma a Fase 3 antiga (pausada desde a Session 25 pra priorizar a reformulação de acesso).
// Schema já definido no README — admin convoca (status planejada), abre votação (em-votacao),
// encerra (encerrada); transições lineares, só pra frente, validadas no controller.
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('assembleias', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    condominio_id: { type: 'uuid', notNull: true, references: 'condominios', onDelete: 'CASCADE' },
    titulo: { type: 'text', notNull: true },
    data: { type: 'timestamptz', notNull: true },
    descricao: { type: 'text' },
    pauta: { type: 'text' },
    status: {
      type: 'text',
      notNull: true,
      default: 'planejada',
      check: "status IN ('planejada', 'em-votacao', 'encerrada')",
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('assembleias', 'condominio_id');

  pgm.sql('ALTER TABLE assembleias ENABLE ROW LEVEL SECURITY;');
  pgm.sql(`
    CREATE POLICY tenant_isolation ON assembleias
    USING (condominio_id = NULLIF(current_setting('app.condominio_id', true), '')::uuid)
    WITH CHECK (condominio_id = NULLIF(current_setting('app.condominio_id', true), '')::uuid);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('assembleias');
}
