import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { CreateMoradorForm } from '@/components/Moradores/CreateMoradorForm';
import { ImportarMoradoresButton } from '@/components/Moradores/ImportarMoradoresButton';
import { MoradorCard } from '@/components/Moradores/MoradorCard';
import { Card } from '@/components/ui/Card';
import { ListToolbar } from '@/components/ui/ListToolbar';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { residenciasApi } from '@/services/api/residenciasApi';
import { usersApi } from '@/services/api/usersApi';
import type { UserListParams } from '@/services/api/types';

const SORT_OPTIONS = [
  { value: 'nome-asc', label: 'Nome (A-Z)' },
  { value: 'nome-desc', label: 'Nome (Z-A)' },
  { value: 'createdAt-desc', label: 'Mais recentes' },
];

export function MoradoresPage() {
  const residenciasQuery = useQuery({
    queryKey: ['residencias'],
    queryFn: () => residenciasApi.list(),
  });

  const { state, setPage, setSearch, setSort } = useListQueryParams({
    sortBy: 'nome',
    sortOrder: 'asc',
  });

  const [rawSearch, setRawSearch] = useState(state.search);
  const debouncedSearch = useDebouncedValue(rawSearch, 300);

  useEffect(() => {
    if (debouncedSearch !== state.search) setSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const params: Omit<UserListParams, 'roles'> = {
    page: state.page,
    pageSize: state.pageSize,
    sortBy: state.sortBy as UserListParams['sortBy'],
    sortOrder: state.sortOrder,
    search: state.search || undefined,
  };

  const moradoresQuery = useQuery({
    queryKey: ['moradores', params],
    queryFn: () => usersApi.listMoradores(params),
    enabled: Boolean(residenciasQuery.data),
    placeholderData: keepPreviousData,
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

        <Card>
          <ListToolbar
            searchValue={rawSearch}
            onSearchChange={setRawSearch}
            searchLabel="Buscar"
            searchPlaceholder="Nome ou e-mail"
            sortOptions={SORT_OPTIONS}
            sortValue={`${state.sortBy}-${state.sortOrder}`}
            onSortChange={(value) => {
              const [sortBy, sortOrder] = value.split('-') as [string, 'asc' | 'desc'];
              setSort(sortBy, sortOrder);
            }}
          />
        </Card>

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

        {!moradoresQuery.isLoading && !moradoresQuery.isError && moradoresQuery.data?.items.length === 0 && (
          <Card>
            <p className="text-text-secondary">
              {state.search ? 'Nenhum morador encontrado para essa busca.' : 'Nenhum morador cadastrado ainda.'}
            </p>
          </Card>
        )}

        {moradoresQuery.data?.items.map((morador) => (
          <MoradorCard key={morador.id} morador={morador} residencias={residencias} />
        ))}

        {moradoresQuery.data && moradoresQuery.data.totalPages > 1 && (
          <Pagination
            page={moradoresQuery.data.page}
            totalPages={moradoresQuery.data.totalPages}
            total={moradoresQuery.data.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
