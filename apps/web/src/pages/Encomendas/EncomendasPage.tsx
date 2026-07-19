import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { CreateEncomendaForm } from '@/components/Encomendas/CreateEncomendaForm';
import { STATUS_LABELS } from '@/components/Encomendas/encomendaLabels';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListToolbar } from '@/components/ui/ListToolbar';
import { formatResidencia } from '@/components/ui/MoradorSelect';
import { Pagination } from '@/components/ui/Pagination';
import { EncomendaEmptyIllustration } from '@/components/ui/illustrations';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { formatDate } from '@/lib/formatDate';
import { encomendasApi } from '@/services/api/encomendasApi';
import type { EncomendaListParams, EncomendaResponse } from '@/services/api/types';
import { usersApi } from '@/services/api/usersApi';
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
  const queryClient = useQueryClient();

  const { state, setPage, setSearch, setFilter, setSort, clearFilters } = useListQueryParams({
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

  const diretorioQuery = useQuery({
    queryKey: ['moradores-diretorio'],
    queryFn: () => usersApi.listDiretorio(),
    enabled: !isMorador,
  });

  const moradorPorId = useMemo(
    () => new Map((diretorioQuery.data ?? []).map((m) => [m.id, m])),
    [diretorioQuery.data],
  );

  const signMutation = useMutation({
    mutationFn: (id: string) => encomendasApi.sign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encomendas'] });
    },
  });

  const hasActiveFilters = Boolean(state.search || state.filters.status);

  const columns = useMemo<DataTableColumn<EncomendaResponse>[]>(() => {
    const cols: DataTableColumn<EncomendaResponse>[] = [
      {
        key: 'id',
        header: 'Nº',
        mono: true,
        width: '90px',
        render: (row) => `#${row.id.slice(0, 8)}`,
      },
      {
        key: 'descricao',
        header: 'Encomenda',
        render: (row) => (
          <div>
            <p className="font-medium text-text-primary">{row.descricao || 'Encomenda sem descrição'}</p>
            {row.fotoUrl && (
              <a
                href={row.fotoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-primary hover:underline"
              >
                Ver foto
              </a>
            )}
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
        key: 'horarioChegada',
        header: 'Chegou em',
        mono: true,
        width: '150px',
        render: (row) => formatDate(row.horarioChegada),
      },
      {
        key: 'status',
        header: 'Status',
        width: '160px',
        render: (row) => (
          <div>
            <Badge status={row.status}>{STATUS_LABELS[row.status]}</Badge>
            {row.assinado && row.dataAssinatura && (
              <p className="mt-1 text-[11px] text-text-muted">assinada {formatDate(row.dataAssinatura)}</p>
            )}
          </div>
        ),
      },
      {
        key: 'acoes',
        header: 'Ações',
        width: '180px',
        render: (row) =>
          isMorador && !row.assinado ? (
            <Button
              size="sm"
              loading={signMutation.isPending}
              onClick={() => signMutation.mutate(row.id)}
            >
              Confirmar retirada
            </Button>
          ) : null,
      },
    );

    return cols;
  }, [isMorador, moradorPorId, signMutation]);

  return (
    <div className="flex flex-col gap-6">
      {isPorteiro && (
        <div id="create-encomenda-form">
          <CreateEncomendaForm />
        </div>
      )}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          {isMorador ? 'Minhas encomendas' : 'Encomendas do condomínio'}
        </h2>

        <Card padding="none">
          <div className="p-4 md:p-6 md:pb-0">
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
          </div>

          <div className="mt-4 overflow-x-auto">
            {isError ? (
              <p className="p-6 text-danger">Não foi possível carregar as encomendas. Tente recarregar a página.</p>
            ) : (
              <DataTable
                columns={columns}
                rows={data?.items ?? []}
                rowKey={(row) => row.id}
                loading={isLoading}
                emptyState={
                  <EmptyState
                    icon={<EncomendaEmptyIllustration />}
                    title={
                      hasActiveFilters
                        ? 'Nenhuma encomenda encontrada para esses filtros.'
                        : 'Nenhuma encomenda por aqui ainda.'
                    }
                    action={
                      hasActiveFilters
                        ? { label: 'Limpar filtros', onClick: clearFilters }
                        : isPorteiro
                          ? {
                              label: 'Registrar encomenda',
                              onClick: () =>
                                document
                                  .getElementById('create-encomenda-form')
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
