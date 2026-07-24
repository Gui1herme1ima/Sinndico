import type { ReactNode } from 'react';

import { Skeleton } from '@/components/ui/Skeleton';
import { ChevronRightIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  mono?: boolean;
  render: (row: T) => ReactNode;
}

export type DataTableAccent = 'accent' | 'primary' | 'success' | 'danger';

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  skeletonRows?: number;
  onRowClick?: (row: T) => void;
  selectedRowKey?: string;
  emptyState?: ReactNode;
  /** Tinta a borda esquerda da linha (ex.: por prioridade/status) — puramente decorativo. */
  rowAccent?: (row: T) => DataTableAccent | undefined;
}

const alignClass: Record<'left' | 'right' | 'center', string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

const accentShadowClass: Record<DataTableAccent, string> = {
  accent: 'shadow-[inset_3px_0_0_var(--color-accent)]',
  primary: 'shadow-[inset_3px_0_0_var(--color-primary)]',
  success: 'shadow-[inset_3px_0_0_var(--color-success)]',
  danger: 'shadow-[inset_3px_0_0_var(--color-danger)]',
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  skeletonRows = 5,
  onRowClick,
  selectedRowKey,
  emptyState,
  rowAccent,
}: DataTableProps<T>) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              style={column.width ? { width: column.width } : undefined}
              className={cn(
                'border-b border-border px-[22px] py-[17px] text-[11.5px] font-semibold uppercase tracking-[0.04em] text-text-muted',
                alignClass[column.align ?? 'left'],
              )}
            >
              {column.header}
            </th>
          ))}
          {onRowClick && <th className="border-b border-border" style={{ width: '40px' }} />}
        </tr>
      </thead>
      <tbody className="[&>tr:last-child>td]:border-b-0">
        {loading ? (
          Array.from({ length: skeletonRows }, (_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border">
              {columns.map((column) => (
                <td key={column.key} className="px-5 py-4">
                  <Skeleton className="h-4 w-full" />
                </td>
              ))}
              {onRowClick && <td />}
            </tr>
          ))
        ) : rows.length === 0 && emptyState ? (
          <tr>
            <td colSpan={columns.length + (onRowClick ? 1 : 0)}>{emptyState}</td>
          </tr>
        ) : (
          rows.map((row) => {
            const key = rowKey(row);
            const selected = selectedRowKey === key;
            const accent = rowAccent?.(row);
            return (
              <tr
                key={key}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'group border-b border-border transition-colors duration-150',
                  onRowClick ? 'cursor-pointer' : 'cursor-default',
                  'hover:bg-text-primary/5',
                  selected
                    ? 'bg-primary/[0.07] shadow-[inset_3px_0_0_var(--color-primary)]'
                    : accent && accentShadowClass[accent],
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-[22px] py-[17px] text-sm align-middle',
                      alignClass[column.align ?? 'left'],
                      column.mono && 'font-mono text-xs text-text-secondary',
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
                {onRowClick && (
                  <td className="px-2 text-text-muted opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    <ChevronRightIcon width={16} height={16} />
                  </td>
                )}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}
