import {
  CATEGORIA_LABELS,
  PRIORIDADE_LABELS,
  PRIORIDADE_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
} from '@/components/Solicitacoes/solicitacaoLabels';
import { Badge } from '@/components/ui/Badge';
import { formatResidencia } from '@/components/ui/MoradorSelect';
import { Select } from '@/components/ui/Select';
import { Timeline, type TimelineStep } from '@/components/ui/Timeline';
import type {
  MoradorDiretorioResponse,
  SolicitacaoPrioridade,
  SolicitacaoResponse,
  SolicitacaoStatus,
} from '@/services/api/types';

export interface SolicitacaoDetailProps {
  solicitacao: SolicitacaoResponse;
  morador: MoradorDiretorioResponse | undefined;
  isAdmin: boolean;
  pending: boolean;
  onChangeStatus: (status: SolicitacaoStatus) => void;
  onChangePrioridade: (prioridade: SolicitacaoPrioridade) => void;
}

export function SolicitacaoDetail({
  solicitacao,
  morador,
  isAdmin,
  pending,
  onChangeStatus,
  onChangePrioridade,
}: SolicitacaoDetailProps) {
  const steps: TimelineStep[] = [
    { label: 'Criada', timestamp: solicitacao.dataCriacao, state: 'done' },
    {
      label: 'Em progresso',
      state:
        solicitacao.status === 'aberto' ? 'pending' : solicitacao.status === 'em-progresso' ? 'active' : 'done',
    },
    {
      label: 'Resolvida',
      timestamp: solicitacao.dataResolvimento,
      state: solicitacao.status === 'resolvido' ? 'done' : 'pending',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.04em] text-text-muted">
          {CATEGORIA_LABELS[solicitacao.categoria]}
        </p>
        <h4 className="font-display text-lg font-semibold text-text-primary">{solicitacao.titulo}</h4>
      </div>

      <p className="whitespace-pre-wrap text-sm text-text-secondary">{solicitacao.descricao}</p>

      {morador && (
        <div className="text-sm text-text-secondary">
          <p className="font-medium text-text-primary">{morador.nome}</p>
          <p className="font-mono text-xs text-text-muted">{formatResidencia(morador.residencia)}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Badge status={solicitacao.prioridade}>{PRIORIDADE_LABELS[solicitacao.prioridade]}</Badge>
        <Badge status={solicitacao.status}>{STATUS_LABELS[solicitacao.status]}</Badge>
      </div>

      <div className="border-t border-border pt-4">
        <Timeline steps={steps} />
      </div>

      {isAdmin && (
        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <Select
            label="Status"
            value={solicitacao.status}
            disabled={pending}
            onChange={(e) => onChangeStatus(e.target.value as SolicitacaoStatus)}
            options={STATUS_OPTIONS}
          />
          <Select
            label="Prioridade"
            value={solicitacao.prioridade}
            disabled={pending}
            onChange={(e) => onChangePrioridade(e.target.value as SolicitacaoPrioridade)}
            options={PRIORIDADE_OPTIONS}
          />
        </div>
      )}
    </div>
  );
}
