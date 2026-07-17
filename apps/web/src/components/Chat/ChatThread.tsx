import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/formatDate';
import type { ChatResponse } from '@/services/api/types';

export interface ChatThreadProps {
  messages: ChatResponse[];
  currentUserId: string;
  moradorId: string;
}

export function ChatThread({ messages, currentUserId, moradorId }: ChatThreadProps) {
  if (messages.length === 0) {
    return <p className="text-text-secondary">Nenhuma mensagem ainda — comece a conversa.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => {
        const isOwn = message.autorId === currentUserId;
        const isFromMorador = message.autorId === moradorId;

        return (
          <div key={message.id} className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
            <span className="text-xs text-text-secondary">
              {isOwn ? 'Você' : isFromMorador ? 'Morador' : 'Administração'}
            </span>
            <div
              className={cn(
                'max-w-[75%] rounded-xl px-4 py-2 text-sm',
                isOwn ? 'bg-primary text-primary-contrast' : 'bg-background text-text-primary',
              )}
            >
              {message.mensagem}
            </div>
            <span className="font-mono text-xs text-text-secondary">{formatDate(message.createdAt)}</span>
          </div>
        );
      })}
    </div>
  );
}
