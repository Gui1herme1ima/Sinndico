import { FilterPill, type FilterPillOption } from '@/components/ui/FilterPill';
import { Input } from '@/components/ui/Input';
import { XIcon } from '@/components/ui/icons';

export interface ListToolbarFilter {
  key: string;
  label: string;
  value: string;
  options: FilterPillOption[];
  onChange: (value: string) => void;
}

export interface ListToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchLabel?: string;
  searchPlaceholder?: string;
  filters?: ListToolbarFilter[];
  sortOptions: FilterPillOption[];
  sortValue: string;
  onSortChange: (value: string) => void;
  /** Total de itens já carregado pela página (normal.: `data.total` da resposta paginada). */
  resultCount?: number;
  resultLabel?: string;
}

export function ListToolbar({
  searchValue,
  onSearchChange,
  searchLabel = 'Buscar',
  searchPlaceholder,
  filters = [],
  sortOptions,
  sortValue,
  onSortChange,
  resultCount,
  resultLabel = 'resultados',
}: ListToolbarProps) {
  const activeChips = [
    ...(searchValue
      ? [{ key: '__search', label: `"${searchValue}"`, onRemove: () => onSearchChange('') }]
      : []),
    ...filters
      .filter((filter) => filter.value)
      .map((filter) => ({
        key: filter.key,
        label: `${filter.label}: ${filter.options.find((o) => o.value === filter.value)?.label ?? filter.value}`,
        onRemove: () => filter.onChange(''),
      })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[220px] max-w-[360px] flex-1">
          <Input
            label={searchLabel}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {filters.map((filter) => (
          <FilterPill
            key={filter.key}
            label={filter.label}
            value={filter.value}
            onChange={filter.onChange}
            options={filter.options}
          />
        ))}

        <FilterPill label="Ordenar" value={sortValue} onChange={onSortChange} options={sortOptions} />

        {typeof resultCount === 'number' && (
          <span className="ml-auto whitespace-nowrap text-xs text-text-muted">
            {resultCount} {resultLabel}
          </span>
        )}
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-text-secondary transition-colors duration-150 hover:border-danger hover:text-danger"
            >
              {chip.label}
              <XIcon width={11} height={11} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
