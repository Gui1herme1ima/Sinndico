import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/cn';
import type { UserRole } from '@/services/api/types';

interface NavItem {
  to: string;
  label: string;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', roles: ['admin'] },
  { to: '/solicitacoes', label: 'Solicitações', roles: ['morador', 'admin'] },
  { to: '/encomendas', label: 'Encomendas', roles: ['morador', 'admin', 'porteiro'] },
  { to: '/comunicados', label: 'Comunicados', roles: ['morador', 'admin', 'porteiro'] },
  { to: '/chat', label: 'Chat', roles: ['morador', 'admin'] },
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
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-text-secondary hover:bg-text-primary/5 hover:text-text-primary',
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
