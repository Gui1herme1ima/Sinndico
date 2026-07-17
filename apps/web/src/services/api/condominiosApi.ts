import { apiFetch } from '@/services/api/client';
import type {
  CondominioResponse,
  CreateCondominioPayload,
  UpdateCondominioPayload,
} from '@/services/api/types';

export const condominiosApi = {
  list(): Promise<CondominioResponse[]> {
    return apiFetch<CondominioResponse[]>('/api/condominios');
  },

  create(payload: CreateCondominioPayload): Promise<CondominioResponse> {
    return apiFetch<CondominioResponse>('/api/condominios', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: UpdateCondominioPayload): Promise<CondominioResponse> {
    return apiFetch<CondominioResponse>(`/api/condominios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
