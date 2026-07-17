import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/services/api/client';
import { chatsApi } from '@/services/api/chatsApi';
import { useAuth } from '@/store/useAuth';

export interface ChatMessageFormProps {
  moradorId: string;
}

export function ChatMessageForm({ moradorId }: ChatMessageFormProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const queryClient = useQueryClient();
  const [mensagem, setMensagem] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => chatsApi.send({ moradorId: isAdmin ? moradorId : undefined, mensagem }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats', moradorId] });
      setMensagem('');
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao enviar mensagem.');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!mensagem.trim()) return;
    mutation.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <Input
          label="Mensagem"
          className="flex-1"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
        />
        <Button type="submit" loading={mutation.isPending}>
          Enviar
        </Button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </form>
  );
}
