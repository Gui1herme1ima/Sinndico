import type { ComidaStatus } from '@/services/api/types';

export const STATUS_LABELS: Record<ComidaStatus, string> = {
  'pedido-feito': 'Pedido feito',
  'em-caminho': 'A caminho',
  chegou: 'Chegou na portaria',
  retirada: 'Retirado',
};
