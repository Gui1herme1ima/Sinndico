import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/formatDate';
import { comidaApi } from '@/services/api/comidaApi';
import type { ComidaResponse, ComidaStatus } from '@/services/api/types';

const STATUS_LABELS: Record<ComidaStatus, string> = {
  'pedido-feito': 'Pedido feito',
  'em-caminho': 'A caminho',
  chegou: 'Chegou na portaria',
  retirada: 'Retirado',
};

export interface ComidaCardProps {
  comida: ComidaResponse;
  isMorador: boolean;
  canManage: boolean;
}

export function ComidaCard({ comida, isMorador, canManage }: ComidaCardProps) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['comida'] });

  const aCaminhoMutation = useMutation({
    mutationFn: () => comidaApi.updateStatus(comida.id, 'em-caminho'),
    onSuccess: invalidate,
  });
  const chegouMutation = useMutation({
    mutationFn: () => comidaApi.updateStatus(comida.id, 'chegou'),
    onSuccess: invalidate,
  });
  const retiradaMutation = useMutation({
    mutationFn: () => comidaApi.updateStatus(comida.id, 'retirada'),
    onSuccess: invalidate,
  });

  const pending = aCaminhoMutation.isPending || chegouMutation.isPending || retiradaMutation.isPending;
  const anyError = aCaminhoMutation.isError || chegouMutation.isError || retiradaMutation.isError;

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-lg font-semibold text-text-primary">{comida.restaurante}</h3>
          <Badge status={comida.status}>{STATUS_LABELS[comida.status]}</Badge>
        </div>

        <p className="font-mono text-xs text-text-secondary">
          Chegada estimada: {formatDate(comida.horarioChegadaEstimada)}
        </p>

        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          {isMorador && comida.status === 'pedido-feito' && (
            <Button size="sm" loading={pending} onClick={() => aCaminhoMutation.mutate()}>
              Pedido a caminho
            </Button>
          )}
          {isMorador && comida.status === 'chegou' && (
            <Button size="sm" loading={pending} onClick={() => retiradaMutation.mutate()}>
              Confirmar retirada
            </Button>
          )}
          {canManage && (comida.status === 'pedido-feito' || comida.status === 'em-caminho') && (
            <Button size="sm" loading={pending} onClick={() => chegouMutation.mutate()}>
              Confirmar chegada
            </Button>
          )}
        </div>

        {anyError && <p className="text-sm text-danger">Não foi possível concluir a ação. Tente de novo.</p>}
      </div>
    </Card>
  );
}
