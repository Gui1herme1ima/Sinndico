import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { ComunicadoCard } from '@/components/Comunicados/ComunicadoCard';
import { CreateComunicadoForm } from '@/components/Comunicados/CreateComunicadoForm';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Drawer } from '@/components/ui/Drawer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { PlusIcon } from '@/components/ui/icons';
import { comunicadosApi } from '@/services/api/comunicadosApi';
import { useAuth } from '@/store/useAuth';

export function ComunicadosPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['comunicados'],
    queryFn: () => comunicadosApi.list(),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Comunicados"
          action={
            isAdmin && (
              <Button onClick={() => setCreateOpen(true)}>
                <PlusIcon width={16} height={16} />
                Criar comunicado
              </Button>
            )
          }
        />

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

      {isAdmin && (
        <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="Novo comunicado">
          <CreateComunicadoForm onSuccess={() => setCreateOpen(false)} />
        </Drawer>
      )}
    </div>
  );
}
