import { useQuery } from '@tanstack/react-query';

import { StatTile } from '@/components/Dashboard/StatTile';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ComunicadoIcon, CondominioIcon, EncomendaIcon, SolicitacaoManutencaoIcon } from '@/components/ui/icons';
import { formatDate } from '@/lib/formatDate';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { dashboardApi } from '@/services/api/dashboardApi';
import { useAuth } from '@/store/useAuth';

function saudacaoPorHorario(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardApi.getSummary(),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-[148px] w-full rounded-[20px]" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
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

  const primeiroNome = user?.nome.split(' ')[0] ?? '';
  const hojeFormatado = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(
    new Date(),
  );
  const hoje = hojeFormatado.charAt(0).toUpperCase() + hojeFormatado.slice(1);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[20px] border border-border bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-primary)_16%,var(--color-surface)),color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface)))] p-6 shadow-sm md:p-8">
        <div className="flex items-center justify-between gap-6">
          <div>
            <span className="mb-2.5 block text-sm font-semibold text-primary">
              {saudacaoPorHorario()}, {primeiroNome}
            </span>
            <h1 className="max-w-xl font-display text-2xl font-semibold leading-snug text-text-primary md:text-[27px]">
              Hoje você tem <em className="text-primary not-italic">{data.encomendas.aguardandoRetirada} encomendas</em>{' '}
              te esperando e{' '}
              <em className="text-primary not-italic">{data.solicitacoes.abertas} solicitações</em> em aberto.
            </h1>
            <span className="mt-3 block text-xs text-text-muted">{hoje}</span>
          </div>
          <div className="hidden h-[100px] w-[100px] flex-shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)] text-primary md:flex">
            <CondominioIcon width={50} height={50} strokeWidth={1.6} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile
          tint="accent"
          icon={<SolicitacaoManutencaoIcon width={22} height={22} />}
          value={data.solicitacoes.abertas}
          label="solicitações abertas"
          foot="aguardando resposta"
        />
        <StatTile
          tint="primary"
          icon={<SolicitacaoManutencaoIcon width={22} height={22} />}
          value={data.solicitacoes.emProgresso}
          label="em progresso"
          foot="já sendo resolvidas"
        />
        <StatTile
          tint="accent"
          icon={<EncomendaIcon width={22} height={22} />}
          value={data.encomendas.aguardandoRetirada}
          label="encomendas aguardando"
          foot="retirada na portaria"
        />
        <StatTile
          tint="primary"
          icon={<EncomendaIcon width={22} height={22} />}
          value={data.encomendas.chegaramHoje}
          label="chegaram hoje"
          foot="avise seus moradores"
        />
      </div>

      <Card title="Comunicados recentes">
        {data.comunicados.recentes.length === 0 ? (
          <p className="text-text-secondary">Nenhum comunicado publicado ainda.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {data.comunicados.recentes.map((comunicado) => (
              <li
                key={comunicado.id}
                className="flex items-center gap-3.5 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-accent/[0.16] text-accent">
                  <ComunicadoIcon width={16} height={16} />
                </span>
                <span className="flex-1 text-sm text-text-primary">{comunicado.titulo}</span>
                <span
                  className="text-xs font-medium text-text-secondary"
                  title={formatDate(comunicado.dataCriacao)}
                >
                  {formatRelativeTime(comunicado.dataCriacao)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
