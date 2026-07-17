import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { roleHome } from '@/routes/roleHome';
import { useAuth } from '@/store/useAuth';

export function RequireGuest({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();

  if (status === 'authenticated' && user) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return <>{children}</>;
}
