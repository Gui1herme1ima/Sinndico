import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';

import { ChatIcon, ComunicadoIcon, EncomendaIcon, IconProps, SolicitacaoManutencaoIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import type { UserRole } from '@/services/api/types';

interface NavItem {
  to: string;
  label: string;
  roles: UserRole[];
  icon?: ComponentType<IconProps>;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', roles: ['admin'] },
  { to: '/solicitacoes', label: 'Solicitações', roles: ['morador', 'admin'], icon: SolicitacaoManutencaoIcon },
  { to: '/encomendas', label: 'Encomendas', roles: ['morador', 'admin', 'porteiro'], icon: EncomendaIcon },
  { to: '/comunicados', label: 'Comunicados', roles: ['morador', 'admin', 'porteiro'], icon: ComunicadoIcon },
  { to: '/chat', label: 'Chat', roles: ['morador', 'admin'], icon: ChatIcon },
  { to: '/condominios', label: 'Condomínios', roles: ['superadmin'] },
];

export function Nav({ role }: { role: UserRole }) {
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  if (items.length === 0) return null;

  return (
    <nav className="flex flex-col gap-1 md:flex-row md:items-center md:gap-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-text-secondary hover:bg-text-primary/5 hover:text-text-primary',
            )
          }
        >
          {item.icon && <item.icon width={16} height={16} />}
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
