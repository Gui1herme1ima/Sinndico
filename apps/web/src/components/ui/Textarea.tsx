import { useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
  error?: string;
}

export function Textarea({
  label,
  helperText,
  error,
  id,
  className,
  disabled,
  rows = 4,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const describedById = error || helperText ? `${textareaId}-description` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={textareaId} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      <textarea
        id={textareaId}
        rows={rows}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={describedById}
        className={cn(
          'resize-y rounded-lg border bg-surface px-3 py-2 text-text-primary',
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
