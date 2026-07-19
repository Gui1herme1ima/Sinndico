import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface ListQueryDefaults {
  sortBy: string;
  sortOrder?: 'asc' | 'desc';
  pageSize?: number;
}

export interface ListQueryState {
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  filters: Record<string, string>;
}

const RESERVED_KEYS = new Set(['page', 'pageSize', 'sortBy', 'sortOrder', 'search']);

export function useListQueryParams(defaults: ListQueryDefaults) {
  const [searchParams, setSearchParams] = useSearchParams();

  const state: ListQueryState = useMemo(() => {
    const filters: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      if (!RESERVED_KEYS.has(key) && value) {
        filters[key] = value;
      }
    }

    return {
      page: Math.max(1, Number(searchParams.get('page')) || 1),
      pageSize: Number(searchParams.get('pageSize')) || defaults.pageSize || 20,
      sortBy: searchParams.get('sortBy') || defaults.sortBy,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc' | null) || defaults.sortOrder || 'desc',
      search: searchParams.get('search') || '',
      filters,
    };
  }, [searchParams, defaults.pageSize, defaults.sortBy, defaults.sortOrder]);

  const setPage = useCallback(
    (page: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(page));
        return next;
      });
    },
    [setSearchParams]
  );

  const setSearch = useCallback(
    (search: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (search) next.set('search', search);
        else next.delete('search');
        next.set('page', '1');
        return next;
      });
    },
    [setSearchParams]
  );

  const setFilter = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        next.set('page', '1');
        return next;
      });
    },
    [setSearchParams]
  );

  const setSort = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('sortBy', sortBy);
        next.set('sortOrder', sortOrder);
        next.set('page', '1');
        return next;
      });
    },
    [setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('search');
      for (const key of [...next.keys()]) {
        if (!RESERVED_KEYS.has(key)) next.delete(key);
      }
      next.set('page', '1');
      return next;
    });
  }, [setSearchParams]);

  return { state, setPage, setSearch, setFilter, setSort, clearFilters };
}
