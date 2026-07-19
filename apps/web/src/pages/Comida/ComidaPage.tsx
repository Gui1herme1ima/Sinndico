import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { STATUS_LABELS } from '@/components/Comida/comidaLabels';
import { CreateComidaForm } from '@/components/Comida/CreateComidaForm';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListToolbar } from '@/components/ui/ListToolbar';
import { formatResidencia } from '@/components/ui/MoradorSelect';
import { Pagination } from '@/components/ui/Pagination';
import { ComidaEmptyIllustration } from '@/components/ui/illustrations';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { formatDate } from '@/lib/formatDate';
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
        header: 'Nº',
        mono: true,
        render: (row) => `#${row.id.slice(0, 8)}`,
      },
      {
        key: 'restaurante',
        header: 'Restaurante',
        render: (row) => <p className="font-medium text-text-primary">{row.restaurante}</p>,
      },
    ];

    if (!isMorador) {
      cols.push({
        key: 'morador',
        header: 'Morador',
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
        render: (row) => formatDate(row.horarioChegadaEstimada),
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => <Badge status={row.status}>{STATUS_LABELS[row.status]}</Badge>,
      },
      {
        key: 'acoes',
        header: 'Ações',
        render: (row) => (
          <div className="flex flex-wrap gap-2">
            {isMorador && row.status === 'pedido-feito' && (
              <Button size="sm" loading={pending} onClick={() => aCaminhoMutation.mutate(row.id)}>
                Pedido a caminho
              </Button>
            )}
            {isMorador && row.status === 'chegou' && (
              <Button size="sm" loading={pending} onClick={() => retiradaMutation.mutate(row.id)}>
                Confirmar retirada
              </Button>
            )}
            {canManage && (row.status === 'pedido-feito' || row.status === 'em-caminho') && (
              <Button size="sm" loading={pending} onClick={() => chegouMutation.mutate(row.id)}>
                Confirmar chegada
              </Button>
            )}
          </div>
        ),
      },
    );

    return cols;
  }, [isMorador, canManage, moradorPorId, pending, aCaminhoMutation, chegouMutation, retiradaMutation]);

  return (
    <div className="flex flex-col gap-6">
      {(isMorador || canManage) && (
        <div id="create-comida-form">
          <CreateComidaForm isMorador={isMorador} />
        </div>
      )}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          {isMorador ? 'Meus pedidos' : 'Pedidos do condomínio'}
        </h2>

        <Card padding="none">
          <div className="p-4 md:p-6 md:pb-0">
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
                        : isMorador || canManage
                          ? {
                              label: 'Avisar pedido',
                              onClick: () =>
                                document
                                  .getElementById('create-comida-form')
                                  ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
                            }
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
    </div>
  );
}
