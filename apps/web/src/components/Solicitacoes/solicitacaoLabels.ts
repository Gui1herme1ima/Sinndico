import type { SolicitacaoCategoria, SolicitacaoPrioridade, SolicitacaoStatus } from '@/services/api/types';

export const CATEGORIA_LABELS: Record<SolicitacaoCategoria, string> = {
  manutencao: 'Manutenção',
  seguranca: 'Segurança',
  animal: 'Animal invasor',
  outra: 'Outra',
};

export const STATUS_LABELS: Record<SolicitacaoStatus, string> = {
  aberto: 'Aberto',
  'em-progresso': 'Em progresso',
  resolvido: 'Resolvido',
};

export const PRIORIDADE_LABELS: Record<SolicitacaoPrioridade, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
};

export const STATUS_OPTIONS = (Object.keys(STATUS_LABELS) as SolicitacaoStatus[]).map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

export const PRIORIDADE_OPTIONS = (Object.keys(PRIORIDADE_LABELS) as SolicitacaoPrioridade[]).map((value) => ({
  value,
  label: PRIORIDADE_LABELS[value],
}));
