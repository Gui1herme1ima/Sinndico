import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { formatDate } from '@/lib/formatDate';
import { solicitacoesApi } from '@/services/api/solicitacoesApi';
import type {
  SolicitacaoCategoria,
  SolicitacaoPrioridade,
  SolicitacaoResponse,
  SolicitacaoStatus,
} from '@/services/api/types';

const CATEGORIA_LABELS: Record<SolicitacaoCategoria, string> = {
  manutencao: 'Manutenção',
  seguranca: 'Segurança',
  animal: 'Animal invasor',
  outra: 'Outra',
};

const STATUS_LABELS: Record<SolicitacaoStatus, string> = {
  aberto: 'Aberto',
  'em-progresso': 'Em progresso',
  resolvido: 'Resolvido',
};

const PRIORIDADE_LABELS: Record<SolicitacaoPrioridade, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
};

const STATUS_OPTIONS = (Object.keys(STATUS_LABELS) as SolicitacaoStatus[]).map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

const PRIORIDADE_OPTIONS = (Object.keys(PRIORIDADE_LABELS) as SolicitacaoPrioridade[]).map((value) => ({
  value,
  label: PRIORIDADE_LABELS[value],
}));

export interface SolicitacaoCardProps {
  solicitacao: SolicitacaoResponse;
  canManage: boolean;
}

export function SolicitacaoCard({ solicitacao, canManage }: SolicitacaoCardProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: { status?: SolicitacaoStatus; prioridade?: SolicitacaoPrioridade }) =>
      solicitacoesApi.update(solicitacao.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
    },
  });

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-text-secondary">{CATEGORIA_LABELS[solicitacao.categoria]}</p>
            <h3 className="font-display text-lg font-semibold text-text-primary">{solicitacao.titulo}</h3>
          </div>
          <div className="flex shrink-0 gap-2">
            <Badge status={solicitacao.status}>{STATUS_LABELS[solicitacao.status]}</Badge>
            <Badge status={solicitacao.prioridade}>{PRIORIDADE_LABELS[solicitacao.prioridade]}</Badge>
          </div>
        </div>

        <p className="text-sm text-text-secondary">{solicitacao.descricao}</p>

        <p className="font-mono text-xs text-text-secondary">
          Criado em {formatDate(solicitacao.dataCriacao)}
          {solicitacao.dataResolvimento && ` · resolvido em ${formatDate(solicitacao.dataResolvimento)}`}
        </p>

        {canManage && (
          <div className="flex flex-col gap-3 border-t border-border pt-3 sm:flex-row">
            <Select
              label="Status"
              className="sm:max-w-[200px]"
              value={solicitacao.status}
              disabled={mutation.isPending}
              onChange={(e) => mutation.mutate({ status: e.target.value as SolicitacaoStatus })}
              options={STATUS_OPTIONS}
            />
            <Select
              label="Prioridade"
              className="sm:max-w-[200px]"
              value={solicitacao.prioridade}
              disabled={mutation.isPending}
              onChange={(e) => mutation.mutate({ prioridade: e.target.value as SolicitacaoPrioridade })}
              options={PRIORIDADE_OPTIONS}
            />
          </div>
        )}
        {mutation.isError && (
          <p className="text-sm text-danger">Não foi possível atualizar. Tente de novo.</p>
        )}
      </div>
    </Card>
  );
}
