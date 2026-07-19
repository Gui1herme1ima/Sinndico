import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { AreaComumCard } from '@/components/AreasComuns/AreaComumCard';
import { CreateAreaComumForm } from '@/components/AreasComuns/CreateAreaComumForm';
import { ReservaCard } from '@/components/AreasComuns/ReservaCard';
import { Card } from '@/components/ui/Card';
import { ListToolbar } from '@/components/ui/ListToolbar';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { areasComunsApi } from '@/services/api/areasComunsApi';
import { reservasApi } from '@/services/api/reservasApi';
import type { ReservaListParams } from '@/services/api/types';
import { useAuth } from '@/store/useAuth';

const SORT_OPTIONS = [
  { value: 'horaInicio-desc', label: 'Mais recentes' },
  { value: 'horaInicio-asc', label: 'Mais antigas' },
  { value: 'status-asc', label: 'Status' },
];

export function AreasComunsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isMorador = user?.role === 'morador';

  const areasQuery = useQuery({
    queryKey: ['areas-comuns'],
    queryFn: () => areasComunsApi.list(),
  });

  const { state, setPage, setSearch, setFilter, setSort } = useListQueryParams({
    sortBy: 'horaInicio',
    sortOrder: 'desc',
  });

  const [rawSearch, setRawSearch] = useState(state.search);
  const debouncedSearch = useDebouncedValue(rawSearch, 300);

  useEffect(() => {
    if (debouncedSearch !== state.search) setSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const reservaParams: ReservaListParams = {
    page: state.page,
    pageSize: state.pageSize,
    sortBy: state.sortBy as ReservaListParams['sortBy'],
    sortOrder: state.sortOrder,
    search: state.search || undefined,
    status: (state.filters.status as ReservaListParams['status']) || undefined,
  };

  const reservasQuery = useQuery({
    queryKey: ['reservas', reservaParams],
    queryFn: () => reservasApi.list(reservaParams),
    placeholderData: keepPreviousData,
  });

  const hasActiveFilters = Boolean(state.search || state.filters.status);

  const areaNomePorId = new Map((areasQuery.data ?? []).map((area) => [area.id, area.nome]));

  return (
    <div className="flex flex-col gap-6">
      {isAdmin && <CreateAreaComumForm />}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">Áreas comuns</h2>

        {areasQuery.isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {areasQuery.isError && (
          <Card>
            <p className="text-danger">Não foi possível carregar as áreas comuns.</p>
          </Card>
        )}

        {!areasQuery.isLoading && !areasQuery.isError && areasQuery.data?.length === 0 && (
          <Card>
            <p className="text-text-secondary">Nenhuma área comum cadastrada ainda.</p>
          </Card>
        )}

        {areasQuery.data?.map((area) => (
          <AreaComumCard key={area.id} area={area} isAdmin={isAdmin} isMorador={isMorador} />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          {isMorador ? 'Minhas reservas' : 'Reservas'}
        </h2>

        <Card>
          <ListToolbar
            searchValue={rawSearch}
            onSearchChange={setRawSearch}
            searchLabel="Buscar"
            searchPlaceholder="Área comum"
            filters={[
              {
                key: 'status',
                label: 'Status',
                value: state.filters.status ?? '',
                onChange: (value) => setFilter('status', value),
                options: [
                  { value: '', label: 'Todos' },
                  { value: 'pendente', label: 'Pendente' },
                  { value: 'aprovada', label: 'Aprovada' },
                  { value: 'cancelada', label: 'Cancelada' },
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

        {reservasQuery.isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {reservasQuery.isError && (
          <Card>
            <p className="text-danger">Não foi possível carregar as reservas.</p>
          </Card>
        )}

        {!reservasQuery.isLoading && !reservasQuery.isError && reservasQuery.data?.items.length === 0 && (
          <Card>
            <p className="text-text-secondary">
              {hasActiveFilters ? 'Nenhuma reserva encontrada para esses filtros.' : 'Nenhuma reserva por aqui ainda.'}
            </p>
          </Card>
        )}

        {reservasQuery.data?.items.map((reserva) => (
          <ReservaCard
            key={reserva.id}
            reserva={reserva}
            areaNome={areaNomePorId.get(reserva.areaComumId) ?? 'Área removida'}
            isOwner={reserva.moradorId === user?.id}
            isAdmin={isAdmin}
          />
        ))}

        {reservasQuery.data && reservasQuery.data.totalPages > 1 && (
          <Pagination
            page={reservasQuery.data.page}
            totalPages={reservasQuery.data.totalPages}
            total={reservasQuery.data.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
