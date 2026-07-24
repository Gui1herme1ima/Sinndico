import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { AssembleiaCard } from '@/components/Assembleias/AssembleiaCard';
import { CreateAssembleiaForm } from '@/components/Assembleias/CreateAssembleiaForm';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Drawer } from '@/components/ui/Drawer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { PlusIcon } from '@/components/ui/icons';
import { assembleiasApi } from '@/services/api/assembleiasApi';
import { useAuth } from '@/store/useAuth';

export function AssembleiasPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isMorador = user?.role === 'morador';
  const [createOpen, setCreateOpen] = useState(false);

  const assembleiasQuery = useQuery({
    queryKey: ['assembleias'],
    queryFn: () => assembleiasApi.list(),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Assembleias"
          action={
            isAdmin && (
              <Button onClick={() => setCreateOpen(true)}>
                <PlusIcon width={16} height={16} />
                Convocar assembleia
              </Button>
            )
          }
        />

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

      {isAdmin && (
        <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="Convocar assembleia">
          <CreateAssembleiaForm onSuccess={() => setCreateOpen(false)} />
        </Drawer>
      )}
    </div>
  );
}
