import { MigrationBuilder } from 'node-pg-migrate';

// Renomeia "chamados" para "solicitacoes" (nome mais formal, pedido do usuário). Tabela já tinha
// dado real quando esta migration foi escrita, por isso é um RENAME em vez de dropar/recriar.
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql('ALTER TABLE chamados RENAME TO solicitacoes;');

  pgm.sql('ALTER TABLE solicitacoes RENAME CONSTRAINT chamados_pkey TO solicitacoes_pkey;');
  pgm.sql('ALTER TABLE solicitacoes RENAME CONSTRAINT chamados_assigned_to_fkey TO solicitacoes_assigned_to_fkey;');
  pgm.sql('ALTER TABLE solicitacoes RENAME CONSTRAINT chamados_condominio_id_fkey TO solicitacoes_condominio_id_fkey;');
  pgm.sql('ALTER TABLE solicitacoes RENAME CONSTRAINT chamados_morador_id_fkey TO solicitacoes_morador_id_fkey;');
  pgm.sql('ALTER TABLE solicitacoes RENAME CONSTRAINT chamados_categoria_check TO solicitacoes_categoria_check;');
  pgm.sql('ALTER TABLE solicitacoes RENAME CONSTRAINT chamados_prioridade_check TO solicitacoes_prioridade_check;');
  pgm.sql('ALTER TABLE solicitacoes RENAME CONSTRAINT chamados_status_check TO solicitacoes_status_check;');

  pgm.sql('ALTER INDEX chamados_condominio_id_index RENAME TO solicitacoes_condominio_id_index;');
  pgm.sql('ALTER INDEX chamados_morador_id_index RENAME TO solicitacoes_morador_id_index;');
  pgm.sql('ALTER INDEX chamados_status_index RENAME TO solicitacoes_status_index;');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql('ALTER INDEX solicitacoes_condominio_id_index RENAME TO chamados_condominio_id_index;');
  pgm.sql('ALTER INDEX solicitacoes_morador_id_index RENAME TO chamados_morador_id_index;');
  pgm.sql('ALTER INDEX solicitacoes_status_index RENAME TO chamados_status_index;');

  pgm.sql('ALTER TABLE solicitacoes RENAME CONSTRAINT solicitacoes_pkey TO chamados_pkey;');
  pgm.sql('ALTER TABLE solicitacoes RENAME CONSTRAINT solicitacoes_assigned_to_fkey TO chamados_assigned_to_fkey;');
  pgm.sql('ALTER TABLE solicitacoes RENAME CONSTRAINT solicitacoes_condominio_id_fkey TO chamados_condominio_id_fkey;');
  pgm.sql('ALTER TABLE solicitacoes RENAME CONSTRAINT solicitacoes_morador_id_fkey TO chamados_morador_id_fkey;');
  pgm.sql('ALTER TABLE solicitacoes RENAME CONSTRAINT solicitacoes_categoria_check TO chamados_categoria_check;');
  pgm.sql('ALTER TABLE solicitacoes RENAME CONSTRAINT solicitacoes_prioridade_check TO chamados_prioridade_check;');
  pgm.sql('ALTER TABLE solicitacoes RENAME CONSTRAINT solicitacoes_status_check TO chamados_status_check;');

  pgm.sql('ALTER TABLE solicitacoes RENAME TO chamados;');
}
