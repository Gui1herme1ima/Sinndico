import { useQuery } from '@tanstack/react-query';

import { CreateVisitanteForm } from '@/components/Visitantes/CreateVisitanteForm';
import { VisitanteCard } from '@/components/Visitantes/VisitanteCard';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { visitantesApi } from '@/services/api/visitantesApi';
import { useAuth } from '@/store/useAuth';

export function VisitantesPage() {
  const { user } = useAuth();
  const isMorador = user?.role === 'morador';
  const canManage = user?.role === 'admin' || user?.role === 'porteiro';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['visitantes'],
    queryFn: () => visitantesApi.list(),
  });

  return (
    <div className="flex flex-col gap-6">
      {isMorador && <CreateVisitanteForm />}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          {isMorador ? 'Meus visitantes' : 'Visitantes do condomínio'}
        </h2>

        {isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        )}

        {isError && (
          <Card>
            <p className="text-danger">
              Não foi possível carregar os visitantes. Tente recarregar a página.
            </p>
          </Card>
        )}

        {!isLoading && !isError && data && data.length === 0 && (
          <Card>
            <p className="text-text-secondary">Nenhum visitante registrado ainda.</p>
          </Card>
        )}

        {data?.map((visitante) => (
          <VisitanteCard key={visitante.id} visitante={visitante} canManage={canManage} />
        ))}
      </div>
    </div>
  );
}
