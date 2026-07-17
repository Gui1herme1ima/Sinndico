import { useQuery } from '@tanstack/react-query';

import { ComunicadoCard } from '@/components/Comunicados/ComunicadoCard';
import { CreateComunicadoForm } from '@/components/Comunicados/CreateComunicadoForm';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { comunicadosApi } from '@/services/api/comunicadosApi';
import { useAuth } from '@/store/useAuth';

export function ComunicadosPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['comunicados'],
    queryFn: () => comunicadosApi.list(),
  });

  return (
    <div className="flex flex-col gap-6">
      {isAdmin && <CreateComunicadoForm />}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">Comunicados</h2>

        {isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        )}

        {isError && (
          <Card>
            <p className="text-danger">
              Não foi possível carregar os comunicados. Tente recarregar a página.
            </p>
          </Card>
        )}

        {!isLoading && !isError && data && data.length === 0 && (
          <Card>
            <p className="text-text-secondary">Nenhum comunicado por aqui ainda.</p>
          </Card>
        )}

        {data?.map((comunicado) => (
          <ComunicadoCard key={comunicado.id} comunicado={comunicado} />
        ))}
      </div>
    </div>
  );
}
