import { apiFetch } from '@/services/api/client';
import type {
  CreateResidenciaPayload,
  ImportarResidenciasPayload,
  ImportarResultado,
  ResidenciaResponse,
  UpdateResidenciaPayload,
} from '@/services/api/types';

export const residenciasApi = {
  list(): Promise<ResidenciaResponse[]> {
    return apiFetch<ResidenciaResponse[]>('/api/residencias');
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
