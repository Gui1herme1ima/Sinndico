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
import { formatDate } from '@/lib/formatDate';
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

      <p className="text-xs text-text-muted">
        Criada em {formatDate(solicitacao.dataCriacao)}
        {solicitacao.dataResolvimento && <> · resolvida em {formatDate(solicitacao.dataResolvimento)}</>}
      </p>

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
