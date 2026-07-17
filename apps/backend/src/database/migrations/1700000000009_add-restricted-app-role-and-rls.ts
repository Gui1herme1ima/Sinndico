import { MigrationBuilder } from 'node-pg-migrate';

// A connection string padrão do Supabase (DATABASE_URL) usa a role "postgres", que é superuser e
// por isso IGNORA Row Level Security. Pra RLS proteger de verdade contra um bug de tenant no backend,
// o app precisa se conectar com uma role própria, sem esse bypass — detalhes no README seção 2 e no
// Checkpoint Log do CLAUDE.md.
const APP_DB_PASSWORD = process.env.APP_DB_PASSWORD;

const TENANT_TABLES = ['chamados', 'encomendas', 'comunicados'];

export async function up(pgm: MigrationBuilder): Promise<void> {
  if (!APP_DB_PASSWORD) {
    throw new Error('Defina APP_DB_PASSWORD no .env antes de rodar esta migration (senha da role restrita app_user).');
  }

  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
        CREATE ROLE app_user WITH LOGIN PASSWORD '${APP_DB_PASSWORD}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
      END IF;
    END
    $$;
  `);

  pgm.sql('GRANT USAGE ON SCHEMA public TO app_user;');
  pgm.sql('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;');
  pgm.sql('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;');

  // condominios: qualquer tenant pode ler o próprio; escrita fica só pra role privilegiada (superadmin).
  pgm.sql('ALTER TABLE condominios ENABLE ROW LEVEL SECURITY;');
  pgm.sql(`
    CREATE POLICY tenant_read ON condominios FOR SELECT
    USING (id = current_setting('app.condominio_id', true)::uuid);
  `);

  // users: sempre pode ler/atualizar o próprio registro (necessário pro bootstrap de identidade no
  // middleware de auth, antes de sabermos o condominio_id) ou qualquer usuário do mesmo condomínio.
  pgm.sql('ALTER TABLE users ENABLE ROW LEVEL SECURITY;');
  pgm.sql(`
    CREATE POLICY tenant_isolation ON users
    USING (
      id = current_setting('app.user_id', true)::uuid
      OR condominio_id = current_setting('app.condominio_id', true)::uuid
    )
    WITH CHECK (
      id = current_setting('app.user_id', true)::uuid
      OR condominio_id = current_setting('app.condominio_id', true)::uuid
    );
  `);

  for (const table of TENANT_TABLES) {
    pgm.sql(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
    pgm.sql(`
      CREATE POLICY tenant_isolation ON ${table}
      USING (condominio_id = current_setting('app.condominio_id', true)::uuid)
      WITH CHECK (condominio_id = current_setting('app.condominio_id', true)::uuid);
    `);
  }

  // comunicado_leituras não tem condominio_id próprio — isola via join com comunicados.
  pgm.sql('ALTER TABLE comunicado_leituras ENABLE ROW LEVEL SECURITY;');
  pgm.sql(`
    CREATE POLICY tenant_isolation ON comunicado_leituras
    USING (
      EXISTS (
        SELECT 1 FROM comunicados c
        WHERE c.id = comunicado_leituras.comunicado_id
        AND c.condominio_id = current_setting('app.condominio_id', true)::uuid
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM comunicados c
        WHERE c.id = comunicado_leituras.comunicado_id
        AND c.condominio_id = current_setting('app.condominio_id', true)::uuid
      )
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql('DROP POLICY IF EXISTS tenant_isolation ON comunicado_leituras;');
  pgm.sql('ALTER TABLE comunicado_leituras DISABLE ROW LEVEL SECURITY;');

  for (const table of TENANT_TABLES) {
    pgm.sql(`DROP POLICY IF EXISTS tenant_isolation ON ${table};`);
    pgm.sql(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`);
  }

  pgm.sql('DROP POLICY IF EXISTS tenant_isolation ON users;');
  pgm.sql('ALTER TABLE users DISABLE ROW LEVEL SECURITY;');

  pgm.sql('DROP POLICY IF EXISTS tenant_read ON condominios;');
  pgm.sql('ALTER TABLE condominios DISABLE ROW LEVEL SECURITY;');

  pgm.sql('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_user;');
  pgm.sql('REVOKE USAGE ON SCHEMA public FROM app_user;');
  pgm.sql('DROP ROLE IF EXISTS app_user;');
}
