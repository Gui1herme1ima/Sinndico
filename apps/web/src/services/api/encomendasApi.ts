import { apiFetch } from '@/services/api/client';
import type { CreateEncomendaPayload, EncomendaResponse } from '@/services/api/types';

export const encomendasApi = {
  list(): Promise<EncomendaResponse[]> {
    return apiFetch<EncomendaResponse[]>('/api/encomendas');
  },

  create(payload: CreateEncomendaPayload): Promise<EncomendaResponse> {
    return apiFetch<EncomendaResponse>('/api/encomendas', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  sign(id: string): Promise<EncomendaResponse> {
    return apiFetch<EncomendaResponse>(`/api/encomendas/${id}/assinar`, {
      method: 'POST',
    });
  },
};
