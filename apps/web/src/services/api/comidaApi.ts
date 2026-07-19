import { apiFetch } from '@/services/api/client';
import type {
  ComidaListParams,
  ComidaResponse,
  ComidaStatus,
  CreateComidaPayload,
  PaginatedResponse,
} from '@/services/api/types';

function toQueryString(params: ComidaListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const comidaApi = {
  list(params: ComidaListParams = {}): Promise<PaginatedResponse<ComidaResponse>> {
    return apiFetch<PaginatedResponse<ComidaResponse>>(`/api/comida${toQueryString(params)}`);
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
