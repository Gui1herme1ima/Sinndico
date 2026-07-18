import { Outlet, useNavigate } from 'react-router-dom';

import { Header } from '@/components/Layout/Header';
import { Sidebar } from '@/components/Layout/Sidebar';
import { impersonation } from '@/services/impersonation';
import { useAuth } from '@/store/useAuth';

export function AppShell() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const viewingAs = impersonation.get();

  async function sairDoModoVerComo() {
    impersonation.clear();
    await refreshUser();
    navigate('/condominios', { replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      {viewingAs && (
        <div className="flex items-center justify-center gap-3 bg-accent/20 px-4 py-2 text-sm text-text-primary">
          <span>
            Você está vendo o painel de <strong>{viewingAs.nome}</strong> como superadmin.
          </span>
          <button
            type="button"
            onClick={() => void sairDoModoVerComo()}
            className="font-medium text-primary hover:underline"
          >
            Sair do modo "ver como"
          </button>
        </div>
      )}
      <Header />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-6 md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
