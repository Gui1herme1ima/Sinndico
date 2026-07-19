import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { CreateEncomendaForm } from '@/components/Encomendas/CreateEncomendaForm';
import { EncomendaCard } from '@/components/Encomendas/EncomendaCard';
import { Card } from '@/components/ui/Card';
import { ListToolbar } from '@/components/ui/ListToolbar';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { encomendasApi } from '@/services/api/encomendasApi';
import type { EncomendaListParams } from '@/services/api/types';
import { useAuth } from '@/store/useAuth';

const SORT_OPTIONS = [
  { value: 'horarioChegada-desc', label: 'Mais recentes' },
  { value: 'horarioChegada-asc', label: 'Mais antigas' },
  { value: 'status-asc', label: 'Status' },
];

export function EncomendasPage() {
  const { user } = useAuth();
  const isPorteiro = user?.role === 'porteiro';
  const isMorador = user?.role === 'morador';

  const { state, setPage, setSearch, setFilter, setSort } = useListQueryParams({
    sortBy: 'horarioChegada',
    sortOrder: 'desc',
  });

  const [rawSearch, setRawSearch] = useState(state.search);
  const debouncedSearch = useDebouncedValue(rawSearch, 300);

  useEffect(() => {
    if (debouncedSearch !== state.search) setSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const params: EncomendaListParams = {
    page: state.page,
    pageSize: state.pageSize,
    sortBy: state.sortBy as EncomendaListParams['sortBy'],
    sortOrder: state.sortOrder,
    search: state.search || undefined,
    status: (state.filters.status as EncomendaListParams['status']) || undefined,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['encomendas', params],
    queryFn: () => encomendasApi.list(params),
    placeholderData: keepPreviousData,
  });

  const hasActiveFilters = Boolean(state.search || state.filters.status);

  return (
    <div className="flex flex-col gap-6">
      {isPorteiro && <CreateEncomendaForm />}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          {isMorador ? 'Minhas encomendas' : 'Encomendas do condomínio'}
        </h2>

        <Card>
          <ListToolbar
            searchValue={rawSearch}
            onSearchChange={setRawSearch}
            searchLabel="Buscar"
            searchPlaceholder="Descrição"
            filters={[
              {
                key: 'status',
                label: 'Status',
                value: state.filters.status ?? '',
                onChange: (value) => setFilter('status', value),
                options: [
                  { value: '', label: 'Todos' },
                  { value: 'aguardando', label: 'Aguardando' },
                  { value: 'retirada', label: 'Retirada' },
                ],
              },
            ]}
            sortOptions={SORT_OPTIONS}
            sortValue={`${state.sortBy}-${state.sortOrder}`}
            onSortChange={(value) => {
              const [sortBy, sortOrder] = value.split('-') as [string, 'asc' | 'desc'];
              setSort(sortBy, sortOrder);
            }}
          />
        </Card>

        {isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        )}

        {isError && (
          <Card>
            <p className="text-danger">
              Não foi possível carregar as encomendas. Tente recarregar a página.
            </p>
          </Card>
        )}

        {!isLoading && !isError && data && data.items.length === 0 && (
          <Card>
            <p className="text-text-secondary">
              {hasActiveFilters
                ? 'Nenhuma encomenda encontrada para esses filtros.'
                : 'Nenhuma encomenda por aqui ainda.'}
            </p>
          </Card>
        )}

        {data?.items.map((encomenda) => (
          <EncomendaCard key={encomenda.id} encomenda={encomenda} canSign={isMorador} />
        ))}

        {data && data.totalPages > 1 && (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
