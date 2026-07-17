import { apiFetch } from '@/services/api/client';
import type {
  CondominioResponse,
  CreateCondominioPayload,
  CreateCondominioResponse,
  UpdateCondominioPayload,
} from '@/services/api/types';

export const condominiosApi = {
  list(): Promise<CondominioResponse[]> {
    return apiFetch<CondominioResponse[]>('/api/condominios');
  },

  getBySlug(slug: string): Promise<{ id: string; nome: string; slug: string }> {
    return apiFetch(`/api/condominios/by-slug/${slug}`, { skipAuth: true });
  },

  create(payload: CreateCondominioPayload): Promise<CreateCondominioResponse> {
    return apiFetch<CreateCondominioResponse>('/api/condominios', {
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
