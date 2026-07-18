import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { Skeleton } from '@/components/ui/Skeleton';
import { roleHome } from '@/routes/roleHome';
import { SemAcessoAoModulo } from '@/routes/SemAcessoAoModulo';
import type { PermissoesPorteiro, UserRole } from '@/services/api/types';
import { useAuth } from '@/store/useAuth';

interface RequireAuthProps {
  roles?: UserRole[];
  // presente só nas rotas de módulo cujo acesso do porteiro é configurável por tenant (Fatia 5) —
  // bloqueia navegação direta por URL do mesmo jeito que Nav já esconde o item do menu.
  moduleKey?: keyof PermissoesPorteiro;
  children: ReactNode;
}

const CHANGE_PASSWORD_PATH = '/trocar-senha';

export function RequireAuth({ roles, moduleKey, children }: RequireAuthProps) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    );
  }

  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.mustChangePassword && location.pathname !== CHANGE_PASSWORD_PATH) {
    return <Navigate to={CHANGE_PASSWORD_PATH} replace />;
  }

  const semAcessoAoModulo =
    (roles && !roles.includes(user.role)) ||
    (user.role === 'porteiro' && moduleKey && user.permissoesPorteiro?.[moduleKey] === false);

  if (semAcessoAoModulo) {
    const home = roleHome(user.role, user.permissoesPorteiro);
    // home null só no caso degenerado de o admin ter desligado os 4 módulos da portaria ao mesmo
    // tempo — não há Navigate seguro (o alvo padrão também estaria bloqueado, o que criaria um loop).
    if (!home) {
      return <SemAcessoAoModulo />;
    }
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}
