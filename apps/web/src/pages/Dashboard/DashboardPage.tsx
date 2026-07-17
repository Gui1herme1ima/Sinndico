import { useQuery } from '@tanstack/react-query';

import { StatTile } from '@/components/Dashboard/StatTile';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/formatDate';
import { dashboardApi } from '@/services/api/dashboardApi';

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardApi.getSummary(),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <p className="text-danger">Não foi possível carregar o resumo. Tente recarregar a página.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Solicitações abertas" value={data.solicitacoes.abertas} />
        <StatTile label="Solicitações em progresso" value={data.solicitacoes.emProgresso} />
        <StatTile label="Encomendas aguardando retirada" value={data.encomendas.aguardandoRetirada} />
        <StatTile label="Encomendas chegadas hoje" value={data.encomendas.chegaramHoje} />
      </div>

      <Card title="Comunicados recentes">
        {data.comunicados.recentes.length === 0 ? (
          <p className="text-text-secondary">Nenhum comunicado publicado ainda.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {data.comunicados.recentes.map((comunicado) => (
              <li
                key={comunicado.id}
                className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <span className="text-sm text-text-primary">{comunicado.titulo}</span>
                <span className="font-mono text-xs text-text-secondary">
                  {formatDate(comunicado.dataCriacao)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
