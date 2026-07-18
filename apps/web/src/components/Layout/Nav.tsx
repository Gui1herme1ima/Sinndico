import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';

import {
  AreaComumIcon,
  AssembleiaIcon,
  ChatIcon,
  ComunicadoIcon,
  EncomendaIcon,
  IconProps,
  SolicitacaoManutencaoIcon,
  VisitanteIcon,
} from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { prefetchRoute } from '@/routes/routePrefetch';
import type { PermissoesPorteiro, UserRole } from '@/services/api/types';

interface NavItem {
  to: string;
  label: string;
  roles: UserRole[];
  icon?: ComponentType<IconProps>;
  // sem group = módulo operacional (topo, sem rótulo); 'cadastros' = agrupado sob o rótulo "Cadastros".
  group?: 'cadastros';
  // presente só nos módulos onde o acesso do porteiro é configurável por tenant (Fatia 5/RBAC) —
  // some do menu se o admin desligou o módulo pra portaria daquele condomínio.
  moduleKey?: keyof PermissoesPorteiro;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', roles: ['admin'] },
  { to: '/solicitacoes', label: 'Solicitações', roles: ['morador', 'admin'], icon: SolicitacaoManutencaoIcon },
  {
    to: '/encomendas',
    label: 'Encomendas',
    roles: ['morador', 'admin', 'porteiro'],
    icon: EncomendaIcon,
    moduleKey: 'encomendas',
  },
  {
    to: '/comunicados',
    label: 'Comunicados',
    roles: ['morador', 'admin', 'porteiro'],
    icon: ComunicadoIcon,
    moduleKey: 'comunicados',
  },
  { to: '/chat', label: 'Chat', roles: ['morador', 'admin'], icon: ChatIcon },
  {
    to: '/visitantes',
    label: 'Visitantes',
    roles: ['morador', 'admin', 'porteiro'],
    icon: VisitanteIcon,
    moduleKey: 'visitantes',
  },
  { to: '/comida', label: 'Comida', roles: ['morador', 'admin', 'porteiro'], moduleKey: 'comida' },
  {
    to: '/areas-comuns',
    label: 'Áreas comuns',
    roles: ['morador', 'admin'],
    icon: AreaComumIcon,
  },
  {
    to: '/assembleias',
    label: 'Assembleias',
    roles: ['morador', 'admin'],
    icon: AssembleiaIcon,
  },
  { to: '/residencias', label: 'Residências', roles: ['admin'], group: 'cadastros' },
  { to: '/moradores', label: 'Moradores', roles: ['admin'], group: 'cadastros' },
  { to: '/equipe', label: 'Equipe', roles: ['admin'], group: 'cadastros' },
  { to: '/permissoes', label: 'Permissões', roles: ['admin'], group: 'cadastros' },
  { to: '/condominios', label: 'Condomínios', roles: ['superadmin'], group: 'cadastros' },
];

function linkClassName({ isActive }: { isActive: boolean }) {
  return cn(
    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
    isActive
      ? 'bg-primary/10 text-primary'
      : 'text-text-secondary hover:bg-text-primary/5 hover:text-text-primary',
  );
}

export interface NavProps {
  role: UserRole;
  permissoesPorteiro?: PermissoesPorteiro;
}

export function Nav({ role, permissoesPorteiro }: NavProps) {
  const items = NAV_ITEMS.filter((item) => {
    if (!item.roles.includes(role)) return false;
    if (role === 'porteiro' && item.moduleKey && permissoesPorteiro?.[item.moduleKey] === false) {
      return false;
    }
    return true;
  });

  if (items.length === 0) return null;

  const principais = items.filter((item) => !item.group);
  const cadastros = items.filter((item) => item.group === 'cadastros');

  return (
    <nav className="flex flex-col gap-1">
      {principais.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={linkClassName}
          onMouseEnter={() => prefetchRoute(item.to)}
          onFocus={() => prefetchRoute(item.to)}
        >
          {item.icon && <item.icon width={16} height={16} />}
          {item.label}
        </NavLink>
      ))}

      {cadastros.length > 0 && (
        <>
          <p className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Cadastros
          </p>
          {cadastros.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClassName}
              onMouseEnter={() => prefetchRoute(item.to)}
              onFocus={() => prefetchRoute(item.to)}
            >
              {item.icon && <item.icon width={16} height={16} />}
              {item.label}
            </NavLink>
          ))}
        </>
      )}
    </nav>
  );
}
