import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Badge } from '@/components/ui/Badge';
import type { BadgeStatus } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/formatDate';
import { visitantesApi } from '@/services/api/visitantesApi';
import type { VisitanteResponse } from '@/services/api/types';

// "ativo" no schema cobre tanto "está na portaria agora" quanto "já visitou e já saiu" (o status não
// muda no checkout, só horaSaida é preenchida) — por isso o rótulo/cor exibido depende dos dois
// campos juntos, não só do status cru.
function displayStatus(visitante: VisitanteResponse): { status: BadgeStatus; label: string } {
  if (visitante.status === 'ativo' && visitante.horaSaida) {
    return { status: 'resolvido', label: 'Visita concluída' };
  }
  if (visitante.status === 'ativo') {
    return { status: 'ativo', label: 'Na portaria' };
  }
  if (visitante.status === 'bloqueado') {
    return { status: 'bloqueado', label: 'Bloqueado' };
  }
  return { status: 'aprovado', label: 'Aprovado' };
}

export interface VisitanteCardProps {
  visitante: VisitanteResponse;
  canManage: boolean;
}

export function VisitanteCard({ visitante, canManage }: VisitanteCardProps) {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['visitantes'] });

  const entradaMutation = useMutation({
    mutationFn: () => visitantesApi.registrarEntrada(visitante.id),
    onSuccess: invalidate,
  });
  const saidaMutation = useMutation({
    mutationFn: () => visitantesApi.registrarSaida(visitante.id),
    onSuccess: invalidate,
  });
  const bloquearMutation = useMutation({
    mutationFn: () => visitantesApi.updateStatus(visitante.id, 'bloqueado'),
    onSuccess: invalidate,
  });

  const pending = entradaMutation.isPending || saidaMutation.isPending || bloquearMutation.isPending;
  const anyError = entradaMutation.isError || saidaMutation.isError || bloquearMutation.isError;

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-lg font-semibold text-text-primary">
            {visitante.nomeVisitante}
          </h3>
          <Badge status={displayStatus(visitante).status}>{displayStatus(visitante).label}</Badge>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
          {visitante.rg && <span className="font-mono">RG {visitante.rg}</span>}
          {visitante.placaVeiculo && <span className="font-mono">{visitante.placaVeiculo}</span>}
        </div>

        <p className="font-mono text-xs text-text-secondary">
          Visita prevista: {formatDate(visitante.dataVisita)}
          {visitante.horaEntrada && ` · entrada ${formatDate(visitante.horaEntrada)}`}
          {visitante.horaSaida && ` · saída ${formatDate(visitante.horaSaida)}`}
        </p>

        {canManage && (
          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
            {visitante.status === 'aprovado' && (
              <>
                <Button size="sm" loading={pending} onClick={() => entradaMutation.mutate()}>
                  Registrar entrada
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  loading={pending}
                  onClick={() => bloquearMutation.mutate()}
                >
                  Bloquear
                </Button>
              </>
            )}
            {visitante.status === 'ativo' && !visitante.horaSaida && (
              <Button size="sm" loading={pending} onClick={() => saidaMutation.mutate()}>
                Registrar saída
              </Button>
            )}
          </div>
        )}

        {anyError && <p className="text-sm text-danger">Não foi possível concluir a ação. Tente de novo.</p>}
      </div>
    </Card>
  );
}
