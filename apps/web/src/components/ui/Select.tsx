import { useId } from 'react';
import type { SelectHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
}

export function Select({ label, helperText, error, options, id, className, disabled, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const describedById = error || helperText ? `${selectId}-description` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      <select
        id={selectId}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={describedById}
        className={cn(
          'h-10 rounded-lg border bg-surface px-3 text-text-primary',
          'transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          'disabled:opacity-50',
          error ? 'border-danger' : 'border-border',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {(error || helperText) && (
        <p id={describedById} className={cn('text-sm', error ? 'text-danger' : 'text-text-secondary')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}
