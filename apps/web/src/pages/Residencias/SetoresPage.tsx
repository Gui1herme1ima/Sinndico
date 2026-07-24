import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { CreateSetorForm } from '@/components/Residencias/CreateSetorForm';
import { SetorCard } from '@/components/Residencias/SetorCard';
import { StatTile } from '@/components/Dashboard/StatTile';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListToolbar } from '@/components/ui/ListToolbar';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { MoradorEmptyIllustration } from '@/components/ui/illustrations';
import { PlusIcon, ResidenciaIcon, UserIcon } from '@/components/ui/icons';
import { setoresApi } from '@/services/api/setoresApi';

const SORT_OPTIONS = [
  { value: 'nome-asc', label: 'Nome (A-Z)' },
  { value: 'nome-desc', label: 'Nome (Z-A)' },
  { value: 'residencias-desc', label: 'Mais residências' },
];

export function SetoresPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('nome-asc');
  const [createOpen, setCreateOpen] = useState(false);

  const setoresQuery = useQuery({
    queryKey: ['setores'],
    queryFn: () => setoresApi.list(),
  });

  const setores = useMemo(() => {
    const items = setoresQuery.data ?? [];
    const filtered = search
      ? items.filter((s) => s.nome.toLowerCase().includes(search.toLowerCase()))
      : items;

    const [sortBy, sortOrder] = sort.split('-') as [string, 'asc' | 'desc'];
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'residencias') return b.residenciasCount - a.residenciasCount;
      return sortOrder === 'asc' ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome);
    });
    return sorted;
  }, [setoresQuery.data, search, sort]);

  if (setoresQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (setoresQuery.isError || !setoresQuery.data) {
    return (
      <Card>
        <p className="text-danger">Não foi possível carregar os setores.</p>
      </Card>
    );
  }

  const totalResidencias = setoresQuery.data.reduce((acc, s) => acc + s.residenciasCount, 0);
  const totalMoradores = setoresQuery.data.reduce((acc, s) => acc + s.moradoresCount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Residências"
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon width={16} height={16} />
              Cadastrar setor
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile
            tint="primary"
            icon={<ResidenciaIcon width={22} height={22} />}
            value={setoresQuery.data.length}
            label="setores"
          />
          <StatTile
            tint="accent"
            icon={<ResidenciaIcon width={22} height={22} />}
            value={totalResidencias}
            label="residências"
          />
          <StatTile
            tint="primary"
            icon={<UserIcon width={22} height={22} />}
            value={totalMoradores}
            label="moradores"
          />
        </div>

        <Card padding="none">
          <div className="p-5 md:p-8 md:pb-0">
            <ListToolbar
              searchValue={search}
              onSearchChange={setSearch}
              searchLabel="Buscar"
              searchPlaceholder="Nome do setor"
              resultCount={setores.length}
              resultLabel="setores"
              sortOptions={SORT_OPTIONS}
              sortValue={sort}
              onSortChange={setSort}
            />
          </div>

          <div className="p-5 md:p-8 md:pt-4">
            {setores.length === 0 ? (
              <EmptyState
                icon={<MoradorEmptyIllustration />}
                title={search ? 'Nenhum setor encontrado para essa busca.' : 'Nenhum setor cadastrado ainda.'}
                action={
                  search
                    ? { label: 'Limpar busca', onClick: () => setSearch('') }
                    : { label: 'Cadastrar setor', onClick: () => setCreateOpen(true) }
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {setores.map((setor) => (
                  <SetorCard key={setor.id} setor={setor} />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="Novo setor">
        <CreateSetorForm onSuccess={() => setCreateOpen(false)} />
      </Drawer>
    </div>
  );
}
