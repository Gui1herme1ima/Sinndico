import { MigrationBuilder } from 'node-pg-migrate';

// aprovado_por: quem autorizou o visitante — na criação é sempre o próprio morador (auto-aprovação,
// é o convidado dele), mas a coluna referencia users em geral pra permitir um admin aprovar/vouch
// numa ação futura (não implementada agora).
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('visitantes', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    condominio_id: { type: 'uuid', notNull: true, references: 'condominios', onDelete: 'CASCADE' },
    morador_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    aprovado_por: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    nome_visitante: { type: 'text', notNull: true },
    rg: { type: 'text' },
    placa_veiculo: { type: 'text' },
    data_visita: { type: 'timestamptz', notNull: true },
    hora_entrada: { type: 'timestamptz' },
    hora_saida: { type: 'timestamptz' },
    status: {
      type: 'text',
      notNull: true,
      default: 'aprovado',
      check: "status IN ('aprovado', 'bloqueado', 'ativo')",
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('visitantes', 'condominio_id');
  pgm.createIndex('visitantes', 'morador_id');

  pgm.sql('ALTER TABLE visitantes ENABLE ROW LEVEL SECURITY;');
  pgm.sql(`
    CREATE POLICY tenant_isolation ON visitantes
    USING (condominio_id = NULLIF(current_setting('app.condominio_id', true), '')::uuid)
    WITH CHECK (condominio_id = NULLIF(current_setting('app.condominio_id', true), '')::uuid);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('visitantes');
}
