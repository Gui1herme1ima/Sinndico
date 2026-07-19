import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { NotificacaoIcon } from '@/components/ui/icons';
import { formatRelativeTime } from '@/lib/formatRelativeTime';
import { cn } from '@/lib/cn';
import { notificacoesApi } from '@/services/api/notificacoesApi';
import type { NotificacaoResponse, NotificacaoTipo } from '@/services/api/types';

const ROTA_POR_TIPO: Record<NotificacaoTipo, string> = {
  chat: '/chat',
  comida: '/comida',
  comunicado: '/comunicados',
  reserva: '/areas-comuns',
  assembleia: '/assembleias',
  encomenda: '/encomendas',
};

export function NotificationBell() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const contagemQuery = useQuery({
    queryKey: ['notificacoes-contagem'],
    queryFn: () => notificacoesApi.contagemNaoLidas(),
    refetchInterval: 30000,
  });

  const listaQuery = useQuery({
    queryKey: ['notificacoes-lista'],
    queryFn: () => notificacoesApi.list(),
    enabled: open,
  });

  const contagem = contagemQuery.data?.contagem ?? 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  async function handleItemClick(notificacao: NotificacaoResponse) {
    setOpen(false);
    navigate(ROTA_POR_TIPO[notificacao.tipo]);
    if (!notificacao.lida) {
      queryClient.setQueryData<{ contagem: number }>(['notificacoes-contagem'], (old) => ({
        contagem: Math.max(0, (old?.contagem ?? 1) - 1),
      }));
      queryClient.setQueryData<NotificacaoResponse[]>(['notificacoes-lista'], (old) =>
        old?.map((n) => (n.id === notificacao.id ? { ...n, lida: true } : n))
      );
      await notificacoesApi.marcarLida(notificacao.id);
    }
  }

  async function handleMarcarTodasLidas() {
    queryClient.setQueryData<{ contagem: number }>(['notificacoes-contagem'], { contagem: 0 });
    queryClient.setQueryData<NotificacaoResponse[]>(['notificacoes-lista'], (old) =>
      old?.map((n) => ({ ...n, lida: true }))
    );
    await notificacoesApi.marcarTodasLidas();
  }

  const notificacoes = listaQuery.data ?? [];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificações"
        aria-expanded={open}
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary',
          'transition-colors duration-200 hover:bg-text-primary/5 hover:text-text-primary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        )}
      >
        <NotificacaoIcon />
        {contagem > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {contagem > 9 ? '9+' : contagem}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-border bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-medium text-text-primary">Notificações</span>
            {contagem > 0 && (
              <button
                type="button"
                onClick={() => void handleMarcarTodasLidas()}
                className="text-xs font-medium text-primary hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-auto">
            {listaQuery.isLoading && (
              <p className="px-4 py-6 text-center text-sm text-text-secondary">Carregando...</p>
            )}
            {!listaQuery.isLoading && notificacoes.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-text-secondary">Nenhuma notificação.</p>
            )}
            <ul>
              {notificacoes.map((notificacao) => (
                <li key={notificacao.id}>
                  <button
                    type="button"
                    onClick={() => void handleItemClick(notificacao)}
                    className={cn(
                      'flex w-full flex-col gap-0.5 border-b border-border px-4 py-3 text-left last:border-0',
                      'transition-colors duration-200 hover:bg-text-primary/5',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {!notificacao.lida && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                      <span className="truncate text-sm font-medium text-text-primary">{notificacao.titulo}</span>
                    </div>
                    <p className="truncate text-xs text-text-secondary">{notificacao.corpo}</p>
                    <span className="font-mono text-[10px] text-text-secondary">
                      {formatRelativeTime(notificacao.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
