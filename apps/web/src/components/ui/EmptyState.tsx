import type { ReactNode } from 'react';

import { Button } from '@/components/ui/Button';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl py-14 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(480px_260px_at_50%_0%,color-mix(in_srgb,var(--color-primary)_6%,transparent),transparent_70%)]" />
      <div className="text-text-muted">{icon}</div>
      <p className="font-medium text-text-primary">{title}</p>
      {description && <p className="text-sm text-text-secondary">{description}</p>}
      {action && (
        <Button variant="secondary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
