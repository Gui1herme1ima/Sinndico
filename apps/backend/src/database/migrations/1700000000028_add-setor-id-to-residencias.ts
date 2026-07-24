import { MigrationBuilder } from 'node-pg-migrate';

// Fatia 4.10.1: substitui os campos soltos bloco/rua de residencias por uma FK pra setores.
// Backfill cria um setor por valor distinto de bloco (tipo='bloco') e rua (tipo='rua') já
// existente, depois liga cada residência ao setor correspondente. Roda fora de RLS (conexão de
// migration não seta app.condominio_id), então cobre todos os tenants numa passada.
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn('residencias', {
    setor_id: { type: 'uuid', references: 'setores', onDelete: 'RESTRICT' },
  });

  pgm.sql(`
    INSERT INTO setores (condominio_id, nome, tipo)
    SELECT DISTINCT condominio_id, bloco, 'bloco' FROM residencias WHERE bloco IS NOT NULL
    ON CONFLICT (condominio_id, nome) DO NOTHING;
  `);
  pgm.sql(`
    INSERT INTO setores (condominio_id, nome, tipo)
    SELECT DISTINCT condominio_id, rua, 'rua' FROM residencias WHERE rua IS NOT NULL
    ON CONFLICT (condominio_id, nome) DO NOTHING;
  `);
  pgm.sql(`
    UPDATE residencias r SET setor_id = s.id
    FROM setores s
    WHERE r.bloco IS NOT NULL AND s.condominio_id = r.condominio_id
      AND s.nome = r.bloco AND s.tipo = 'bloco';
  `);
  pgm.sql(`
    UPDATE residencias r SET setor_id = s.id
    FROM setores s
    WHERE r.rua IS NOT NULL AND s.condominio_id = r.condominio_id
      AND s.nome = r.rua AND s.tipo = 'rua';
  `);

  pgm.alterColumn('residencias', 'setor_id', { notNull: true });

  pgm.dropIndex('residencias', ['condominio_id', 'bloco', 'numero'], {
    name: 'residencias_apartamento_unique',
  });
  pgm.dropIndex('residencias', ['condominio_id', 'rua', 'numero'], {
    name: 'residencias_casa_unique',
  });
  pgm.createIndex('residencias', ['setor_id', 'numero'], { unique: true });

  pgm.dropColumns('residencias', ['bloco', 'rua']);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumns('residencias', {
    bloco: { type: 'text' },
    rua: { type: 'text' },
  });

  // Perde setores de tipo diferente de bloco/rua no rollback — aceitável (dev-stage, sem dados
  // de produção que dependam disso).
  pgm.sql(`
    UPDATE residencias r SET
      bloco = CASE WHEN s.tipo = 'bloco' THEN s.nome END,
      rua = CASE WHEN s.tipo = 'rua' THEN s.nome END
    FROM setores s
    WHERE s.id = r.setor_id;
  `);

  pgm.dropIndex('residencias', ['setor_id', 'numero']);
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

  pgm.dropColumn('residencias', 'setor_id');
}
