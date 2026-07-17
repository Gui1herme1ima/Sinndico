import { MigrationBuilder } from 'node-pg-migrate';

// Tokens de dispositivo (FCM) por usuário, pra notificações push. Token é único: se o mesmo
// dispositivo re-registra (renovação, troca de usuário logado), atualiza em vez de duplicar.
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('device_tokens', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    condominio_id: { type: 'uuid', notNull: true, references: 'condominios', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    token: { type: 'text', notNull: true },
    platform: {
      type: 'text',
      notNull: true,
      check: "platform IN ('web', 'android', 'ios')",
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('device_tokens', 'device_tokens_token_unique', 'UNIQUE(token)');
  pgm.createIndex('device_tokens', 'condominio_id');
  pgm.createIndex('device_tokens', 'user_id');

  pgm.sql('ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;');
  pgm.sql(`
    CREATE POLICY tenant_isolation ON device_tokens
    USING (condominio_id = NULLIF(current_setting('app.condominio_id', true), '')::uuid)
    WITH CHECK (condominio_id = NULLIF(current_setting('app.condominio_id', true), '')::uuid);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('device_tokens');
}
