import { MigrationBuilder } from 'node-pg-migrate';

// Fatia 5 (RBAC — papéis customizáveis por tenant): os 4 papéis fixos (morador/admin/porteiro/
// superadmin) continuam intactos, mas o admin passa a poder ligar/desligar o acesso do próprio
// porteiro a 4 módulos operacionais que hoje são porteiro-incluídos de forma fixa em authorize().
// Colunas direto em condominios (mesmo padrão de tipo_residencia) — é um conjunto fixo e pequeno de
// flags de config do tenant, não justifica tabela separada. Default true preserva o comportamento
// atual pra todo condomínio existente.
export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumns('condominios', {
    porteiro_acesso_encomendas: { type: 'boolean', notNull: true, default: true },
    porteiro_acesso_visitantes: { type: 'boolean', notNull: true, default: true },
    porteiro_acesso_comida: { type: 'boolean', notNull: true, default: true },
    porteiro_acesso_comunicados: { type: 'boolean', notNull: true, default: true },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns('condominios', [
    'porteiro_acesso_encomendas',
    'porteiro_acesso_visitantes',
    'porteiro_acesso_comida',
    'porteiro_acesso_comunicados',
  ]);
}
