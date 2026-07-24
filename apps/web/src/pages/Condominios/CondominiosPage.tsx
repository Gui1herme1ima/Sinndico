import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { CondominioCard } from '@/components/Condominios/CondominioCard';
import { CreateCondominioForm } from '@/components/Condominios/CreateCondominioForm';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Drawer } from '@/components/ui/Drawer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { PlusIcon } from '@/components/ui/icons';
import { condominiosApi } from '@/services/api/condominiosApi';

export function CondominiosPage() {
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['condominios'],
    queryFn: () => condominiosApi.list(),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Condomínios"
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon width={16} height={16} />
              Novo condomínio
            </Button>
          }
        />

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

      <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="Novo condomínio">
        <CreateCondominioForm onSuccess={() => setCreateOpen(false)} />
      </Drawer>
    </div>
  );
}
