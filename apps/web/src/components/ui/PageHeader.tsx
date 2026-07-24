import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  action?: ReactNode;
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 className="font-display text-xl font-semibold text-text-primary">{title}</h2>
      {action}
    </div>
  );
}
