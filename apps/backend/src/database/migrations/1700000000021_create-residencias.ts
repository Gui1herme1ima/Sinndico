import { MigrationBuilder } from 'node-pg-migrate';

// Fatia 2 (reformulação de acesso): admin cadastra residências antes de poder vincular moradores/
// visitantes a elas (Fatia 3). Schema condicional pelo tipo do condomínio (condominios.tipo_residencia):
// apartamento usa bloco+numero, casa usa rua+numero — por isso as duas colunas são nullable e a
// obrigatoriedade de uma ou outra é decidida no controller (não dá pra fazer isso num CHECK simples,
// já que depende de uma linha de outra tabela).
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('residencias', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    condominio_id: { type: 'uuid', notNull: true, references: 'condominios', onDelete: 'CASCADE' },
    bloco: { type: 'text' },
    rua: { type: 'text' },
    numero: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('residencias', 'condominio_id');

  // Rede de segurança contra duplicidade (o caminho principal de UX é uma checagem explícita antes do
  // insert, no controller) — parcial porque só uma das colunas é preenchida por vez.
  pgm.createIndex('residencias', ['condominio_id', 'bloco', 'numero'], {
    unique: true,
    where: 'bloco IS NOT NULL',
    name: 'residencias_apartamento_unique',
  });
  pgm.createIndex('residencias', ['condominio_id', 'rua', 'numero'], {
    unique: true,
    where: 'rua IS NOT NULL',
    name: 'residencias_casa_unique',
  });

  pgm.sql('ALTER TABLE residencias ENABLE ROW LEVEL SECURITY;');
  pgm.sql(`
    CREATE POLICY tenant_isolation ON residencias
    USING (condominio_id = NULLIF(current_setting('app.condominio_id', true), '')::uuid)
    WITH CHECK (condominio_id = NULLIF(current_setting('app.condominio_id', true), '')::uuid);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('residencias');
}
