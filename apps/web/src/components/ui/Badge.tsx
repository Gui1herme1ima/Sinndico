import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type BadgeStatus =
  | 'aberto'
  | 'aguardando'
  | 'em-progresso'
  | 'resolvido'
  | 'retirada'
  | 'urgente'
  | 'bloqueado'
  | 'baixa'
  | 'media'
  | 'alta'
  | 'novo';

export interface BadgeProps {
  status: BadgeStatus;
  children: ReactNode;
  mono?: boolean;
}

const statusClasses: Record<BadgeStatus, string> = {
  aberto: 'bg-accent/10 text-accent',
  aguardando: 'bg-accent/10 text-accent',
  'em-progresso': 'bg-primary/10 text-primary',
  resolvido: 'bg-success/10 text-success',
  retirada: 'bg-success/10 text-success',
  urgente: 'bg-danger/10 text-danger',
  bloqueado: 'bg-danger/10 text-danger',
  baixa: 'bg-success/10 text-success',
  media: 'bg-accent/10 text-accent',
  alta: 'bg-danger/10 text-danger',
  novo: 'bg-accent/10 text-accent',
};

export function Badge({ status, children, mono = false }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        mono && 'font-mono',
        statusClasses[status],
      )}
    >
      {children}
    </span>
  );
}
