import { apiFetch } from '@/services/api/client';
import type {
  CreateSolicitacaoPayload,
  PaginatedResponse,
  SolicitacaoListParams,
  SolicitacaoResponse,
  UpdateSolicitacaoPayload,
} from '@/services/api/types';

function toQueryString(params: SolicitacaoListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const solicitacoesApi = {
  list(params: SolicitacaoListParams = {}): Promise<PaginatedResponse<SolicitacaoResponse>> {
    return apiFetch<PaginatedResponse<SolicitacaoResponse>>(`/api/solicitacoes${toQueryString(params)}`);
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
