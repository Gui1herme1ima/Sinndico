import { apiFetch } from '@/services/api/client';
import type {
  CreateVisitantePayload,
  PaginatedResponse,
  VisitanteListParams,
  VisitanteResponse,
  VisitanteStatus,
} from '@/services/api/types';

function toQueryString(params: VisitanteListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const visitantesApi = {
  list(params: VisitanteListParams = {}): Promise<PaginatedResponse<VisitanteResponse>> {
    return apiFetch<PaginatedResponse<VisitanteResponse>>(`/api/visitantes${toQueryString(params)}`);
  },

  create(payload: CreateVisitantePayload): Promise<VisitanteResponse> {
    return apiFetch<VisitanteResponse>('/api/visitantes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  registrarEntrada(id: string): Promise<VisitanteResponse> {
    return apiFetch<VisitanteResponse>(`/api/visitantes/${id}/entrada`, { method: 'POST' });
  },

  registrarSaida(id: string): Promise<VisitanteResponse> {
    return apiFetch<VisitanteResponse>(`/api/visitantes/${id}/saida`, { method: 'POST' });
  },

  updateStatus(id: string, status: Extract<VisitanteStatus, 'aprovado' | 'bloqueado'>): Promise<VisitanteResponse> {
    return apiFetch<VisitanteResponse>(`/api/visitantes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
