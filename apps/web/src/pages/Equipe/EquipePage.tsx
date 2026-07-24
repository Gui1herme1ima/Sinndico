import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { CreateStaffUserForm } from '@/components/Equipe/CreateStaffUserForm';
import { StaffUserCard } from '@/components/Equipe/StaffUserCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Drawer } from '@/components/ui/Drawer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { PlusIcon } from '@/components/ui/icons';
import { usersApi } from '@/services/api/usersApi';

export function EquipePage() {
  const [createOpen, setCreateOpen] = useState(false);

  const equipeQuery = useQuery({
    queryKey: ['equipe'],
    queryFn: () => usersApi.listEquipe(),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Equipe"
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon width={16} height={16} />
              Cadastrar
            </Button>
          }
        />

        {equipeQuery.isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {equipeQuery.isError && (
          <Card>
            <p className="text-danger">Não foi possível carregar a equipe.</p>
          </Card>
        )}

        {!equipeQuery.isLoading && !equipeQuery.isError && equipeQuery.data?.length === 0 && (
          <Card>
            <p className="text-text-secondary">Nenhum administrador ou porteiro cadastrado ainda.</p>
          </Card>
        )}

        {equipeQuery.data?.map((usuario) => (
          <StaffUserCard key={usuario.id} usuario={usuario} />
        ))}
      </div>

      <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="Novo administrador ou porteiro">
        <CreateStaffUserForm onSuccess={() => setCreateOpen(false)} />
      </Drawer>
    </div>
  );
}
