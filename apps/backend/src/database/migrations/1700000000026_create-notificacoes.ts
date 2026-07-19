import { MigrationBuilder } from 'node-pg-migrate';

// Uma linha por (evento, destinatário) — não é junção estilo comunicado_leituras, porque cada
// notificação já nasce endereçada a um usuário só, igual às linhas de device_tokens/push.
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('notificacoes', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    condominio_id: { type: 'uuid', notNull: true, references: 'condominios', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    tipo: {
      type: 'text',
      notNull: true,
      check: "tipo IN ('chat','comida','comunicado','reserva','assembleia','encomenda')",
    },
    titulo: { type: 'text', notNull: true },
    corpo: { type: 'text', notNull: true },
    referencia_id: { type: 'uuid', notNull: true },
    lida: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('notificacoes', 'condominio_id');
  pgm.createIndex('notificacoes', ['user_id', 'lida']);

  pgm.sql('ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;');
  pgm.sql(`
    CREATE POLICY tenant_isolation ON notificacoes
    USING (condominio_id = NULLIF(current_setting('app.condominio_id', true), '')::uuid)
    WITH CHECK (condominio_id = NULLIF(current_setting('app.condominio_id', true), '')::uuid);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('notificacoes');
}
