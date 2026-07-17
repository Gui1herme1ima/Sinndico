import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from '@/components/Layout/AppShell';
import { ComingSoonPage } from '@/pages/ComingSoonPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ComunicadosPage } from '@/pages/Comunicados/ComunicadosPage';
import { EncomendasPage } from '@/pages/Encomendas/EncomendasPage';
import { SolicitacoesPage } from '@/pages/Solicitacoes/SolicitacoesPage';
import { RequireAuth } from '@/routes/RequireAuth';
import { RequireGuest } from '@/routes/RequireGuest';
import { roleHome } from '@/routes/roleHome';
import { useAuth } from '@/store/useAuth';

function IndexRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? roleHome(user.role) : '/login'} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RequireGuest>
            <LoginPage />
          </RequireGuest>
        }
      />
      <Route
        path="/register"
        element={
          <RequireGuest>
            <RegisterPage />
          </RequireGuest>
        }
      />

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<IndexRedirect />} />
        <Route
          path="dashboard"
          element={
            <RequireAuth roles={['admin']}>
              <ComingSoonPage title="Dashboard" />
            </RequireAuth>
          }
        />
        <Route
          path="solicitacoes"
          element={
            <RequireAuth roles={['morador', 'admin']}>
              <SolicitacoesPage />
            </RequireAuth>
          }
        />
        <Route
          path="encomendas"
          element={
            <RequireAuth roles={['morador', 'admin', 'porteiro']}>
              <EncomendasPage />
            </RequireAuth>
          }
        />
        <Route
          path="comunicados"
          element={
            <RequireAuth roles={['morador', 'admin', 'porteiro']}>
              <ComunicadosPage />
            </RequireAuth>
          }
        />
        <Route
          path="chat"
          element={
            <RequireAuth roles={['morador', 'admin']}>
              <ComingSoonPage title="Chat" />
            </RequireAuth>
          }
        />
        <Route path="em-construcao" element={<ComingSoonPage title="Área do superadmin" />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
