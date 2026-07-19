export interface PaginationParams {
  page: number;
  pageSize: number;
  offset: number;
  limit: number;
}

export function parsePagination(query: { page?: number; pageSize?: number }): PaginationParams {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
  return { page, pageSize, offset: (page - 1) * pageSize, limit: pageSize };
}

export function resolveSortColumn<T extends string>(
  requested: T | undefined,
  allowlist: Record<T, string>,
  defaultKey: T
): string {
  const key = requested && requested in allowlist ? requested : defaultKey;
  return allowlist[key];
}
