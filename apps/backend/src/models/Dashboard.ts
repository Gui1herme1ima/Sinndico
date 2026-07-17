import { TenantContext, withTenantContext } from '../database/tenantContext';

export interface DashboardSummary {
  solicitacoes: {
    abertas: number;
    emProgresso: number;
  };
  encomendas: {
    aguardandoRetirada: number;
    chegaramHoje: number;
  };
  comunicados: {
    recentes: { id: string; titulo: string; dataCriacao: Date }[];
  };
}

export async function getDashboardSummary(ctx: TenantContext): Promise<DashboardSummary> {
  return withTenantContext(ctx, async (client) => {
    const [solicitacoesResult, encomendasResult, comunicadosResult] = await Promise.all([
      client.query<{ status: string; count: string }>(
        `SELECT status, COUNT(*) AS count
         FROM solicitacoes
         WHERE status IN ('aberto', 'em-progresso')
         GROUP BY status`
      ),
      client.query<{ aguardando: string; chegaram_hoje: string }>(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'aguardando') AS aguardando,
           COUNT(*) FILTER (WHERE horario_chegada::date = CURRENT_DATE) AS chegaram_hoje
         FROM encomendas`
      ),
      client.query<{ id: string; titulo: string; data_criacao: Date }>(
        'SELECT id, titulo, data_criacao FROM comunicados ORDER BY data_criacao DESC LIMIT 5'
      ),
    ]);

    const porStatus = Object.fromEntries(solicitacoesResult.rows.map((r) => [r.status, Number(r.count)]));

    return {
      solicitacoes: {
        abertas: porStatus['aberto'] ?? 0,
        emProgresso: porStatus['em-progresso'] ?? 0,
      },
      encomendas: {
        aguardandoRetirada: Number(encomendasResult.rows[0]?.aguardando ?? 0),
        chegaramHoje: Number(encomendasResult.rows[0]?.chegaram_hoje ?? 0),
      },
      comunicados: {
        recentes: comunicadosResult.rows.map((r) => ({
          id: r.id,
          titulo: r.titulo,
          dataCriacao: r.data_criacao,
        })),
      },
    };
  });
}
