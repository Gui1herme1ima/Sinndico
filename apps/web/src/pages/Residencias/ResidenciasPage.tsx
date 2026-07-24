import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { CreateResidenciaForm } from '@/components/Residencias/CreateResidenciaForm';
import { ImportarResidenciasButton } from '@/components/Residencias/ImportarResidenciasButton';
import { ResidenciaCard } from '@/components/Residencias/ResidenciaCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Drawer } from '@/components/ui/Drawer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { PlusIcon } from '@/components/ui/icons';
import { condominiosApi } from '@/services/api/condominiosApi';
import { residenciasApi } from '@/services/api/residenciasApi';

export function ResidenciasPage() {
  const [createOpen, setCreateOpen] = useState(false);

  const condominioQuery = useQuery({
    queryKey: ['condominio-atual'],
    queryFn: () => condominiosApi.getMine(),
  });

  const residenciasQuery = useQuery({
    queryKey: ['residencias'],
    queryFn: () => residenciasApi.list(),
    enabled: Boolean(condominioQuery.data),
  });

  if (condominioQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (condominioQuery.isError || !condominioQuery.data) {
    return (
      <Card>
        <p className="text-danger">Não foi possível carregar os dados do condomínio.</p>
      </Card>
    );
  }

  const { tipoResidencia } = condominioQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Residências"
          action={
            <div className="flex items-center gap-3">
              <ImportarResidenciasButton />
              <Button onClick={() => setCreateOpen(true)}>
                <PlusIcon width={16} height={16} />
                Cadastrar residência
              </Button>
            </div>
          }
        />

        {residenciasQuery.isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {residenciasQuery.isError && (
          <Card>
            <p className="text-danger">Não foi possível carregar as residências.</p>
          </Card>
        )}

        {!residenciasQuery.isLoading && !residenciasQuery.isError && residenciasQuery.data?.length === 0 && (
          <Card>
            <p className="text-text-secondary">Nenhuma residência cadastrada ainda.</p>
          </Card>
        )}

        {residenciasQuery.data?.map((residencia) => (
          <ResidenciaCard key={residencia.id} residencia={residencia} tipoResidencia={tipoResidencia} />
        ))}
      </div>

      <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="Nova residência">
        <CreateResidenciaForm tipoResidencia={tipoResidencia} onSuccess={() => setCreateOpen(false)} />
      </Drawer>
    </div>
  );
}
