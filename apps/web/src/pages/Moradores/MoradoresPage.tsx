import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { CreateMoradorForm } from '@/components/Moradores/CreateMoradorForm';
import { EditarMoradorModal } from '@/components/Moradores/EditarMoradorModal';
import { ImportarMoradoresButton } from '@/components/Moradores/ImportarMoradoresButton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListToolbar } from '@/components/ui/ListToolbar';
import { formatResidencia } from '@/components/ui/MoradorSelect';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { MoradorEmptyIllustration } from '@/components/ui/illustrations';
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

  const { state, setPage, setSearch, setSort, clearFilters } = useListQueryParams({
    sortBy: 'nome',
    sortOrder: 'asc',
  });

  const [rawSearch, setRawSearch] = useState(state.search);
  const debouncedSearch = useDebouncedValue(rawSearch, 300);
  const [editingMorador, setEditingMorador] = useState<MoradorResponse | null>(null);

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

  const columns = useMemo<DataTableColumn<MoradorResponse>[]>(
    () => [
      {
        key: 'nome',
        header: 'Nome',
        render: (row) => <p className="font-medium text-text-primary">{row.nome}</p>,
      },
      {
        key: 'contato',
        header: 'Contato',
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
        render: (row) => formatResidencia(row.residencia),
      },
      {
        key: 'acoes',
        header: 'Ações',
        render: (row) => (
          <Button size="sm" variant="ghost" onClick={() => setEditingMorador(row)}>
            Editar
          </Button>
        ),
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
      <div id="create-morador-form">
        <CreateMoradorForm residencias={residencias} />
      </div>
      <ImportarMoradoresButton />

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">Moradores</h2>

        <Card padding="none">
          <div className="p-4 md:p-6 md:pb-0">
            <ListToolbar
              searchValue={rawSearch}
              onSearchChange={setRawSearch}
              searchLabel="Buscar"
              searchPlaceholder="Nome ou e-mail"
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
                emptyState={
                  <EmptyState
                    icon={<MoradorEmptyIllustration />}
                    title={state.search ? 'Nenhum morador encontrado para essa busca.' : 'Nenhum morador cadastrado ainda.'}
                    action={
                      state.search
                        ? { label: 'Limpar filtros', onClick: clearFilters }
                        : {
                            label: 'Cadastrar morador',
                            onClick: () =>
                              document
                                .getElementById('create-morador-form')
                                ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
                          }
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

      {editingMorador && (
        <EditarMoradorModal
          morador={editingMorador}
          residencias={residencias}
          onClose={() => setEditingMorador(null)}
        />
      )}
    </div>
  );
}
