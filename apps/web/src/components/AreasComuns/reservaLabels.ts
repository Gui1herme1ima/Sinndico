import type { ReservaStatus } from '@/services/api/types';

export const STATUS_LABELS: Record<ReservaStatus, string> = {
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  cancelada: 'Cancelada',
};
