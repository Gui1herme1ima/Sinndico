import { useQuery } from '@tanstack/react-query';

import { ComidaCard } from '@/components/Comida/ComidaCard';
import { CreateComidaForm } from '@/components/Comida/CreateComidaForm';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { comidaApi } from '@/services/api/comidaApi';
import { useAuth } from '@/store/useAuth';

export function ComidaPage() {
  const { user } = useAuth();
  const isMorador = user?.role === 'morador';
  const canManage = user?.role === 'admin' || user?.role === 'porteiro';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['comida'],
    queryFn: () => comidaApi.list(),
  });

  return (
    <div className="flex flex-col gap-6">
      {isMorador && <CreateComidaForm />}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          {isMorador ? 'Meus pedidos' : 'Pedidos do condomínio'}
        </h2>

        {isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {isError && (
          <Card>
            <p className="text-danger">Não foi possível carregar os pedidos. Tente recarregar a página.</p>
          </Card>
        )}

        {!isLoading && !isError && data && data.length === 0 && (
          <Card>
            <p className="text-text-secondary">Nenhum pedido avisado ainda.</p>
          </Card>
        )}

        {data?.map((comida) => (
          <ComidaCard key={comida.id} comida={comida} isMorador={isMorador} canManage={canManage} />
        ))}
      </div>
    </div>
  );
}
