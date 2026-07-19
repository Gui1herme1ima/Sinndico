import type { EncomendaStatus } from '@/services/api/types';

export const STATUS_LABELS: Record<EncomendaStatus, string> = {
  aguardando: 'Aguardando retirada',
  retirada: 'Retirada',
};
