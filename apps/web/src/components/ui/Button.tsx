import type { ButtonHTMLAttributes } from 'react';

import { SpinnerIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-6 text-lg',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-contrast hover:brightness-[0.92] active:brightness-[0.85]',
  secondary: 'bg-transparent border border-primary text-primary hover:bg-primary/10',
  danger: 'bg-danger text-white hover:brightness-[0.92] active:brightness-[0.85]',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-text-primary/5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'transition-[filter,background-color,color,transform] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
        'motion-safe:active:scale-[0.97]',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      <span className={cn(loading && 'invisible')}>{children}</span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <SpinnerIcon width={16} height={16} />
        </span>
      )}
    </button>
  );
}
