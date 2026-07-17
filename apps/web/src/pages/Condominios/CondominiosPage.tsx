import { useQuery } from '@tanstack/react-query';

import { CondominioCard } from '@/components/Condominios/CondominioCard';
import { CreateCondominioForm } from '@/components/Condominios/CreateCondominioForm';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { condominiosApi } from '@/services/api/condominiosApi';

export function CondominiosPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['condominios'],
    queryFn: () => condominiosApi.list(),
  });

  return (
    <div className="flex flex-col gap-6">
      <CreateCondominioForm />

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">Condomínios</h2>

        {isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {isError && (
          <Card>
            <p className="text-danger">
              Não foi possível carregar os condomínios. Tente recarregar a página.
            </p>
          </Card>
        )}

        {!isLoading && !isError && data && data.length === 0 && (
          <Card>
            <p className="text-text-secondary">Nenhum condomínio cadastrado ainda.</p>
          </Card>
        )}

        {data?.map((condominio) => (
          <CondominioCard key={condominio.id} condominio={condominio} />
        ))}
      </div>
    </div>
  );
}
