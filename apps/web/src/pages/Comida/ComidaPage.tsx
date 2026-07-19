import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { ComidaCard } from '@/components/Comida/ComidaCard';
import { CreateComidaForm } from '@/components/Comida/CreateComidaForm';
import { Card } from '@/components/ui/Card';
import { ListToolbar } from '@/components/ui/ListToolbar';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { comidaApi } from '@/services/api/comidaApi';
import type { ComidaListParams } from '@/services/api/types';
import { useAuth } from '@/store/useAuth';

const SORT_OPTIONS = [
  { value: 'horarioChegadaEstimada-desc', label: 'Mais recentes' },
  { value: 'horarioChegadaEstimada-asc', label: 'Mais antigos' },
  { value: 'status-asc', label: 'Status' },
];

export function ComidaPage() {
  const { user } = useAuth();
  const isMorador = user?.role === 'morador';
  const canManage = user?.role === 'admin' || user?.role === 'porteiro';

  const { state, setPage, setSearch, setFilter, setSort } = useListQueryParams({
    sortBy: 'horarioChegadaEstimada',
    sortOrder: 'desc',
  });

  const [rawSearch, setRawSearch] = useState(state.search);
  const debouncedSearch = useDebouncedValue(rawSearch, 300);

  useEffect(() => {
    if (debouncedSearch !== state.search) setSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const params: ComidaListParams = {
    page: state.page,
    pageSize: state.pageSize,
    sortBy: state.sortBy as ComidaListParams['sortBy'],
    sortOrder: state.sortOrder,
    search: state.search || undefined,
    status: (state.filters.status as ComidaListParams['status']) || undefined,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['comida', params],
    queryFn: () => comidaApi.list(params),
    placeholderData: keepPreviousData,
  });

  const hasActiveFilters = Boolean(state.search || state.filters.status);

  return (
    <div className="flex flex-col gap-6">
      {(isMorador || canManage) && <CreateComidaForm isMorador={isMorador} />}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          {isMorador ? 'Meus pedidos' : 'Pedidos do condomínio'}
        </h2>

        <Card>
          <ListToolbar
            searchValue={rawSearch}
            onSearchChange={setRawSearch}
            searchLabel="Buscar"
            searchPlaceholder="Restaurante"
            filters={[
              {
                key: 'status',
                label: 'Status',
                value: state.filters.status ?? '',
                onChange: (value) => setFilter('status', value),
                options: [
                  { value: '', label: 'Todos' },
                  { value: 'pedido-feito', label: 'Pedido feito' },
                  { value: 'em-caminho', label: 'Em caminho' },
                  { value: 'chegou', label: 'Chegou' },
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
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {isError && (
          <Card>
            <p className="text-danger">Não foi possível carregar os pedidos. Tente recarregar a página.</p>
          </Card>
        )}

        {!isLoading && !isError && data && data.items.length === 0 && (
          <Card>
            <p className="text-text-secondary">
              {hasActiveFilters ? 'Nenhum pedido encontrado para esses filtros.' : 'Nenhum pedido avisado ainda.'}
            </p>
          </Card>
        )}

        {data?.items.map((comida) => (
          <ComidaCard key={comida.id} comida={comida} isMorador={isMorador} canManage={canManage} />
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
