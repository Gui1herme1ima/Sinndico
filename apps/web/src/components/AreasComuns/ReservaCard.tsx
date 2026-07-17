import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/formatDate';
import { reservasApi } from '@/services/api/reservasApi';
import type { ReservaResponse, ReservaStatus } from '@/services/api/types';

const STATUS_LABELS: Record<ReservaStatus, string> = {
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  cancelada: 'Cancelada',
};

export interface ReservaCardProps {
  reserva: ReservaResponse;
  areaNome: string;
  isOwner: boolean;
  isAdmin: boolean;
}

export function ReservaCard({ reserva, areaNome, isOwner, isAdmin }: ReservaCardProps) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['reservas'] });

  const aprovarMutation = useMutation({
    mutationFn: () => reservasApi.updateStatus(reserva.id, 'aprovada'),
    onSuccess: invalidate,
  });
  const cancelarMutation = useMutation({
    mutationFn: () => reservasApi.updateStatus(reserva.id, 'cancelada'),
    onSuccess: invalidate,
  });

  const pending = aprovarMutation.isPending || cancelarMutation.isPending;
  const anyError = aprovarMutation.isError || cancelarMutation.isError;

  const podeCancelar = reserva.status !== 'cancelada' && (isAdmin || isOwner);

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-lg font-semibold text-text-primary">{areaNome}</h3>
          <Badge status={reserva.status}>{STATUS_LABELS[reserva.status]}</Badge>
        </div>

        <p className="font-mono text-xs text-text-secondary">
          {formatDate(reserva.horaInicio)} até {formatDate(reserva.horaFim)}
        </p>

        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          {isAdmin && reserva.status === 'pendente' && (
            <Button size="sm" loading={pending} onClick={() => aprovarMutation.mutate()}>
              Aprovar
            </Button>
          )}
          {podeCancelar && (
            <Button
              size="sm"
              variant="danger"
              loading={pending}
              onClick={() => cancelarMutation.mutate()}
            >
              Cancelar
            </Button>
          )}
        </div>

        {anyError && <p className="text-sm text-danger">Não foi possível concluir a ação. Tente de novo.</p>}
      </div>
    </Card>
  );
}
