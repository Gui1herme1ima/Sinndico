import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { AreaComumCard } from '@/components/AreasComuns/AreaComumCard';
import { CreateAreaComumForm } from '@/components/AreasComuns/CreateAreaComumForm';
import { ReservaDetail } from '@/components/AreasComuns/ReservaDetail';
import { STATUS_LABELS } from '@/components/AreasComuns/reservaLabels';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable, type DataTableAccent, type DataTableColumn } from '@/components/ui/DataTable';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconBadge } from '@/components/ui/IconBadge';
import { ListToolbar } from '@/components/ui/ListToolbar';
import { formatResidencia } from '@/components/ui/MoradorSelect';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { ReservaEmptyIllustration } from '@/components/ui/illustrations';
import { AreaComumIcon, PlusIcon } from '@/components/ui/icons';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { formatDate } from '@/lib/formatDate';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { areasComunsApi } from '@/services/api/areasComunsApi';
import { reservasApi } from '@/services/api/reservasApi';
import type { ReservaListParams, ReservaResponse } from '@/services/api/types';
import { usersApi } from '@/services/api/usersApi';
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
  const queryClient = useQueryClient();

  const areasQuery = useQuery({
    queryKey: ['areas-comuns'],
    queryFn: () => areasComunsApi.list(),
  });

  const { state, setPage, setSearch, setFilter, setSort, clearFilters } = useListQueryParams({
    sortBy: 'horaInicio',
    sortOrder: 'desc',
  });

  const [rawSearch, setRawSearch] = useState(state.search);
  const debouncedSearch = useDebouncedValue(rawSearch, 300);

  useEffect(() => {
    if (debouncedSearch !== state.search) setSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

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

  const diretorioQuery = useQuery({
    queryKey: ['moradores-diretorio'],
    queryFn: () => usersApi.listDiretorio(),
    enabled: !isMorador,
  });

  const moradorPorId = useMemo(
    () => new Map((diretorioQuery.data ?? []).map((m) => [m.id, m])),
    [diretorioQuery.data],
  );

  const selected = reservasQuery.data?.items.find((item) => item.id === selectedId) ?? null;

  const hasActiveFilters = Boolean(state.search || state.filters.status);

  const areaNomePorId = new Map((areasQuery.data ?? []).map((area) => [area.id, area.nome]));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['reservas'] });
  const aprovarMutation = useMutation({ mutationFn: (id: string) => reservasApi.updateStatus(id, 'aprovada'), onSuccess: invalidate });
  const cancelarMutation = useMutation({ mutationFn: (id: string) => reservasApi.updateStatus(id, 'cancelada'), onSuccess: invalidate });
  const pending = aprovarMutation.isPending || cancelarMutation.isPending;

  const columns = useMemo<DataTableColumn<ReservaResponse>[]>(() => {
    const cols: DataTableColumn<ReservaResponse>[] = [
      {
        key: 'area',
        header: 'Área',
        render: (row) => (
          <div className="flex items-center gap-3">
            <IconBadge icon={<AreaComumIcon width={16} height={16} />} size="sm" className="group-hover:scale-105" />
            <p className="font-medium text-text-primary">{areaNomePorId.get(row.areaComumId) ?? 'Área removida'}</p>
          </div>
        ),
      },
    ];

    if (!isMorador) {
      cols.push({
        key: 'morador',
        header: 'Morador',
        width: '200px',
        render: (row) => {
          const morador = moradorPorId.get(row.moradorId);
          return (
            <div className="text-text-secondary">
              <p>{morador?.nome ?? 'Morador removido'}</p>
              {morador && (
                <small className="block font-mono text-[11px] text-text-muted">
                  {formatResidencia(morador.residencia)}
                </small>
              )}
            </div>
          );
        },
      });
    }

    cols.push(
      {
        key: 'periodo',
        header: 'Período',
        mono: true,
        width: '170px',
        render: (row) => (
          <>
            <span title={formatDate(row.horaInicio)}>{formatRelativeTime(row.horaInicio)}</span>
            <span className="block text-[11px] text-text-muted" title={formatDate(row.horaFim)}>
              até {formatRelativeTime(row.horaFim)}
            </span>
          </>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        width: '130px',
        render: (row) => (
          <Badge status={row.status} dot={row.status === 'pendente'}>
            {STATUS_LABELS[row.status]}
          </Badge>
        ),
      },
    );

    return cols;
  }, [isMorador, moradorPorId, areaNomePorId]);

  const rowAccent = (row: ReservaResponse): DataTableAccent | undefined => {
    if (row.status === 'pendente') return 'accent';
    if (row.status === 'aprovada') return 'primary';
    return undefined;
  };

  return (
    <div className="flex flex-col gap-6">
      <div id="areas-comuns-list" className="flex flex-col gap-4">
        <PageHeader
          title="Áreas comuns"
          action={
            isAdmin && (
              <Button onClick={() => setCreateOpen(true)}>
                <PlusIcon width={16} height={16} />
                Nova área comum
              </Button>
            )
          }
        />

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

        <Card padding="none">
          <div className="p-5 md:p-8 md:pb-0">
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
          </div>

          <div className="mt-4 overflow-x-auto">
            {reservasQuery.isError ? (
              <p className="p-6 text-danger">Não foi possível carregar as reservas. Tente recarregar a página.</p>
            ) : (
              <DataTable
                columns={columns}
                rows={reservasQuery.data?.items ?? []}
                rowKey={(row) => row.id}
                loading={reservasQuery.isLoading}
                onRowClick={(row) => setSelectedId(row.id)}
                selectedRowKey={selectedId ?? undefined}
                rowAccent={rowAccent}
                emptyState={
                  <EmptyState
                    icon={<ReservaEmptyIllustration />}
                    title={
                      hasActiveFilters ? 'Nenhuma reserva encontrada para esses filtros.' : 'Nenhuma reserva por aqui ainda.'
                    }
                    action={
                      hasActiveFilters
                        ? { label: 'Limpar filtros', onClick: clearFilters }
                        : isMorador
                          ? {
                              label: 'Ver áreas disponíveis',
                              onClick: () =>
                                document
                                  .getElementById('areas-comuns-list')
                                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
                            }
                          : undefined
                    }
                  />
                }
              />
            )}
          </div>

          {reservasQuery.data && (
            <Pagination
              page={reservasQuery.data.page}
              totalPages={reservasQuery.data.totalPages}
              total={reservasQuery.data.total}
              pageSize={reservasQuery.data.pageSize}
              onPageChange={setPage}
            />
          )}
        </Card>
      </div>

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected ? areaNomePorId.get(selected.areaComumId) ?? 'Área removida' : ''}
      >
        {selected && (
          <ReservaDetail
            reserva={selected}
            morador={moradorPorId.get(selected.moradorId)}
            podeAprovar={isAdmin && selected.status === 'pendente'}
            podeCancelar={selected.status !== 'cancelada' && (isAdmin || selected.moradorId === user?.id)}
            pending={pending}
            onAprovar={() => aprovarMutation.mutate(selected.id)}
            onCancelar={() => cancelarMutation.mutate(selected.id)}
          />
        )}
      </Drawer>

      {isAdmin && (
        <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="Nova área comum">
          <CreateAreaComumForm onSuccess={() => setCreateOpen(false)} />
        </Drawer>
      )}
    </div>
  );
}
