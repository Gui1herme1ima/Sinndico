import { FilterPill, type FilterPillOption } from '@/components/ui/FilterPill';
import { Input } from '@/components/ui/Input';

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
}: ListToolbarProps) {
  return (
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
    </div>
  );
}
