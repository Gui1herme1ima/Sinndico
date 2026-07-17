import { useState } from 'react';

import { Nav } from '@/components/Layout/Nav';
import { LogOutIcon, MenuIcon, UserIcon, XIcon } from '@/components/ui/icons';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/store/useAuth';

export function Header() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Logo />
          <div className="hidden md:block">
            <Nav role={user.role} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <div className="hidden items-center gap-3 md:flex">
            <span className="flex items-center gap-1.5 text-sm text-text-secondary">
              <UserIcon width={16} height={16} />
              {user.nome}
            </span>
            <button
              type="button"
              onClick={() => void logout()}
              aria-label="Sair"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors duration-200 hover:bg-text-primary/5 hover:text-danger"
            >
              <LogOutIcon />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary md:hidden"
          >
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <Nav role={user.role} />
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-danger"
          >
            <LogOutIcon width={16} height={16} />
            Sair
          </button>
        </div>
      )}
    </header>
  );
}
