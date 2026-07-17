import { MigrationBuilder } from 'node-pg-migrate';

// Marca contas criadas pelo admin/superadmin com uma senha gerada pelo sistema — o frontend usa essa
// flag (exposta em /me e na resposta de login) pra forçar a troca de senha antes de liberar o painel.
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn('users', {
    senha_temporaria: { type: 'boolean', notNull: true, default: false },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumn('users', 'senha_temporaria');
}
