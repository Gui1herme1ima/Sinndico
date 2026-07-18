import { MigrationBuilder } from 'node-pg-migrate';

// Fatia 3 (reformulação de acesso): admin vincula cada morador a uma residência já cadastrada
// (Fatia 2). O CHECK usa NOT VALID de propósito: há moradores de teste de sessões anteriores,
// criados antes da Fatia 1 remover o self-registro, sem nenhuma residência real pra vincular
// retroativamente. NOT VALID passa a exigir a coluna em toda escrita nova (INSERT/UPDATE) sem
// validar as linhas já existentes contra a regra.
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn('users', {
    residencia_id: { type: 'uuid', references: 'residencias', onDelete: 'RESTRICT' },
  });

  pgm.createIndex('users', 'residencia_id');

  pgm.sql(`
    ALTER TABLE users
    ADD CONSTRAINT users_morador_requires_residencia
    CHECK (role <> 'morador' OR residencia_id IS NOT NULL) NOT VALID;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql('ALTER TABLE users DROP CONSTRAINT users_morador_requires_residencia;');
  pgm.dropColumn('users', 'residencia_id');
}
