import { Link } from 'react-router-dom';

import { IconBadge } from '@/components/ui/IconBadge';
import { ChevronRightIcon, ResidenciaIcon, UserIcon } from '@/components/ui/icons';
import type { SetorResponse } from '@/services/api/types';
import { SETOR_TIPO_OPTIONS } from '@/components/Residencias/CreateSetorForm';

function labelTipo(tipo: SetorResponse['tipo']): string {
  return SETOR_TIPO_OPTIONS.find((o) => o.value === tipo)?.label ?? tipo;
}

export interface SetorCardProps {
  setor: SetorResponse;
}

export function SetorCard({ setor }: SetorCardProps) {
  return (
    <Link
      to={`/residencias/${setor.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-primary/40 hover:shadow-md"
    >
      <IconBadge icon={<ResidenciaIcon width={20} height={20} />} className="group-hover:scale-105" />

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base font-semibold text-text-primary">{setor.nome}</p>
        <p className="text-xs text-text-muted">{labelTipo(setor.tipo)}</p>
        <div className="mt-2 flex items-center gap-4 text-sm text-text-secondary">
          <span className="flex items-center gap-1.5">
            <ResidenciaIcon width={14} height={14} />
            {setor.residenciasCount} residência(s)
          </span>
          <span className="flex items-center gap-1.5">
            <UserIcon width={14} height={14} />
            {setor.moradoresCount} morador(es)
          </span>
        </div>
      </div>

      <ChevronRightIcon width={18} height={18} className="text-text-muted transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
