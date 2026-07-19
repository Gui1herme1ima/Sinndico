import { apiFetch } from '@/services/api/client';
import type {
  CreateReservaPayload,
  PaginatedResponse,
  ReservaListParams,
  ReservaResponse,
  ReservaStatus,
} from '@/services/api/types';

function toQueryString(params: ReservaListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const reservasApi = {
  list(params: ReservaListParams = {}): Promise<PaginatedResponse<ReservaResponse>> {
    return apiFetch<PaginatedResponse<ReservaResponse>>(`/api/reservas${toQueryString(params)}`);
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
