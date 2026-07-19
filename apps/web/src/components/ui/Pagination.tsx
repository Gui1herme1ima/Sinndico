import { cn } from '@/lib/cn';

export interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function buildPageList(page: number, totalPages: number): Array<number | '…'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const keep = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...keep].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);

  const result: Array<number | '…'> = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('…');
    result.push(sorted[i]);
  }
  return result;
}

export function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = buildPageList(page, totalPages);

  return (
    <div className="flex items-center gap-2 px-4 py-3 text-[12.5px] text-text-muted">
      <span>
        Mostrando {from}–{to} de {total}
      </span>
      <div className="flex-1" />
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="font-mono text-[11px]">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              'flex h-[30px] w-[30px] items-center justify-center rounded-lg border font-mono text-xs',
              p === page
                ? 'border-primary bg-primary text-primary-contrast'
                : 'border-border bg-transparent text-text-secondary hover:border-primary hover:text-primary',
            )}
          >
            {p}
          </button>
        ),
      )}
    </div>
  );
}
