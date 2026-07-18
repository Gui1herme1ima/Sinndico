import { apiFetch } from '@/services/api/client';
import type {
  AssembleiaResponse,
  CreateAssembleiaPayload,
  UpdateAssembleiaStatusPayload,
  VotarPayload,
} from '@/services/api/types';

export const assembleiasApi = {
  list(): Promise<AssembleiaResponse[]> {
    return apiFetch<AssembleiaResponse[]>('/api/assembleias');
  },

  create(payload: CreateAssembleiaPayload): Promise<AssembleiaResponse> {
    return apiFetch<AssembleiaResponse>('/api/assembleias', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateStatus(id: string, payload: UpdateAssembleiaStatusPayload): Promise<AssembleiaResponse> {
    return apiFetch<AssembleiaResponse>(`/api/assembleias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  votar(id: string, payload: VotarPayload): Promise<AssembleiaResponse> {
    return apiFetch<AssembleiaResponse>(`/api/assembleias/${id}/votar`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
