import { apiFetch } from '@/services/api/client';
import type { NotificacaoResponse } from '@/services/api/types';

export const notificacoesApi = {
  list(apenasNaoLidas?: boolean): Promise<NotificacaoResponse[]> {
    const query = apenasNaoLidas ? '?apenasNaoLidas=true' : '';
    return apiFetch<NotificacaoResponse[]>(`/api/notificacoes${query}`);
  },

  contagemNaoLidas(): Promise<{ contagem: number }> {
    return apiFetch<{ contagem: number }>('/api/notificacoes/nao-lidas/contagem');
  },

  marcarLida(id: string): Promise<void> {
    return apiFetch<void>(`/api/notificacoes/${id}/lida`, { method: 'PATCH' });
  },

  marcarTodasLidas(): Promise<void> {
    return apiFetch<void>('/api/notificacoes/lidas', { method: 'PATCH' });
  },
};
