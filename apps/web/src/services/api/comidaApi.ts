import { apiFetch } from '@/services/api/client';
import type { ComidaResponse, ComidaStatus, CreateComidaPayload } from '@/services/api/types';

export const comidaApi = {
  list(): Promise<ComidaResponse[]> {
    return apiFetch<ComidaResponse[]>('/api/comida');
  },

  create(payload: CreateComidaPayload): Promise<ComidaResponse> {
    return apiFetch<ComidaResponse>('/api/comida', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateStatus(id: string, status: Exclude<ComidaStatus, 'pedido-feito'>): Promise<ComidaResponse> {
    return apiFetch<ComidaResponse>(`/api/comida/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
