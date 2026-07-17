import { MigrationBuilder } from 'node-pg-migrate';

// Reformulação de acesso: superadmin passa a definir, na criação do condomínio, o slug de URL
// (`sinndico.com.br/<slug>`), dados de contato e o tipo de residência (afeta o schema condicional de
// Residências na Fatia 2). A tabela já tem linhas reais de teste acumuladas de sessões anteriores,
// então o backfill roda antes de travar as constraints NOT NULL/UNIQUE.
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumns('condominios', {
    slug: { type: 'text' },
    endereco: { type: 'text' },
    contato_nome: { type: 'text' },
    contato_email: { type: 'text' },
    contato_telefone: { type: 'text' },
    tipo_residencia: { type: 'text' },
  });

  pgm.sql(`UPDATE condominios SET slug = 'condominio-' || substr(id::text, 1, 8) WHERE slug IS NULL;`);
  pgm.sql(`UPDATE condominios SET tipo_residencia = 'apartamento' WHERE tipo_residencia IS NULL;`);

  pgm.alterColumn('condominios', 'slug', { notNull: true });
  pgm.alterColumn('condominios', 'tipo_residencia', { notNull: true });

  pgm.addConstraint('condominios', 'condominios_slug_unique', 'UNIQUE (slug)');
  pgm.addConstraint(
    'condominios',
    'condominios_tipo_residencia_check',
    "CHECK (tipo_residencia IN ('apartamento', 'casa'))"
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropConstraint('condominios', 'condominios_tipo_residencia_check');
  pgm.dropConstraint('condominios', 'condominios_slug_unique');
  pgm.dropColumns('condominios', [
    'slug',
    'endereco',
    'contato_nome',
    'contato_email',
    'contato_telefone',
    'tipo_residencia',
  ]);
}
