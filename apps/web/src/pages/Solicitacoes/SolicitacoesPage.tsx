import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { CreateSolicitacaoForm } from '@/components/Solicitacoes/CreateSolicitacaoForm';
import { SolicitacaoCard } from '@/components/Solicitacoes/SolicitacaoCard';
import { Card } from '@/components/ui/Card';
import { ListToolbar } from '@/components/ui/ListToolbar';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useListQueryParams } from '@/hooks/useListQueryParams';
import { solicitacoesApi } from '@/services/api/solicitacoesApi';
import type { SolicitacaoListParams } from '@/services/api/types';
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

  const { state, setPage, setSearch, setFilter, setSort } = useListQueryParams({
    sortBy: 'dataCriacao',
    sortOrder: 'desc',
  });

  const [rawSearch, setRawSearch] = useState(state.search);
  const debouncedSearch = useDebouncedValue(rawSearch, 300);

  useEffect(() => {
    if (debouncedSearch !== state.search) setSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

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

  const hasActiveFilters = Boolean(state.search || state.filters.status || state.filters.categoria);

  return (
    <div className="flex flex-col gap-6">
      {!isAdmin && <CreateSolicitacaoForm />}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          {isAdmin ? 'Solicitações do condomínio' : 'Minhas solicitações'}
        </h2>

        <Card>
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
        </Card>

        {isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {isError && (
          <Card>
            <p className="text-danger">
              Não foi possível carregar as solicitações. Tente recarregar a página.
            </p>
          </Card>
        )}

        {!isLoading && !isError && data && data.items.length === 0 && (
          <Card>
            <p className="text-text-secondary">
              {hasActiveFilters
                ? 'Nenhuma solicitação encontrada para esses filtros.'
                : 'Nenhuma solicitação por aqui ainda.'}
            </p>
          </Card>
        )}

        {data?.items.map((solicitacao) => (
          <SolicitacaoCard key={solicitacao.id} solicitacao={solicitacao} canManage={isAdmin} />
        ))}

        {data && data.totalPages > 1 && (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
