import { useQuery } from '@tanstack/react-query';

import { CreateMoradorForm } from '@/components/Moradores/CreateMoradorForm';
import { ImportarMoradoresButton } from '@/components/Moradores/ImportarMoradoresButton';
import { MoradorCard } from '@/components/Moradores/MoradorCard';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { residenciasApi } from '@/services/api/residenciasApi';
import { usersApi } from '@/services/api/usersApi';

export function MoradoresPage() {
  const residenciasQuery = useQuery({
    queryKey: ['residencias'],
    queryFn: () => residenciasApi.list(),
  });

  const moradoresQuery = useQuery({
    queryKey: ['moradores'],
    queryFn: () => usersApi.listMoradores(),
    enabled: Boolean(residenciasQuery.data),
  });

  if (residenciasQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (residenciasQuery.isError || !residenciasQuery.data) {
    return (
      <Card>
        <p className="text-danger">Não foi possível carregar as residências.</p>
      </Card>
    );
  }

  const residencias = residenciasQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <CreateMoradorForm residencias={residencias} />
      <ImportarMoradoresButton />

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">Moradores</h2>

        {moradoresQuery.isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {moradoresQuery.isError && (
          <Card>
            <p className="text-danger">Não foi possível carregar os moradores.</p>
          </Card>
        )}

        {!moradoresQuery.isLoading && !moradoresQuery.isError && moradoresQuery.data?.length === 0 && (
          <Card>
            <p className="text-text-secondary">Nenhum morador cadastrado ainda.</p>
          </Card>
        )}

        {moradoresQuery.data?.map((morador) => (
          <MoradorCard key={morador.id} morador={morador} residencias={residencias} />
        ))}
      </div>
    </div>
  );
}
