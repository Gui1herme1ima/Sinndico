import { apiFetch } from '@/services/api/client';
import type {
  CreateEncomendaPayload,
  EncomendaListParams,
  EncomendaResponse,
  PaginatedResponse,
} from '@/services/api/types';

function toQueryString(params: EncomendaListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const encomendasApi = {
  list(params: EncomendaListParams = {}): Promise<PaginatedResponse<EncomendaResponse>> {
    return apiFetch<PaginatedResponse<EncomendaResponse>>(`/api/encomendas${toQueryString(params)}`);
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
