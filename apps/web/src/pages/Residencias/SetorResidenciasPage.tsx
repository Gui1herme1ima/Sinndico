import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import { CreateResidenciaForm } from '@/components/Residencias/CreateResidenciaForm';
import { ImportarResidenciasButton } from '@/components/Residencias/ImportarResidenciasButton';
import { ResidenciaCard } from '@/components/Residencias/ResidenciaCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListToolbar } from '@/components/ui/ListToolbar';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { MoradorEmptyIllustration } from '@/components/ui/illustrations';
import { ChevronRightIcon, PlusIcon } from '@/components/ui/icons';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { residenciasApi } from '@/services/api/residenciasApi';
import { setoresApi } from '@/services/api/setoresApi';

export function SetorResidenciasPage() {
  const { setorId } = useParams<{ setorId: string }>();
  const [rawSearch, setRawSearch] = useState('');
  const debouncedSearch = useDebouncedValue(rawSearch, 300);
  const [createOpen, setCreateOpen] = useState(false);

  const setorQuery = useQuery({
    queryKey: ['setor', setorId],
    queryFn: () => setoresApi.getById(setorId!),
    enabled: Boolean(setorId),
  });

  const residenciasQuery = useQuery({
    queryKey: ['residencias', setorId, debouncedSearch],
    queryFn: () => residenciasApi.list(setorId!, debouncedSearch || undefined),
    enabled: Boolean(setorId),
  });

  useEffect(() => {
    setRawSearch('');
  }, [setorId]);

  if (setorQuery.isLoading || residenciasQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (setorQuery.isError || !setorQuery.data || residenciasQuery.isError || !residenciasQuery.data) {
    return (
      <Card>
        <p className="text-danger">Não foi possível carregar as residências deste setor.</p>
      </Card>
    );
  }

  const setor = setorQuery.data;
  const residencias = residenciasQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          to="/residencias"
          className="flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-primary"
        >
          <ChevronRightIcon width={14} height={14} className="rotate-180" />
          Residências
        </Link>

        <PageHeader
          title={setor.nome}
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

        <Card padding="none">
          <div className="p-5 md:p-8 md:pb-0">
            <ListToolbar
              searchValue={rawSearch}
              onSearchChange={setRawSearch}
              searchLabel="Buscar"
              searchPlaceholder="Número"
              resultCount={residencias.length}
              resultLabel="residências"
              sortOptions={[{ value: 'numero-asc', label: 'Número' }]}
              sortValue="numero-asc"
              onSortChange={() => {}}
            />
          </div>

          <div className="flex flex-col gap-3 p-5 md:p-8 md:pt-4">
            {residencias.length === 0 ? (
              <EmptyState
                icon={<MoradorEmptyIllustration />}
                title={rawSearch ? 'Nenhuma residência encontrada para essa busca.' : 'Nenhuma residência cadastrada ainda.'}
                action={
                  rawSearch
                    ? { label: 'Limpar busca', onClick: () => setRawSearch('') }
                    : { label: 'Cadastrar residência', onClick: () => setCreateOpen(true) }
                }
              />
            ) : (
              residencias.map((residencia) => <ResidenciaCard key={residencia.id} residencia={residencia} />)
            )}
          </div>
        </Card>
      </div>

      <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="Nova residência">
        <CreateResidenciaForm setorId={setor.id} onSuccess={() => setCreateOpen(false)} />
      </Drawer>
    </div>
  );
}
