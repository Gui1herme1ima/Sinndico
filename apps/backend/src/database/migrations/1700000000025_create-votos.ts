import { MigrationBuilder } from 'node-pg-migrate';

// votos não tem condominio_id próprio (mesmo caso de comunicado_leituras) — isola via join com
// assembleias. UNIQUE (assembleia_id, morador_id) é a rede de segurança contra voto duplicado; o
// caminho principal de UX é uma checagem explícita no controller antes do insert (409, não deixa a
// constraint estourar genérico).
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('votos', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    assembleia_id: { type: 'uuid', notNull: true, references: 'assembleias', onDelete: 'CASCADE' },
    morador_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    voto: { type: 'text', notNull: true, check: "voto IN ('sim', 'nao', 'abstencao')" },
    timestamp: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('votos', 'assembleia_id');
  pgm.addConstraint('votos', 'votos_assembleia_morador_unique', {
    unique: ['assembleia_id', 'morador_id'],
  });

  pgm.sql('ALTER TABLE votos ENABLE ROW LEVEL SECURITY;');
  pgm.sql(`
    CREATE POLICY tenant_isolation ON votos
    USING (
      EXISTS (
        SELECT 1 FROM assembleias a
        WHERE a.id = votos.assembleia_id
        AND a.condominio_id = NULLIF(current_setting('app.condominio_id', true), '')::uuid
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM assembleias a
        WHERE a.id = votos.assembleia_id
        AND a.condominio_id = NULLIF(current_setting('app.condominio_id', true), '')::uuid
      )
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('votos');
}
