import { apiFetch } from '@/services/api/client';
import type { CreateSetorPayload, SetorResponse, UpdateSetorPayload } from '@/services/api/types';

export const setoresApi = {
  list(): Promise<SetorResponse[]> {
    return apiFetch<SetorResponse[]>('/api/setores');
  },

  getById(id: string): Promise<SetorResponse> {
    return apiFetch<SetorResponse>(`/api/setores/${id}`);
  },

  create(payload: CreateSetorPayload): Promise<SetorResponse> {
    return apiFetch<SetorResponse>('/api/setores', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: UpdateSetorPayload): Promise<SetorResponse> {
    return apiFetch<SetorResponse>(`/api/setores/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
