import { apiFetch } from '@/services/api/client';
import type { ComunicadoResponse, CreateComunicadoPayload } from '@/services/api/types';

export const comunicadosApi = {
  list(): Promise<ComunicadoResponse[]> {
    return apiFetch<ComunicadoResponse[]>('/api/comunicados');
  },

  create(payload: CreateComunicadoPayload): Promise<ComunicadoResponse> {
    return apiFetch<ComunicadoResponse>('/api/comunicados', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  markAsRead(id: string): Promise<ComunicadoResponse> {
    return apiFetch<ComunicadoResponse>(`/api/comunicados/${id}/ler`, {
      method: 'POST',
    });
  },
};
