import { apiFetch } from '@/services/api/client';
import type { ChatResponse, CreateChatPayload } from '@/services/api/types';

export const chatsApi = {
  list(moradorId?: string): Promise<ChatResponse[]> {
    const query = moradorId ? `?moradorId=${encodeURIComponent(moradorId)}` : '';
    return apiFetch<ChatResponse[]>(`/api/chats${query}`);
  },

  send(payload: CreateChatPayload): Promise<ChatResponse> {
    return apiFetch<ChatResponse>('/api/chats', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
