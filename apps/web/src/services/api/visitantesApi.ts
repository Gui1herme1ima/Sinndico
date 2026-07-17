import { apiFetch } from '@/services/api/client';
import type {
  CreateVisitantePayload,
  VisitanteResponse,
  VisitanteStatus,
} from '@/services/api/types';

export const visitantesApi = {
  list(): Promise<VisitanteResponse[]> {
    return apiFetch<VisitanteResponse[]>('/api/visitantes');
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
