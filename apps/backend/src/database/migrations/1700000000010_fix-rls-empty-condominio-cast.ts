import { MigrationBuilder } from 'node-pg-migrate';

// set_config('app.condominio_id', NULL, true) grava string vazia, não NULL de verdade — então
// current_setting(...)::uuid quebrava com "invalid input syntax for type uuid" toda vez que o
// contexto de tenant não tinha condominio_id (self-lookup de usuário, ex.: middleware de auth).
// Corrige envolvendo com NULLIF(..., '') antes do cast, em toda policy criada na migration anterior.
const TENANT_TABLES = ['chamados', 'encomendas', 'comunicados'];
const CONDOMINIO_EXPR = "NULLIF(current_setting('app.condominio_id', true), '')::uuid";
const USER_EXPR = "NULLIF(current_setting('app.user_id', true), '')::uuid";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql('DROP POLICY IF EXISTS tenant_read ON condominios;');
  pgm.sql(`CREATE POLICY tenant_read ON condominios FOR SELECT USING (id = ${CONDOMINIO_EXPR});`);

  pgm.sql('DROP POLICY IF EXISTS tenant_isolation ON users;');
  pgm.sql(`
    CREATE POLICY tenant_isolation ON users
    USING (id = ${USER_EXPR} OR condominio_id = ${CONDOMINIO_EXPR})
    WITH CHECK (id = ${USER_EXPR} OR condominio_id = ${CONDOMINIO_EXPR});
  `);

  for (const table of TENANT_TABLES) {
    pgm.sql(`DROP POLICY IF EXISTS tenant_isolation ON ${table};`);
    pgm.sql(`
      CREATE POLICY tenant_isolation ON ${table}
      USING (condominio_id = ${CONDOMINIO_EXPR})
      WITH CHECK (condominio_id = ${CONDOMINIO_EXPR});
    `);
  }

  pgm.sql('DROP POLICY IF EXISTS tenant_isolation ON comunicado_leituras;');
  pgm.sql(`
    CREATE POLICY tenant_isolation ON comunicado_leituras
    USING (
      EXISTS (
        SELECT 1 FROM comunicados c
        WHERE c.id = comunicado_leituras.comunicado_id AND c.condominio_id = ${CONDOMINIO_EXPR}
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM comunicados c
        WHERE c.id = comunicado_leituras.comunicado_id AND c.condominio_id = ${CONDOMINIO_EXPR}
      )
    );
  `);
}

export async function down(): Promise<void> {
  // Reverter significaria voltar pro cast que quebra com contexto sem condominio_id — não vale a pena.
  throw new Error('Irreversível: reverteria para o cast que quebra com condominio_id vazio.');
}
