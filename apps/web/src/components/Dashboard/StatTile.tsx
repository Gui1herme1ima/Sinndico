import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type StatTileTint = 'accent' | 'primary';

export interface StatTileProps {
  label: string;
  value: number;
  icon: ReactNode;
  tint?: StatTileTint;
  foot?: string;
}

const tintClasses: Record<StatTileTint, { surface: string; badge: string; badgeText: string }> = {
  accent: {
    surface:
      'bg-[color-mix(in_srgb,var(--color-accent)_8%,var(--color-surface))] border-[color-mix(in_srgb,var(--color-accent)_24%,var(--color-border))]',
    badge: 'bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]',
    badgeText: 'text-accent',
  },
  primary: {
    surface:
      'bg-[color-mix(in_srgb,var(--color-primary)_8%,var(--color-surface))] border-[color-mix(in_srgb,var(--color-primary)_24%,var(--color-border))]',
    badge: 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]',
    badgeText: 'text-primary',
  },
};

export function StatTile({ label, value, icon, tint = 'primary', foot }: StatTileProps) {
  const t = tintClasses[tint];

  return (
    <div
      className={cn(
        'rounded-2xl border p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:shadow-none',
        t.surface,
      )}
    >
      <div className={cn('mb-3.5 flex h-11 w-11 items-center justify-center rounded-full', t.badge, t.badgeText)}>
        {icon}
      </div>
      <span className="block font-display text-3xl font-bold text-text-primary">{value}</span>
      <span className="mt-1 block text-sm text-text-secondary">{label}</span>
      {foot && <span className="mt-1 block text-xs text-text-muted">{foot}</span>}
    </div>
  );
}
