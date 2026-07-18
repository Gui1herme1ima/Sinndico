import { useQuery } from '@tanstack/react-query';

import { AssembleiaCard } from '@/components/Assembleias/AssembleiaCard';
import { CreateAssembleiaForm } from '@/components/Assembleias/CreateAssembleiaForm';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { assembleiasApi } from '@/services/api/assembleiasApi';
import { useAuth } from '@/store/useAuth';

export function AssembleiasPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isMorador = user?.role === 'morador';

  const assembleiasQuery = useQuery({
    queryKey: ['assembleias'],
    queryFn: () => assembleiasApi.list(),
  });

  return (
    <div className="flex flex-col gap-6">
      {isAdmin && <CreateAssembleiaForm />}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">Assembleias</h2>

        {assembleiasQuery.isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {assembleiasQuery.isError && (
          <Card>
            <p className="text-danger">Não foi possível carregar as assembleias.</p>
          </Card>
        )}

        {!assembleiasQuery.isLoading && !assembleiasQuery.isError && assembleiasQuery.data?.length === 0 && (
          <Card>
            <p className="text-text-secondary">Nenhuma assembleia convocada ainda.</p>
          </Card>
        )}

        {assembleiasQuery.data?.map((assembleia) => (
          <AssembleiaCard key={assembleia.id} assembleia={assembleia} isAdmin={isAdmin} isMorador={isMorador} />
        ))}
      </div>
    </div>
  );
}
