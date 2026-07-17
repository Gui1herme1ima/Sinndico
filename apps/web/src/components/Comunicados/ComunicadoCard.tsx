import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/formatDate';
import { comunicadosApi } from '@/services/api/comunicadosApi';
import type { ComunicadoResponse } from '@/services/api/types';

export interface ComunicadoCardProps {
  comunicado: ComunicadoResponse;
}

export function ComunicadoCard({ comunicado }: ComunicadoCardProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => comunicadosApi.markAsRead(comunicado.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comunicados'] });
    },
  });

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-lg font-semibold text-text-primary">{comunicado.titulo}</h3>
          {!comunicado.lido && <Badge status="novo">Novo</Badge>}
        </div>

        <p className="text-sm text-text-secondary">{comunicado.conteudo}</p>

        <p className="font-mono text-xs text-text-secondary">
          Publicado em {formatDate(comunicado.dataCriacao)}
        </p>

        {!comunicado.lido && (
          <Button
            size="sm"
            variant="secondary"
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
            className="self-start"
          >
            Marcar como lido
          </Button>
        )}

        {mutation.isError && (
          <p className="text-sm text-danger">Não foi possível marcar como lido. Tente de novo.</p>
        )}
      </div>
    </Card>
  );
}
