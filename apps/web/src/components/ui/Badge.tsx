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
  | 'novo'
  | 'aprovado'
  | 'ativo'
  | 'pedido-feito'
  | 'em-caminho'
  | 'chegou'
  | 'pendente'
  | 'aprovada'
  | 'cancelada'
  | 'admin'
  | 'porteiro'
  | 'planejada'
  | 'em-votacao'
  | 'encerrada';

export interface BadgeProps {
  status: BadgeStatus;
  children: ReactNode;
  mono?: boolean;
  /** Pontinho antes do texto — sinaliza status "vivo" (aberto, em progresso, etc). */
  dot?: boolean;
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
  aprovado: 'bg-success/10 text-success',
  ativo: 'bg-primary/10 text-primary',
  'pedido-feito': 'bg-accent/10 text-accent',
  'em-caminho': 'bg-primary/10 text-primary',
  chegou: 'bg-accent/10 text-accent',
  pendente: 'bg-accent/10 text-accent',
  aprovada: 'bg-success/10 text-success',
  cancelada: 'bg-danger/10 text-danger',
  admin: 'bg-primary/10 text-primary',
  porteiro: 'bg-accent/10 text-accent',
  planejada: 'bg-accent/10 text-accent',
  'em-votacao': 'bg-primary/10 text-primary',
  encerrada: 'bg-success/10 text-success',
};

export function Badge({ status, children, mono = false, dot = false }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        mono && 'font-mono',
        statusClasses[status],
      )}
    >
      {dot && <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  );
}
