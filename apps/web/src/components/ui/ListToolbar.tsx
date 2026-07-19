import { Input } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';

export interface ListToolbarFilter {
  key: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

export interface ListToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchLabel?: string;
  searchPlaceholder?: string;
  filters?: ListToolbarFilter[];
  sortOptions: SelectOption[];
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
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[220px] flex-1">
        <Input
          label={searchLabel}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {filters.map((filter) => (
        <div key={filter.key} className="min-w-[160px]">
          <Select
            label={filter.label}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            options={filter.options}
          />
        </div>
      ))}

      <div className="min-w-[180px]">
        <Select
          label="Ordenar por"
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          options={sortOptions}
        />
      </div>
    </div>
  );
}
