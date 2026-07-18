import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { assembleiasApi } from '@/services/api/assembleiasApi';
import { ApiError } from '@/services/api/client';
import type { AssembleiaResponse, OpcaoVoto } from '@/services/api/types';

export interface AssembleiaCardProps {
  assembleia: AssembleiaResponse;
  isAdmin: boolean;
  isMorador: boolean;
}

const STATUS_LABEL: Record<AssembleiaResponse['status'], string> = {
  planejada: 'Planejada',
  'em-votacao': 'Em votação',
  encerrada: 'Encerrada',
};

const VOTO_LABEL: Record<OpcaoVoto, string> = {
  sim: 'Sim',
  nao: 'Não',
  abstencao: 'Abstenção',
};

export function AssembleiaCard({ assembleia, isAdmin, isMorador }: AssembleiaCardProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const avancarStatusMutation = useMutation({
    mutationFn: (status: 'em-votacao' | 'encerrada') => assembleiasApi.updateStatus(assembleia.id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assembleias'] });
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao mudar o status.');
    },
  });

  const votarMutation = useMutation({
    mutationFn: (voto: OpcaoVoto) => assembleiasApi.votar(assembleia.id, { voto }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assembleias'] });
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao votar.');
    },
  });

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-text-primary">{assembleia.titulo}</h3>
            <p className="font-mono text-xs text-text-secondary">
              {new Date(assembleia.data).toLocaleString('pt-BR')}
            </p>
          </div>
          <Badge status={assembleia.status}>{STATUS_LABEL[assembleia.status]}</Badge>
        </div>

        {assembleia.pauta && (
          <p className="text-sm text-text-secondary">
            <strong>Pauta:</strong> {assembleia.pauta}
          </p>
        )}
        {assembleia.descricao && <p className="text-sm text-text-secondary">{assembleia.descricao}</p>}

        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <span>Sim: {assembleia.votos.sim}</span>
          <span>Não: {assembleia.votos.nao}</span>
          <span>Abstenção: {assembleia.votos.abstencao}</span>
          <span className="font-medium text-text-primary">Total: {assembleia.votos.total}</span>
        </div>

        {isAdmin && assembleia.status === 'planejada' && (
          <Button
            size="sm"
            className="self-start"
            loading={avancarStatusMutation.isPending}
            onClick={() => avancarStatusMutation.mutate('em-votacao')}
          >
            Abrir votação
          </Button>
        )}
        {isAdmin && assembleia.status === 'em-votacao' && (
          <Button
            size="sm"
            variant="secondary"
            className="self-start"
            loading={avancarStatusMutation.isPending}
            onClick={() => avancarStatusMutation.mutate('encerrada')}
          >
            Encerrar votação
          </Button>
        )}

        {isMorador && assembleia.status === 'em-votacao' && !assembleia.meuVoto && (
          <div className="flex gap-2">
            {(['sim', 'nao', 'abstencao'] as const).map((opcao) => (
              <Button
                key={opcao}
                size="sm"
                variant="secondary"
                loading={votarMutation.isPending}
                onClick={() => votarMutation.mutate(opcao)}
              >
                {VOTO_LABEL[opcao]}
              </Button>
            ))}
          </div>
        )}
        {isMorador && assembleia.meuVoto && (
          <p className="text-sm text-text-secondary">Você votou: {VOTO_LABEL[assembleia.meuVoto]}</p>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Card>
  );
}
