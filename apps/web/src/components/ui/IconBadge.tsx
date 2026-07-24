import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type IconBadgeTint = 'accent' | 'primary';
export type IconBadgeSize = 'sm' | 'md';

const tintClasses: Record<IconBadgeTint, string> = {
  accent: 'bg-[color-mix(in_srgb,var(--color-accent)_20%,transparent)] text-accent',
  primary: 'bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] text-primary',
};

const sizeClasses: Record<IconBadgeSize, string> = {
  sm: 'h-[34px] w-[34px]',
  md: 'h-11 w-11',
};

export interface IconBadgeProps {
  icon: ReactNode;
  tint?: IconBadgeTint;
  size?: IconBadgeSize;
  className?: string;
}

export function IconBadge({ icon, tint = 'primary', size = 'md', className }: IconBadgeProps) {
  return (
    <div
      className={cn(
        'flex flex-shrink-0 items-center justify-center rounded-full transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
        tintClasses[tint],
        sizeClasses[size],
        className,
      )}
    >
      {icon}
    </div>
  );
}
