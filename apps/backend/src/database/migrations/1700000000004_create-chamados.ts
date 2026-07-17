import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('chamados', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    condominio_id: { type: 'uuid', notNull: true, references: 'condominios', onDelete: 'CASCADE' },
    morador_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    assigned_to: { type: 'uuid', references: 'users', onDelete: 'SET NULL' },
    categoria: {
      type: 'text',
      notNull: true,
      check: "categoria IN ('manutencao', 'seguranca', 'animal', 'outra')",
    },
    titulo: { type: 'text', notNull: true },
    descricao: { type: 'text', notNull: true },
    status: {
      type: 'text',
      notNull: true,
      default: 'aberto',
      check: "status IN ('aberto', 'em-progresso', 'resolvido')",
    },
    prioridade: {
      type: 'text',
      notNull: true,
      default: 'media',
      check: "prioridade IN ('baixa', 'media', 'alta')",
    },
    data_criacao: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    data_resolvimento: { type: 'timestamptz' },
  });

  pgm.createIndex('chamados', 'condominio_id');
  pgm.createIndex('chamados', 'morador_id');
  pgm.createIndex('chamados', 'status');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('chamados');
}
