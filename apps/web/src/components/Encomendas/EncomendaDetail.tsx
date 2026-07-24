import { STATUS_LABELS } from '@/components/Encomendas/encomendaLabels';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatResidencia } from '@/components/ui/MoradorSelect';
import { Timeline, type TimelineStep } from '@/components/ui/Timeline';
import type { EncomendaResponse, MoradorDiretorioResponse } from '@/services/api/types';

export interface EncomendaDetailProps {
  encomenda: EncomendaResponse;
  morador: MoradorDiretorioResponse | undefined;
  isMorador: boolean;
  pending: boolean;
  onSign: () => void;
}

export function EncomendaDetail({ encomenda, morador, isMorador, pending, onSign }: EncomendaDetailProps) {
  const steps: TimelineStep[] = [
    { label: 'Chegou na portaria', timestamp: encomenda.horarioChegada, state: 'done' },
    {
      label: 'Retirada confirmada',
      timestamp: encomenda.dataAssinatura,
      state: encomenda.assinado ? 'done' : 'pending',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="font-display text-lg font-semibold text-text-primary">
          {encomenda.descricao || 'Encomenda sem descrição'}
        </h4>
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
      </div>

      {morador && (
        <div className="text-sm text-text-secondary">
          <p className="font-medium text-text-primary">{morador.nome}</p>
          <p className="font-mono text-xs text-text-muted">{formatResidencia(morador.residencia)}</p>
        </div>
      )}

      <div>
        <Badge status={encomenda.status}>{STATUS_LABELS[encomenda.status]}</Badge>
      </div>

      <div className="border-t border-border pt-4">
        <Timeline steps={steps} />
      </div>

      {isMorador && !encomenda.assinado && (
        <div className="border-t border-border pt-4">
          <Button size="sm" loading={pending} onClick={onSign}>
            Confirmar retirada
          </Button>
        </div>
      )}
    </div>
  );
}
