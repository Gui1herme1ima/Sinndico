import { STATUS_LABELS } from '@/components/Comida/comidaLabels';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatResidencia } from '@/components/ui/MoradorSelect';
import { formatDate } from '@/lib/formatDate';
import type { ComidaResponse, MoradorDiretorioResponse } from '@/services/api/types';

export interface ComidaDetailProps {
  comida: ComidaResponse;
  morador: MoradorDiretorioResponse | undefined;
  isMorador: boolean;
  canManage: boolean;
  pending: boolean;
  onACaminho: () => void;
  onChegou: () => void;
  onRetirada: () => void;
}

export function ComidaDetail({
  comida,
  morador,
  isMorador,
  canManage,
  pending,
  onACaminho,
  onChegou,
  onRetirada,
}: ComidaDetailProps) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-display text-lg font-semibold text-text-primary">{comida.restaurante}</h4>

      {morador && (
        <div className="text-sm text-text-secondary">
          <p className="font-medium text-text-primary">{morador.nome}</p>
          <p className="font-mono text-xs text-text-muted">{formatResidencia(morador.residencia)}</p>
        </div>
      )}

      <Badge status={comida.status}>{STATUS_LABELS[comida.status]}</Badge>

      <p className="text-xs text-text-muted">Chegada estimada {formatDate(comida.horarioChegadaEstimada)}</p>

      {(isMorador || canManage) &&
        (comida.status === 'pedido-feito' || comida.status === 'em-caminho' || comida.status === 'chegou') && (
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            {isMorador && comida.status === 'pedido-feito' && (
              <Button size="sm" loading={pending} onClick={onACaminho}>
                Pedido a caminho
              </Button>
            )}
            {isMorador && comida.status === 'chegou' && (
              <Button size="sm" loading={pending} onClick={onRetirada}>
                Confirmar retirada
              </Button>
            )}
            {canManage && (comida.status === 'pedido-feito' || comida.status === 'em-caminho') && (
              <Button size="sm" loading={pending} onClick={onChegou}>
                Confirmar chegada
              </Button>
            )}
          </div>
        )}
    </div>
  );
}
