import { MigrationBuilder } from 'node-pg-migrate';

// Difere um pouco do schema original do README (id, morador_id, admin_id, mensagem, timestamp,
// lido): "admin_id" fixo não deixa claro quem escreveu cada mensagem (morador ou admin). Em vez
// disso, "autor_id" é sempre quem escreveu (morador ou qualquer admin), e "morador_id" identifica
// a thread (cada morador tem uma conversa com a administração). "lido" indica se o outro lado já
// leu essa mensagem específica.
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('chats', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    condominio_id: { type: 'uuid', notNull: true, references: 'condominios', onDelete: 'CASCADE' },
    morador_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    autor_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    mensagem: { type: 'text', notNull: true },
    lido: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('chats', 'condominio_id');
  pgm.createIndex('chats', 'morador_id');

  pgm.sql('ALTER TABLE chats ENABLE ROW LEVEL SECURITY;');
  pgm.sql(`
    CREATE POLICY tenant_isolation ON chats
    USING (condominio_id = NULLIF(current_setting('app.condominio_id', true), '')::uuid)
    WITH CHECK (condominio_id = NULLIF(current_setting('app.condominio_id', true), '')::uuid);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('chats');
}
