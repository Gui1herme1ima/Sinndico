import { STATUS_LABELS } from '@/components/AreasComuns/reservaLabels';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatResidencia } from '@/components/ui/MoradorSelect';
import { formatDate } from '@/lib/formatDate';
import type { MoradorDiretorioResponse, ReservaResponse } from '@/services/api/types';

export interface ReservaDetailProps {
  reserva: ReservaResponse;
  morador: MoradorDiretorioResponse | undefined;
  areaNome: string;
  podeAprovar: boolean;
  podeCancelar: boolean;
  pending: boolean;
  onAprovar: () => void;
  onCancelar: () => void;
}

export function ReservaDetail({
  reserva,
  morador,
  areaNome,
  podeAprovar,
  podeCancelar,
  pending,
  onAprovar,
  onCancelar,
}: ReservaDetailProps) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-display text-lg font-semibold text-text-primary">{areaNome}</h4>

      {morador && (
        <div className="text-sm text-text-secondary">
          <p className="font-medium text-text-primary">{morador.nome}</p>
          <p className="font-mono text-xs text-text-muted">{formatResidencia(morador.residencia)}</p>
        </div>
      )}

      <Badge status={reserva.status}>{STATUS_LABELS[reserva.status]}</Badge>

      <div className="text-xs text-text-muted">
        <p>Início {formatDate(reserva.horaInicio)}</p>
        <p>Até {formatDate(reserva.horaFim)}</p>
      </div>

      {(podeAprovar || podeCancelar) && (
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {podeAprovar && (
            <Button size="sm" loading={pending} onClick={onAprovar}>
              Aprovar
            </Button>
          )}
          {podeCancelar && (
            <Button size="sm" variant="danger" loading={pending} onClick={onCancelar}>
              Cancelar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
