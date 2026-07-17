import { apiFetch } from '@/services/api/client';
import type { CreateReservaPayload, ReservaResponse, ReservaStatus } from '@/services/api/types';

export const reservasApi = {
  list(): Promise<ReservaResponse[]> {
    return apiFetch<ReservaResponse[]>('/api/reservas');
  },

  create(payload: CreateReservaPayload): Promise<ReservaResponse> {
    return apiFetch<ReservaResponse>('/api/reservas', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateStatus(id: string, status: Extract<ReservaStatus, 'aprovada' | 'cancelada'>): Promise<ReservaResponse> {
    return apiFetch<ReservaResponse>(`/api/reservas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
