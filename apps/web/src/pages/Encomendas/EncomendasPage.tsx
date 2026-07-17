import { useQuery } from '@tanstack/react-query';

import { CreateEncomendaForm } from '@/components/Encomendas/CreateEncomendaForm';
import { EncomendaCard } from '@/components/Encomendas/EncomendaCard';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { encomendasApi } from '@/services/api/encomendasApi';
import { useAuth } from '@/store/useAuth';

export function EncomendasPage() {
  const { user } = useAuth();
  const isPorteiro = user?.role === 'porteiro';
  const isMorador = user?.role === 'morador';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['encomendas'],
    queryFn: () => encomendasApi.list(),
  });

  return (
    <div className="flex flex-col gap-6">
      {isPorteiro && <CreateEncomendaForm />}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          {isMorador ? 'Minhas encomendas' : 'Encomendas do condomínio'}
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
              Não foi possível carregar as encomendas. Tente recarregar a página.
            </p>
          </Card>
        )}

        {!isLoading && !isError && data && data.length === 0 && (
          <Card>
            <p className="text-text-secondary">Nenhuma encomenda por aqui ainda.</p>
          </Card>
        )}

        {data?.map((encomenda) => (
          <EncomendaCard key={encomenda.id} encomenda={encomenda} canSign={isMorador} />
        ))}
      </div>
    </div>
  );
}
