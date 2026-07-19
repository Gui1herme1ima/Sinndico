import { displayStatus } from '@/components/Visitantes/visitanteLabels';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatResidencia } from '@/components/ui/MoradorSelect';
import { formatDate } from '@/lib/formatDate';
import type { MoradorDiretorioResponse, VisitanteResponse } from '@/services/api/types';

export interface VisitanteDetailProps {
  visitante: VisitanteResponse;
  morador: MoradorDiretorioResponse | undefined;
  canManage: boolean;
  pending: boolean;
  onEntrada: () => void;
  onSaida: () => void;
  onBloquear: () => void;
}

export function VisitanteDetail({
  visitante,
  morador,
  canManage,
  pending,
  onEntrada,
  onSaida,
  onBloquear,
}: VisitanteDetailProps) {
  const { status, label } = displayStatus(visitante);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="font-display text-lg font-semibold text-text-primary">{visitante.nomeVisitante}</h4>
        <p className="text-sm text-text-secondary">
          {[visitante.rg && `RG ${visitante.rg}`, visitante.placaVeiculo].filter(Boolean).join(' · ')}
        </p>
      </div>

      {morador && (
        <div className="text-sm text-text-secondary">
          <p className="font-medium text-text-primary">{morador.nome}</p>
          <p className="font-mono text-xs text-text-muted">{formatResidencia(morador.residencia)}</p>
        </div>
      )}

      <Badge status={status}>{label}</Badge>

      <div className="text-xs text-text-muted">
        <p>Visita {formatDate(visitante.dataVisita)}</p>
        {visitante.horaEntrada && <p>Entrada {formatDate(visitante.horaEntrada)}</p>}
        {visitante.horaSaida && <p>Saída {formatDate(visitante.horaSaida)}</p>}
      </div>

      {canManage && (visitante.status === 'aprovado' || (visitante.status === 'ativo' && !visitante.horaSaida)) && (
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {visitante.status === 'aprovado' && (
            <>
              <Button size="sm" loading={pending} onClick={onEntrada}>
                Registrar entrada
              </Button>
              <Button size="sm" variant="danger" loading={pending} onClick={onBloquear}>
                Bloquear
              </Button>
            </>
          )}
          {visitante.status === 'ativo' && !visitante.horaSaida && (
            <Button size="sm" loading={pending} onClick={onSaida}>
              Registrar saída
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
