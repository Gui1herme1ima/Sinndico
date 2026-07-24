import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { CreateSolicitacaoForm } from '@/components/Solicitacoes/CreateSolicitacaoForm';
import { SolicitacaoDetail } from '@/components/Solicitacoes/SolicitacaoDetail';
import { CATEGORIA_LABELS, PRIORIDADE_LABELS, STATUS_LABELS } from '@/components/Solicitacoes/solicitacaoLabels';
import { StatTile } from '@/components/Dashboard/StatTile';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable, type DataTableAccent, type DataTableColumn } from '@/components/ui/DataTable';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconBadge } from '@/components/ui/IconBadge';
import { ListToolbar } from '@/components/ui/ListToolbar';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SolicitacaoEmptyIllustration } from '@/components/ui/illustrations';
import { PlusIcon, SolicitacaoManutencaoIcon } from '@/components/ui/icons';
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
  const [createOpen, setCreateOpen] = useState(false);

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

  const abertasQuery = useQuery({
    queryKey: ['solicitacoes-count', 'aberto'],
    queryFn: () => solicitacoesApi.list({ page: 1, pageSize: 1, status: 'aberto' }),
  });
  const emProgressoQuery = useQuery({
    queryKey: ['solicitacoes-count', 'em-progresso'],
    queryFn: () => solicitacoesApi.list({ page: 1, pageSize: 1, status: 'em-progresso' }),
  });
  const resolvidasQuery = useQuery({
    queryKey: ['solicitacoes-count', 'resolvido'],
    queryFn: () => solicitacoesApi.list({ page: 1, pageSize: 1, status: 'resolvido' }),
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
          <div className="flex items-center gap-3">
            <IconBadge
              icon={<SolicitacaoManutencaoIcon width={16} height={16} />}
              size="sm"
              className="group-hover:scale-105"
            />
            <div>
              <p className="font-medium text-text-primary">{row.titulo}</p>
              <p className="text-xs text-text-secondary">{CATEGORIA_LABELS[row.categoria]}</p>
            </div>
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
        render: (row) => (
          <Badge status={row.status} dot={row.status !== 'resolvido'}>
            {STATUS_LABELS[row.status]}
          </Badge>
        ),
      },
    );

    return cols;
  }, [isAdmin, moradorPorId]);

  const rowAccent = (row: SolicitacaoResponse): DataTableAccent | undefined => {
    if (row.prioridade === 'alta') return 'danger';
    if (row.prioridade === 'media') return 'accent';
    return undefined;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <PageHeader
          title={isAdmin ? 'Solicitações do condomínio' : 'Minhas solicitações'}
          action={
            !isAdmin && (
              <Button onClick={() => setCreateOpen(true)}>
                <PlusIcon width={16} height={16} />
                Nova solicitação
              </Button>
            )
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile
            tint="accent"
            icon={<SolicitacaoManutencaoIcon width={22} height={22} />}
            value={abertasQuery.data?.total ?? 0}
            label="abertas"
            foot="aguardando resposta"
          />
          <StatTile
            tint="primary"
            icon={<SolicitacaoManutencaoIcon width={22} height={22} />}
            value={emProgressoQuery.data?.total ?? 0}
            label="em progresso"
            foot="já sendo resolvidas"
          />
          <StatTile
            tint="accent"
            icon={<SolicitacaoManutencaoIcon width={22} height={22} />}
            value={resolvidasQuery.data?.total ?? 0}
            label="resolvidas"
            foot="atendidas até aqui"
          />
        </div>

        <Card padding="none">
          <div className="p-5 md:p-8 md:pb-0">
            <ListToolbar
              searchValue={rawSearch}
              onSearchChange={setRawSearch}
              searchLabel="Buscar"
              searchPlaceholder="Título ou descrição"
              resultCount={data?.total}
              resultLabel="solicitações"
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
                rowAccent={rowAccent}
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
                          ? { label: 'Nova solicitação', onClick: () => setCreateOpen(true) }
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
        title={selected ? `Solicitação ${selected.id.slice(0, 8)}` : ''}
        titleContent={
          selected && (
            <div className="flex items-center gap-3">
              <IconBadge icon={<SolicitacaoManutencaoIcon width={18} height={18} />} />
              <div>
                <span className="block text-xs font-medium text-text-muted">Solicitação</span>
                <span className="block font-display text-lg font-semibold text-text-primary">
                  {selected.id.slice(0, 8)}
                </span>
              </div>
            </div>
          )
        }
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

      {!isAdmin && (
        <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="Nova solicitação">
          <CreateSolicitacaoForm onSuccess={() => setCreateOpen(false)} />
        </Drawer>
      )}
    </div>
  );
}
