import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export interface CardProps {
  title?: string;
  action?: ReactNode;
  padding?: 'default' | 'none';
  className?: string;
  children: ReactNode;
}

export function Card({ title, action, padding = 'default', className, children }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-surface shadow-sm dark:shadow-none dark:border dark:border-border',
        padding === 'default' && 'p-4 md:p-6',
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h2 className="font-display text-xl font-semibold text-text-primary">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
