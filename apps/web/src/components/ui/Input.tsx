import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
}

export function Input({ label, helperText, error, id, className, disabled, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedById = error || helperText ? `${inputId}-description` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      <input
        id={inputId}
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
      />
      {(error || helperText) && (
        <p id={describedById} className={cn('text-sm', error ? 'text-danger' : 'text-text-secondary')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}
