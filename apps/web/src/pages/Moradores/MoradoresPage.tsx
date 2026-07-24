import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { CreateMoradorForm } from '@/components/Moradores/CreateMoradorForm';
import { ImportarMoradoresButton } from '@/components/Moradores/ImportarMoradoresButton';
import { MoradorDetail } from '@/components/Moradores/MoradorDetail';
import { StatTile } from '@/components/Dashboard/StatTile';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconBadge } from '@/components/ui/IconBadge';
import { ListToolbar } from '@/components/ui/ListToolbar';
import { formatResidencia } from '@/components/ui/MoradorSelect';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { MoradorEmptyIllustration } from '@/components/ui/illustrations';
import { PlusIcon, ResidenciaIcon, UserIcon } from '@/components/ui/icons';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { residenciasApi } from '@/services/api/residenciasApi';
import { usersApi } from '@/services/api/usersApi';
import type { MoradorResponse, UserListParams } from '@/services/api/types';

const SORT_OPTIONS = [
  { value: 'nome-asc', label: 'Nome (A-Z)' },
  { value: 'nome-desc', label: 'Nome (Z-A)' },
  { value: 'createdAt-desc', label: 'Mais recentes' },
];

export function MoradoresPage() {
  const residenciasQuery = useQuery({
    queryKey: ['residencias'],
    queryFn: () => residenciasApi.list(),
  });

  const queryClient = useQueryClient();

  const { state, setPage, setSearch, setSort, clearFilters } = useListQueryParams({
    sortBy: 'nome',
    sortOrder: 'asc',
  });

  const [rawSearch, setRawSearch] = useState(state.search);
  const debouncedSearch = useDebouncedValue(rawSearch, 300);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (debouncedSearch !== state.search) setSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const params: Omit<UserListParams, 'roles'> = {
    page: state.page,
    pageSize: state.pageSize,
    sortBy: state.sortBy as UserListParams['sortBy'],
    sortOrder: state.sortOrder,
    search: state.search || undefined,
  };

  const moradoresQuery = useQuery({
    queryKey: ['moradores', params],
    queryFn: () => usersApi.listMoradores(params),
    enabled: Boolean(residenciasQuery.data),
    placeholderData: keepPreviousData,
  });

  const selected = moradoresQuery.data?.items.find((item) => item.id === selectedId) ?? null;

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; nome: string; telefone?: string; residenciaId: string }) =>
      usersApi.updateMorador(payload.id, {
        nome: payload.nome,
        telefone: payload.telefone,
        residenciaId: payload.residenciaId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moradores'] });
      setSelectedId(null);
    },
  });

  const columns = useMemo<DataTableColumn<MoradorResponse>[]>(
    () => [
      {
        key: 'nome',
        header: 'Nome',
        render: (row) => (
          <div className="flex items-center gap-3">
            <IconBadge icon={<UserIcon width={16} height={16} />} size="sm" className="group-hover:scale-105" />
            <p className="font-medium text-text-primary">{row.nome}</p>
          </div>
        ),
      },
      {
        key: 'contato',
        header: 'Contato',
        width: '240px',
        render: (row) => (
          <div className="text-text-secondary">
            <p>{row.email}</p>
            {row.telefone && <small className="block text-xs text-text-muted">{row.telefone}</small>}
          </div>
        ),
      },
      {
        key: 'residencia',
        header: 'Residência',
        mono: true,
        width: '150px',
        render: (row) => formatResidencia(row.residencia),
      },
    ],
    [],
  );

  if (residenciasQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (residenciasQuery.isError || !residenciasQuery.data) {
    return (
      <Card>
        <p className="text-danger">Não foi possível carregar as residências.</p>
      </Card>
    );
  }

  const residencias = residenciasQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Moradores"
          action={
            <div className="flex items-center gap-3">
              <ImportarMoradoresButton />
              <Button onClick={() => setCreateOpen(true)}>
                <PlusIcon width={16} height={16} />
                Cadastrar morador
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatTile
            tint="primary"
            icon={<UserIcon width={22} height={22} />}
            value={moradoresQuery.data?.total ?? 0}
            label="moradores cadastrados"
          />
          <StatTile
            tint="accent"
            icon={<ResidenciaIcon width={22} height={22} />}
            value={residencias.length}
            label="residências"
            foot="no condomínio"
          />
        </div>

        <Card padding="none">
          <div className="p-5 md:p-8 md:pb-0">
            <ListToolbar
              searchValue={rawSearch}
              onSearchChange={setRawSearch}
              searchLabel="Buscar"
              searchPlaceholder="Nome ou e-mail"
              resultCount={moradoresQuery.data?.total}
              resultLabel="moradores"
              sortOptions={SORT_OPTIONS}
              sortValue={`${state.sortBy}-${state.sortOrder}`}
              onSortChange={(value) => {
                const [sortBy, sortOrder] = value.split('-') as [string, 'asc' | 'desc'];
                setSort(sortBy, sortOrder);
              }}
            />
          </div>

          <div className="mt-4 overflow-x-auto">
            {moradoresQuery.isError ? (
              <p className="p-6 text-danger">Não foi possível carregar os moradores. Tente recarregar a página.</p>
            ) : (
              <DataTable
                columns={columns}
                rows={moradoresQuery.data?.items ?? []}
                rowKey={(row) => row.id}
                loading={moradoresQuery.isLoading}
                onRowClick={(row) => setSelectedId(row.id)}
                selectedRowKey={selectedId ?? undefined}
                emptyState={
                  <EmptyState
                    icon={<MoradorEmptyIllustration />}
                    title={state.search ? 'Nenhum morador encontrado para essa busca.' : 'Nenhum morador cadastrado ainda.'}
                    action={
                      state.search
                        ? { label: 'Limpar filtros', onClick: clearFilters }
                        : { label: 'Cadastrar morador', onClick: () => setCreateOpen(true) }
                    }
                  />
                }
              />
            )}
          </div>

          {moradoresQuery.data && (
            <Pagination
              page={moradoresQuery.data.page}
              totalPages={moradoresQuery.data.totalPages}
              total={moradoresQuery.data.total}
              pageSize={moradoresQuery.data.pageSize}
              onPageChange={setPage}
            />
          )}
        </Card>
      </div>

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected ? selected.nome : ''}
      >
        {selected && (
          <MoradorDetail
            key={selected.id}
            morador={selected}
            residencias={residencias}
            pending={updateMutation.isPending}
            hasError={updateMutation.isError}
            onSave={(payload) => updateMutation.mutate({ id: selected.id, ...payload })}
          />
        )}
      </Drawer>

      <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="Novo morador">
        <CreateMoradorForm residencias={residencias} onSuccess={() => setCreateOpen(false)} />
      </Drawer>
    </div>
  );
}
