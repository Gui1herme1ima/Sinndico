import { useQuery } from '@tanstack/react-query';

import { CreateSolicitacaoForm } from '@/components/Solicitacoes/CreateSolicitacaoForm';
import { SolicitacaoCard } from '@/components/Solicitacoes/SolicitacaoCard';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { solicitacoesApi } from '@/services/api/solicitacoesApi';
import { useAuth } from '@/store/useAuth';

export function SolicitacoesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['solicitacoes'],
    queryFn: () => solicitacoesApi.list(),
  });

  return (
    <div className="flex flex-col gap-6">
      {!isAdmin && <CreateSolicitacaoForm />}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          {isAdmin ? 'Solicitações do condomínio' : 'Minhas solicitações'}
        </h2>

        {isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {isError && (
          <Card>
            <p className="text-danger">
              Não foi possível carregar as solicitações. Tente recarregar a página.
            </p>
          </Card>
        )}

        {!isLoading && !isError && data && data.length === 0 && (
          <Card>
            <p className="text-text-secondary">Nenhuma solicitação por aqui ainda.</p>
          </Card>
        )}

        {data?.map((solicitacao) => (
          <SolicitacaoCard key={solicitacao.id} solicitacao={solicitacao} canManage={isAdmin} />
        ))}
      </div>
    </div>
  );
}
