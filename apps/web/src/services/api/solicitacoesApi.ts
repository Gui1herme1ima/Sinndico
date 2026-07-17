import { apiFetch } from '@/services/api/client';
import type {
  CreateSolicitacaoPayload,
  SolicitacaoResponse,
  UpdateSolicitacaoPayload,
} from '@/services/api/types';

export const solicitacoesApi = {
  list(): Promise<SolicitacaoResponse[]> {
    return apiFetch<SolicitacaoResponse[]>('/api/solicitacoes');
  },

  create(payload: CreateSolicitacaoPayload): Promise<SolicitacaoResponse> {
    return apiFetch<SolicitacaoResponse>('/api/solicitacoes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: UpdateSolicitacaoPayload): Promise<SolicitacaoResponse> {
    return apiFetch<SolicitacaoResponse>(`/api/solicitacoes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
