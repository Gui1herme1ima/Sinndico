import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('encomendas', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    condominio_id: { type: 'uuid', notNull: true, references: 'condominios', onDelete: 'CASCADE' },
    morador_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    porteiro_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'RESTRICT' },
    descricao: { type: 'text' },
    horario_chegada: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    foto_url: { type: 'text' },
    assinado: { type: 'boolean', notNull: true, default: false },
    data_assinatura: { type: 'timestamptz' },
    status: {
      type: 'text',
      notNull: true,
      default: 'aguardando',
      check: "status IN ('aguardando', 'retirada')",
    },
  });

  pgm.createIndex('encomendas', 'condominio_id');
  pgm.createIndex('encomendas', 'morador_id');
  pgm.createIndex('encomendas', 'status');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('encomendas');
}
