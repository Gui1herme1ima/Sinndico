import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { CreateVisitanteForm } from '@/components/Visitantes/CreateVisitanteForm';
import { VisitanteCard } from '@/components/Visitantes/VisitanteCard';
import { Card } from '@/components/ui/Card';
import { ListToolbar } from '@/components/ui/ListToolbar';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { visitantesApi } from '@/services/api/visitantesApi';
import type { VisitanteListParams } from '@/services/api/types';
import { useAuth } from '@/store/useAuth';

const SORT_OPTIONS = [
  { value: 'dataVisita-desc', label: 'Mais recentes' },
  { value: 'dataVisita-asc', label: 'Mais antigas' },
  { value: 'status-asc', label: 'Status' },
];

export function VisitantesPage() {
  const { user } = useAuth();
  const isMorador = user?.role === 'morador';
  const canManage = user?.role === 'admin' || user?.role === 'porteiro';

  const { state, setPage, setSearch, setFilter, setSort } = useListQueryParams({
    sortBy: 'dataVisita',
    sortOrder: 'desc',
  });

  const [rawSearch, setRawSearch] = useState(state.search);
  const debouncedSearch = useDebouncedValue(rawSearch, 300);

  useEffect(() => {
    if (debouncedSearch !== state.search) setSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const params: VisitanteListParams = {
    page: state.page,
    pageSize: state.pageSize,
    sortBy: state.sortBy as VisitanteListParams['sortBy'],
    sortOrder: state.sortOrder,
    search: state.search || undefined,
    status: (state.filters.status as VisitanteListParams['status']) || undefined,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['visitantes', params],
    queryFn: () => visitantesApi.list(params),
    placeholderData: keepPreviousData,
  });

  const hasActiveFilters = Boolean(state.search || state.filters.status);

  return (
    <div className="flex flex-col gap-6">
      {isMorador && <CreateVisitanteForm />}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          {isMorador ? 'Meus visitantes' : 'Visitantes do condomínio'}
        </h2>

        <Card>
          <ListToolbar
            searchValue={rawSearch}
            onSearchChange={setRawSearch}
            searchLabel="Buscar"
            searchPlaceholder="Nome do visitante"
            filters={[
              {
                key: 'status',
                label: 'Status',
                value: state.filters.status ?? '',
                onChange: (value) => setFilter('status', value),
                options: [
                  { value: '', label: 'Todos' },
                  { value: 'aprovado', label: 'Aprovado' },
                  { value: 'ativo', label: 'Ativo' },
                  { value: 'bloqueado', label: 'Bloqueado' },
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
              Não foi possível carregar os visitantes. Tente recarregar a página.
            </p>
          </Card>
        )}

        {!isLoading && !isError && data && data.items.length === 0 && (
          <Card>
            <p className="text-text-secondary">
              {hasActiveFilters
                ? 'Nenhum visitante encontrado para esses filtros.'
                : 'Nenhum visitante registrado ainda.'}
            </p>
          </Card>
        )}

        {data?.items.map((visitante) => (
          <VisitanteCard key={visitante.id} visitante={visitante} canManage={canManage} />
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
