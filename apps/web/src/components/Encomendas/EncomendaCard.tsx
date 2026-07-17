import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/formatDate';
import { encomendasApi } from '@/services/api/encomendasApi';
import type { EncomendaResponse, EncomendaStatus } from '@/services/api/types';

const STATUS_LABELS: Record<EncomendaStatus, string> = {
  aguardando: 'Aguardando retirada',
  retirada: 'Retirada',
};

export interface EncomendaCardProps {
  encomenda: EncomendaResponse;
  canSign: boolean;
}

export function EncomendaCard({ encomenda, canSign }: EncomendaCardProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => encomendasApi.sign(encomenda.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encomendas'] });
    },
  });

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-text-primary">
              {encomenda.descricao || 'Encomenda sem descrição'}
            </h3>
            <p className="font-mono text-xs text-text-secondary">
              Chegou em {formatDate(encomenda.horarioChegada)}
            </p>
          </div>
          <Badge status={encomenda.status}>{STATUS_LABELS[encomenda.status]}</Badge>
        </div>

        {encomenda.fotoUrl && (
          <a
            href={encomenda.fotoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver foto
          </a>
        )}

        {encomenda.assinado && encomenda.dataAssinatura && (
          <p className="text-sm text-text-secondary">
            Retirada assinada em {formatDate(encomenda.dataAssinatura)}
          </p>
        )}

        {canSign && !encomenda.assinado && (
          <Button
            size="sm"
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
            className="self-start"
          >
            Confirmar retirada
          </Button>
        )}

        {mutation.isError && (
          <p className="text-sm text-danger">Não foi possível confirmar a retirada. Tente de novo.</p>
        )}
      </div>
    </Card>
  );
}
