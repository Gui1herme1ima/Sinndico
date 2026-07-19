import type { ComponentType } from 'react';

import {
  AreaComumIcon,
  ComidaIcon,
  EncomendaIcon,
  type IconProps,
  SolicitacaoManutencaoIcon,
  UserIcon,
  VisitanteIcon,
} from '@/components/ui/icons';

interface EmptyIllustrationBaseProps {
  icon: ComponentType<IconProps>;
}

function EmptyIllustrationBase({ icon: Icon }: EmptyIllustrationBaseProps) {
  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-primary/10" />
      <div className="absolute inset-3 rounded-full bg-primary/5" />
      <Icon width={52} height={52} className="relative text-primary" />
      <span className="absolute right-3 top-5 h-2 w-2 rounded-full bg-accent" />
      <span className="absolute bottom-6 left-5 h-1.5 w-1.5 rounded-full bg-accent/60" />
    </div>
  );
}

export function SolicitacaoEmptyIllustration() {
  return <EmptyIllustrationBase icon={SolicitacaoManutencaoIcon} />;
}

export function EncomendaEmptyIllustration() {
  return <EmptyIllustrationBase icon={EncomendaIcon} />;
}

export function VisitanteEmptyIllustration() {
  return <EmptyIllustrationBase icon={VisitanteIcon} />;
}

export function ComidaEmptyIllustration() {
  return <EmptyIllustrationBase icon={ComidaIcon} />;
}

export function ReservaEmptyIllustration() {
  return <EmptyIllustrationBase icon={AreaComumIcon} />;
}

export function MoradorEmptyIllustration() {
  return <EmptyIllustrationBase icon={UserIcon} />;
}
