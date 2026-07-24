import { apiFetch } from '@/services/api/client';
import type {
  CreateResidenciaPayload,
  ImportarResidenciasPayload,
  ImportarResultado,
  ResidenciaDetalheResponse,
  ResidenciaResponse,
  UpdateResidenciaPayload,
} from '@/services/api/types';

export const residenciasApi = {
  // Sem setorId: lista achatada de todas as residências (usada pelo seletor de Moradores).
  list(setorId?: string, search?: string): Promise<ResidenciaResponse[]> {
    const params = new URLSearchParams();
    if (setorId) params.set('setorId', setorId);
    if (search) params.set('search', search);
    const query = params.toString();
    return apiFetch<ResidenciaResponse[]>(`/api/residencias${query ? `?${query}` : ''}`);
  },

  getDetalhe(id: string): Promise<ResidenciaDetalheResponse> {
    return apiFetch<ResidenciaDetalheResponse>(`/api/residencias/${id}/detalhe`);
  },

  create(payload: CreateResidenciaPayload): Promise<ResidenciaResponse> {
    return apiFetch<ResidenciaResponse>('/api/residencias', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: UpdateResidenciaPayload): Promise<ResidenciaResponse> {
    return apiFetch<ResidenciaResponse>(`/api/residencias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  importar(payload: ImportarResidenciasPayload): Promise<ImportarResultado> {
    return apiFetch<ImportarResultado>('/api/residencias/importar', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
