import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { ChatMessageForm } from '@/components/Chat/ChatMessageForm';
import { ChatThread } from '@/components/Chat/ChatThread';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { chatsApi } from '@/services/api/chatsApi';
import { usersApi } from '@/services/api/usersApi';
import { useAuth } from '@/store/useAuth';

function labelMorador(morador: { nome: string; residencia: { bloco: string | null; rua: string | null; numero: string | null } | null }) {
  if (!morador.residencia) return morador.nome;
  const { bloco, rua, numero } = morador.residencia;
  const local = bloco ? `Bloco ${bloco} — ${numero}` : `${rua}, ${numero}`;
  return `${morador.nome} — ${local}`;
}

export function ChatPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [moradorIdSelecionado, setMoradorIdSelecionado] = useState('');

  const diretorioQuery = useQuery({
    queryKey: ['moradores-diretorio'],
    queryFn: () => usersApi.listDiretorio(),
    enabled: isAdmin,
  });

  const moradorId = isAdmin ? moradorIdSelecionado : (user?.id ?? '');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['chats', moradorId],
    queryFn: () => chatsApi.list(isAdmin ? moradorId : undefined),
    enabled: Boolean(moradorId),
  });

  const moradores = diretorioQuery.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-xl font-semibold text-text-primary">Chat</h2>

      {isAdmin && (
        <Card title="Conversar com morador">
          {diretorioQuery.isError && (
            <p className="text-sm text-danger">Não foi possível carregar a lista de moradores.</p>
          )}
          <Select
            label="Morador"
            disabled={diretorioQuery.isLoading || moradores.length === 0}
            value={moradorIdSelecionado}
            onChange={(e) => setMoradorIdSelecionado(e.target.value)}
            options={[
              { value: '', label: diretorioQuery.isLoading ? 'Carregando...' : 'Selecione o morador' },
              ...moradores.map((m) => ({ value: m.id, label: labelMorador(m) })),
            ]}
          />
        </Card>
      )}

      {isAdmin && !moradorId && (
        <Card>
          <p className="text-text-secondary">Selecione um morador pra ver a conversa.</p>
        </Card>
      )}

      {moradorId && (
        <Card title="Conversa">
          <div className="flex flex-col gap-4">
            {isLoading && (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-12 w-2/3" />
                <Skeleton className="h-12 w-1/2 self-end" />
              </div>
            )}

            {isError && (
              <p className="text-danger">Não foi possível carregar a conversa. Tente recarregar a página.</p>
            )}

            {data && <ChatThread messages={data} currentUserId={user!.id} moradorId={moradorId} />}

            <ChatMessageForm moradorId={moradorId} />
          </div>
        </Card>
      )}
    </div>
  );
}
