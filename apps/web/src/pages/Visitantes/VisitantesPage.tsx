import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { CreateVisitanteForm } from '@/components/Visitantes/CreateVisitanteForm';
import { VisitanteDetail } from '@/components/Visitantes/VisitanteDetail';
import { displayStatus } from '@/components/Visitantes/visitanteLabels';
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
import { VisitanteEmptyIllustration } from '@/components/ui/illustrations';
import { PlusIcon, VisitanteIcon } from '@/components/ui/icons';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { formatDate } from '@/lib/formatDate';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import type { VisitanteListParams, VisitanteResponse } from '@/services/api/types';
import { usersApi } from '@/services/api/usersApi';
import { visitantesApi } from '@/services/api/visitantesApi';
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
  const queryClient = useQueryClient();

  const { state, setPage, setSearch, setFilter, setSort, clearFilters } = useListQueryParams({
    sortBy: 'dataVisita',
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

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['visitantes'] });
  const entradaMutation = useMutation({ mutationFn: (id: string) => visitantesApi.registrarEntrada(id), onSuccess: invalidate });
  const saidaMutation = useMutation({ mutationFn: (id: string) => visitantesApi.registrarSaida(id), onSuccess: invalidate });
  const bloquearMutation = useMutation({
    mutationFn: (id: string) => visitantesApi.updateStatus(id, 'bloqueado'),
    onSuccess: invalidate,
  });
  const pending = entradaMutation.isPending || saidaMutation.isPending || bloquearMutation.isPending;

  const hasActiveFilters = Boolean(state.search || state.filters.status);

  const columns = useMemo<DataTableColumn<VisitanteResponse>[]>(() => {
    const cols: DataTableColumn<VisitanteResponse>[] = [
      {
        key: 'id',
        header: 'Protocolo',
        width: '100px',
        render: (row) => row.id.slice(0, 8),
      },
      {
        key: 'nomeVisitante',
        header: 'Visitante',
        render: (row) => (
          <div className="flex items-center gap-3">
            <IconBadge icon={<VisitanteIcon width={16} height={16} />} size="sm" className="group-hover:scale-105" />
            <div>
              <p className="font-medium text-text-primary">{row.nomeVisitante}</p>
              <p className="text-xs text-text-secondary">
                {[row.rg && `RG ${row.rg}`, row.placaVeiculo].filter(Boolean).join(' · ')}
              </p>
            </div>
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
        key: 'dataVisita',
        header: 'Visita',
        mono: true,
        width: '170px',
        render: (row) => (
          <>
            <span title={formatDate(row.dataVisita)}>{formatRelativeTime(row.dataVisita)}</span>
            {row.horaEntrada && (
              <span className="block text-[11px] text-text-muted" title={formatDate(row.horaEntrada)}>
                entrada {formatRelativeTime(row.horaEntrada)}
              </span>
            )}
            {row.horaSaida && (
              <span className="block text-[11px] text-text-muted" title={formatDate(row.horaSaida)}>
                saída {formatRelativeTime(row.horaSaida)}
              </span>
            )}
          </>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        width: '130px',
        render: (row) => {
          const { status, label } = displayStatus(row);
          return (
            <Badge status={status} dot={status === 'ativo'}>
              {label}
            </Badge>
          );
        },
      },
    );

    return cols;
  }, [isMorador, moradorPorId]);

  const rowAccent = (row: VisitanteResponse): DataTableAccent | undefined => {
    const { status } = displayStatus(row);
    if (status === 'ativo') return 'primary';
    if (status === 'bloqueado') return 'danger';
    if (status === 'aprovado') return 'accent';
    return undefined;
  };

  const podeCadastrar = isMorador || canManage;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <PageHeader
          title={isMorador ? 'Meus visitantes' : 'Visitantes do condomínio'}
          action={
            podeCadastrar && (
              <Button onClick={() => setCreateOpen(true)}>
                <PlusIcon width={16} height={16} />
                Cadastrar visitante
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
          </div>

          <div className="mt-4 overflow-x-auto">
            {isError ? (
              <p className="p-6 text-danger">Não foi possível carregar os visitantes. Tente recarregar a página.</p>
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
                    icon={<VisitanteEmptyIllustration />}
                    title={
                      hasActiveFilters
                        ? 'Nenhum visitante encontrado para esses filtros.'
                        : 'Nenhum visitante registrado ainda.'
                    }
                    action={
                      hasActiveFilters
                        ? { label: 'Limpar filtros', onClick: clearFilters }
                        : podeCadastrar
                          ? { label: 'Registrar visitante', onClick: () => setCreateOpen(true) }
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
        title={selected ? selected.nomeVisitante : ''}
      >
        {selected && (
          <VisitanteDetail
            visitante={selected}
            morador={moradorPorId.get(selected.moradorId)}
            canManage={canManage}
            pending={pending}
            onEntrada={() => entradaMutation.mutate(selected.id)}
            onSaida={() => saidaMutation.mutate(selected.id)}
            onBloquear={() => bloquearMutation.mutate(selected.id)}
          />
        )}
      </Drawer>

      {podeCadastrar && (
        <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="Novo visitante">
          <CreateVisitanteForm isMorador={isMorador} onSuccess={() => setCreateOpen(false)} />
        </Drawer>
      )}
    </div>
  );
}
