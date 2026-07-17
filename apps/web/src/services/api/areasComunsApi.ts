import { apiFetch } from '@/services/api/client';
import type {
  AreaComumResponse,
  CreateAreaComumPayload,
  UpdateAreaComumPayload,
} from '@/services/api/types';

export const areasComunsApi = {
  list(): Promise<AreaComumResponse[]> {
    return apiFetch<AreaComumResponse[]>('/api/areas-comuns');
  },

  create(payload: CreateAreaComumPayload): Promise<AreaComumResponse> {
    return apiFetch<AreaComumResponse>('/api/areas-comuns', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: UpdateAreaComumPayload): Promise<AreaComumResponse> {
    return apiFetch<AreaComumResponse>(`/api/areas-comuns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
