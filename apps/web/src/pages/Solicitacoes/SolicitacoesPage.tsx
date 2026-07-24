import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { CreateSolicitacaoForm } from '@/components/Solicitacoes/CreateSolicitacaoForm';
import { SolicitacaoDetail } from '@/components/Solicitacoes/SolicitacaoDetail';
import { CATEGORIA_LABELS, PRIORIDADE_LABELS, STATUS_LABELS } from '@/components/Solicitacoes/solicitacaoLabels';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListToolbar } from '@/components/ui/ListToolbar';
import { Pagination } from '@/components/ui/Pagination';
import { SolicitacaoEmptyIllustration } from '@/components/ui/illustrations';
import { formatResidencia } from '@/components/ui/MoradorSelect';
import { formatDate } from '@/lib/formatDate';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { solicitacoesApi } from '@/services/api/solicitacoesApi';
import { usersApi } from '@/services/api/usersApi';
import type { SolicitacaoListParams, SolicitacaoPrioridade, SolicitacaoResponse, SolicitacaoStatus } from '@/services/api/types';
import { useAuth } from '@/store/useAuth';

const SORT_OPTIONS = [
  { value: 'dataCriacao-desc', label: 'Mais recentes' },
  { value: 'dataCriacao-asc', label: 'Mais antigas' },
  { value: 'prioridade-desc', label: 'Prioridade' },
  { value: 'status-asc', label: 'Status' },
];

export function SolicitacoesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const queryClient = useQueryClient();

  const { state, setPage, setSearch, setFilter, setSort, clearFilters } = useListQueryParams({
    sortBy: 'dataCriacao',
    sortOrder: 'desc',
  });

  const [rawSearch, setRawSearch] = useState(state.search);
  const debouncedSearch = useDebouncedValue(rawSearch, 300);

  useEffect(() => {
    if (debouncedSearch !== state.search) setSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const params: SolicitacaoListParams = {
    page: state.page,
    pageSize: state.pageSize,
    sortBy: state.sortBy as SolicitacaoListParams['sortBy'],
    sortOrder: state.sortOrder,
    search: state.search || undefined,
    status: (state.filters.status as SolicitacaoListParams['status']) || undefined,
    categoria: (state.filters.categoria as SolicitacaoListParams['categoria']) || undefined,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['solicitacoes', params],
    queryFn: () => solicitacoesApi.list(params),
    placeholderData: keepPreviousData,
  });

  const diretorioQuery = useQuery({
    queryKey: ['moradores-diretorio'],
    queryFn: () => usersApi.listDiretorio(),
    enabled: isAdmin,
  });

  const moradorPorId = useMemo(
    () => new Map((diretorioQuery.data ?? []).map((m) => [m.id, m])),
    [diretorioQuery.data],
  );

  const selected = data?.items.find((item) => item.id === selectedId) ?? null;

  const mutation = useMutation({
    mutationFn: (payload: { id: string; status?: SolicitacaoStatus; prioridade?: SolicitacaoPrioridade }) =>
      solicitacoesApi.update(payload.id, { status: payload.status, prioridade: payload.prioridade }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
    },
  });

  const hasActiveFilters = Boolean(state.search || state.filters.status || state.filters.categoria);

  const columns = useMemo<DataTableColumn<SolicitacaoResponse>[]>(() => {
    const cols: DataTableColumn<SolicitacaoResponse>[] = [
      {
        key: 'id',
        header: 'Protocolo',
        width: '100px',
        render: (row) => row.id.slice(0, 8),
      },
      {
        key: 'titulo',
        header: 'Solicitação',
        render: (row) => (
          <div>
            <p className="font-medium text-text-primary">{row.titulo}</p>
            <p className="text-xs text-text-secondary">{CATEGORIA_LABELS[row.categoria]}</p>
          </div>
        ),
      },
    ];

    if (isAdmin) {
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
        key: 'dataCriacao',
        header: 'Criada em',
        mono: true,
        width: '150px',
        render: (row) => (
          <>
            <span title={formatDate(row.dataCriacao)}>{formatRelativeTime(row.dataCriacao)}</span>
            {row.dataResolvimento && (
              <span className="block text-[11px] text-text-muted" title={formatDate(row.dataResolvimento)}>
                resolvido {formatRelativeTime(row.dataResolvimento)}
              </span>
            )}
          </>
        ),
      },
      {
        key: 'prioridade',
        header: 'Prioridade',
        width: '130px',
        render: (row) => <Badge status={row.prioridade}>{PRIORIDADE_LABELS[row.prioridade]}</Badge>,
      },
      {
        key: 'status',
        header: 'Status',
        width: '130px',
        render: (row) => <Badge status={row.status}>{STATUS_LABELS[row.status]}</Badge>,
      },
    );

    return cols;
  }, [isAdmin, moradorPorId]);

  return (
    <div className="flex flex-col gap-6">
      {!isAdmin && (
        <div id="create-solicitacao-form">
          <CreateSolicitacaoForm />
        </div>
      )}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          {isAdmin ? 'Solicitações do condomínio' : 'Minhas solicitações'}
        </h2>

        <Card padding="none">
          <div className="p-5 md:p-8 md:pb-0">
            <ListToolbar
              searchValue={rawSearch}
              onSearchChange={setRawSearch}
              searchLabel="Buscar"
              searchPlaceholder="Título ou descrição"
              filters={[
                {
                  key: 'status',
                  label: 'Status',
                  value: state.filters.status ?? '',
                  onChange: (value) => setFilter('status', value),
                  options: [
                    { value: '', label: 'Todos' },
                    { value: 'aberto', label: 'Aberto' },
                    { value: 'em-progresso', label: 'Em progresso' },
                    { value: 'resolvido', label: 'Resolvido' },
                  ],
                },
                {
                  key: 'categoria',
                  label: 'Categoria',
                  value: state.filters.categoria ?? '',
                  onChange: (value) => setFilter('categoria', value),
                  options: [
                    { value: '', label: 'Todas' },
                    { value: 'manutencao', label: 'Manutenção' },
                    { value: 'seguranca', label: 'Segurança' },
                    { value: 'animal', label: 'Animal' },
                    { value: 'outra', label: 'Outra' },
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
              <p className="p-6 text-danger">Não foi possível carregar as solicitações. Tente recarregar a página.</p>
            ) : (
              <DataTable
                columns={columns}
                rows={data?.items ?? []}
                rowKey={(row) => row.id}
                loading={isLoading}
                onRowClick={(row) => setSelectedId(row.id)}
                selectedRowKey={selectedId ?? undefined}
                emptyState={
                  <EmptyState
                    icon={<SolicitacaoEmptyIllustration />}
                    title={
                      hasActiveFilters
                        ? 'Nenhuma solicitação encontrada para esses filtros.'
                        : 'Nenhuma solicitação por aqui ainda.'
                    }
                    action={
                      hasActiveFilters
                        ? { label: 'Limpar filtros', onClick: clearFilters }
                        : !isAdmin
                          ? {
                              label: 'Nova solicitação',
                              onClick: () =>
                                document
                                  .getElementById('create-solicitacao-form')
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

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected ? `Solicitação #${selected.id.slice(0, 8)}` : ''}
      >
        {selected && (
          <SolicitacaoDetail
            solicitacao={selected}
            morador={moradorPorId.get(selected.moradorId)}
            isAdmin={isAdmin}
            pending={mutation.isPending}
            onChangeStatus={(status) => mutation.mutate({ id: selected.id, status })}
            onChangePrioridade={(prioridade) => mutation.mutate({ id: selected.id, prioridade })}
          />
        )}
      </Drawer>
    </div>
  );
}
