import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { roleHome } from '@/routes/roleHome';
import { SemAcessoAoModulo } from '@/routes/SemAcessoAoModulo';
import { useAuth } from '@/store/useAuth';

export function RequireGuest({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();

  if (status === 'authenticated' && user) {
    const home = roleHome(user.role, user.permissoesPorteiro);
    if (!home) return <SemAcessoAoModulo />;
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}
