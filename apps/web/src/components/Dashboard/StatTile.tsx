import type { ReactNode } from 'react';

import { IconBadge } from '@/components/ui/IconBadge';
import { cn } from '@/lib/cn';

export type StatTileTint = 'accent' | 'primary';

export interface StatTileProps {
  label: string;
  value: number;
  icon: ReactNode;
  tint?: StatTileTint;
  foot?: string;
}

const surfaceClasses: Record<StatTileTint, string> = {
  accent:
    'bg-[color-mix(in_srgb,var(--color-accent)_8%,var(--color-surface))] border-[color-mix(in_srgb,var(--color-accent)_24%,var(--color-border))]',
  primary:
    'bg-[color-mix(in_srgb,var(--color-primary)_8%,var(--color-surface))] border-[color-mix(in_srgb,var(--color-primary)_24%,var(--color-border))]',
};

export function StatTile({ label, value, icon, tint = 'primary', foot }: StatTileProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:shadow-none',
        surfaceClasses[tint],
      )}
    >
      <IconBadge icon={icon} tint={tint} className="mb-3.5" />
      <span className="block font-display text-3xl font-bold text-text-primary">{value}</span>
      <span className="mt-1 block text-sm text-text-secondary">{label}</span>
      {foot && <span className="mt-1 block text-xs text-text-muted">{foot}</span>}
    </div>
  );
}
