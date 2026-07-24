import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { ComidaDetail } from '@/components/Comida/ComidaDetail';
import { STATUS_LABELS } from '@/components/Comida/comidaLabels';
import { CreateComidaForm } from '@/components/Comida/CreateComidaForm';
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
import { ComidaEmptyIllustration } from '@/components/ui/illustrations';
import { ComidaIcon, PlusIcon } from '@/components/ui/icons';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { formatDate } from '@/lib/formatDate';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { comidaApi } from '@/services/api/comidaApi';
import type { ComidaListParams, ComidaResponse } from '@/services/api/types';
import { usersApi } from '@/services/api/usersApi';
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
  const queryClient = useQueryClient();

  const { state, setPage, setSearch, setFilter, setSort, clearFilters } = useListQueryParams({
    sortBy: 'horarioChegadaEstimada',
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

  const diretorioQuery = useQuery({
    queryKey: ['moradores-diretorio'],
    queryFn: () => usersApi.listDiretorio(),
    enabled: !isMorador,
  });

  const moradorPorId = useMemo(
    () => new Map((diretorioQuery.data ?? []).map((m) => [m.id, m])),
    [diretorioQuery.data],
  );

  const selected = data?.items.find((item) => item.id === selectedId) ?? null;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['comida'] });
  const aCaminhoMutation = useMutation({ mutationFn: (id: string) => comidaApi.updateStatus(id, 'em-caminho'), onSuccess: invalidate });
  const chegouMutation = useMutation({ mutationFn: (id: string) => comidaApi.updateStatus(id, 'chegou'), onSuccess: invalidate });
  const retiradaMutation = useMutation({ mutationFn: (id: string) => comidaApi.updateStatus(id, 'retirada'), onSuccess: invalidate });
  const pending = aCaminhoMutation.isPending || chegouMutation.isPending || retiradaMutation.isPending;

  const hasActiveFilters = Boolean(state.search || state.filters.status);

  const columns = useMemo<DataTableColumn<ComidaResponse>[]>(() => {
    const cols: DataTableColumn<ComidaResponse>[] = [
      {
        key: 'id',
        header: 'Protocolo',
        width: '100px',
        render: (row) => row.id.slice(0, 8),
      },
      {
        key: 'restaurante',
        header: 'Restaurante',
        render: (row) => (
          <div className="flex items-center gap-3">
            <IconBadge icon={<ComidaIcon width={16} height={16} />} size="sm" className="group-hover:scale-105" />
            <p className="font-medium text-text-primary">{row.restaurante}</p>
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
        key: 'horarioChegadaEstimada',
        header: 'Chegada estimada',
        mono: true,
        width: '160px',
        render: (row) => (
          <span title={formatDate(row.horarioChegadaEstimada)}>{formatRelativeTime(row.horarioChegadaEstimada)}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        width: '150px',
        render: (row) => (
          <Badge status={row.status} dot={row.status === 'pedido-feito' || row.status === 'em-caminho'}>
            {STATUS_LABELS[row.status]}
          </Badge>
        ),
      },
    );

    return cols;
  }, [isMorador, moradorPorId]);

  const rowAccent = (row: ComidaResponse): DataTableAccent | undefined => {
    if (row.status === 'pedido-feito' || row.status === 'em-caminho') return 'accent';
    if (row.status === 'chegou') return 'primary';
    return undefined;
  };

  const podeCadastrar = isMorador || canManage;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <PageHeader
          title={isMorador ? 'Meus pedidos' : 'Pedidos do condomínio'}
          action={
            podeCadastrar && (
              <Button onClick={() => setCreateOpen(true)}>
                <PlusIcon width={16} height={16} />
                Avisar pedido
              </Button>
            )
          }
        />

        <Card padding="none">
          <div className="p-5 md:p-8 md:pb-0">
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
          </div>

          <div className="mt-4 overflow-x-auto">
            {isError ? (
              <p className="p-6 text-danger">Não foi possível carregar os pedidos. Tente recarregar a página.</p>
            ) : (
              <DataTable
                columns={columns}
                rows={data?.items ?? []}
                rowKey={(row) => row.id}
                loading={isLoading}
                onRowClick={(row) => setSelectedId(row.id)}
                selectedRowKey={selectedId ?? undefined}
                rowAccent={rowAccent}
                emptyState={
                  <EmptyState
                    icon={<ComidaEmptyIllustration />}
                    title={
                      hasActiveFilters
                        ? 'Nenhum pedido encontrado para esses filtros.'
                        : 'Nenhum pedido avisado ainda.'
                    }
                    action={
                      hasActiveFilters
                        ? { label: 'Limpar filtros', onClick: clearFilters }
                        : podeCadastrar
                          ? { label: 'Avisar pedido', onClick: () => setCreateOpen(true) }
                          : undefined
                    }
                  />
                }
              />
            )}
          </div>

          {data && (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              pageSize={data.pageSize}
              onPageChange={setPage}
            />
          )}
        </Card>
      </div>

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected ? selected.restaurante : ''}
      >
        {selected && (
          <ComidaDetail
            comida={selected}
            morador={moradorPorId.get(selected.moradorId)}
            isMorador={isMorador}
            canManage={canManage}
            pending={pending}
            onACaminho={() => aCaminhoMutation.mutate(selected.id)}
            onChegou={() => chegouMutation.mutate(selected.id)}
            onRetirada={() => retiradaMutation.mutate(selected.id)}
          />
        )}
      </Drawer>

      {podeCadastrar && (
        <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="Avisar pedido">
          <CreateComidaForm isMorador={isMorador} onSuccess={() => setCreateOpen(false)} />
        </Drawer>
      )}
    </div>
  );
}
