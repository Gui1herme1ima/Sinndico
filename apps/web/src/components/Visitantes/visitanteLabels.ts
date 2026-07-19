import type { BadgeStatus } from '@/components/ui/Badge';
import type { VisitanteResponse } from '@/services/api/types';

// "ativo" no schema cobre tanto "está na portaria agora" quanto "já visitou e já saiu" (o status não
// muda no checkout, só horaSaida é preenchida) — por isso o rótulo/cor exibido depende dos dois
// campos juntos, não só do status cru.
export function displayStatus(visitante: VisitanteResponse): { status: BadgeStatus; label: string } {
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
