import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from '@/components/Layout/AppShell';
import { AreasComunsPage } from '@/pages/AreasComuns/AreasComunsPage';
import { ChangePasswordPage } from '@/pages/auth/ChangePasswordPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ChatPage } from '@/pages/Chat/ChatPage';
import { ComidaPage } from '@/pages/Comida/ComidaPage';
import { CondominiosPage } from '@/pages/Condominios/CondominiosPage';
import { ComunicadosPage } from '@/pages/Comunicados/ComunicadosPage';
import { DashboardPage } from '@/pages/Dashboard/DashboardPage';
import { EncomendasPage } from '@/pages/Encomendas/EncomendasPage';
import { SolicitacoesPage } from '@/pages/Solicitacoes/SolicitacoesPage';
import { VisitantesPage } from '@/pages/Visitantes/VisitantesPage';
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
      {/* /login é reservado pro superadmin (não pertence a nenhum tenant); /:tenantSlug/login resolve
          o condomínio via GET /api/condominios/by-slug/:slug só pra exibir o nome — o login em si
          funciona igual nos dois casos (username/e-mail + senha). */}
      <Route
        path="/login"
        element={
          <RequireGuest>
            <LoginPage />
          </RequireGuest>
        }
      />
      <Route
        path="/:tenantSlug/login"
        element={
          <RequireGuest>
            <LoginPage />
          </RequireGuest>
        }
      />
      <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
      <Route path="/:tenantSlug/esqueci-senha" element={<ForgotPasswordPage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
      <Route
        path="/trocar-senha"
        element={
          <RequireAuth>
            <ChangePasswordPage />
          </RequireAuth>
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
              <DashboardPage />
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
              <ChatPage />
            </RequireAuth>
          }
        />
        <Route
          path="condominios"
          element={
            <RequireAuth roles={['superadmin']}>
              <CondominiosPage />
            </RequireAuth>
          }
        />
        <Route
          path="visitantes"
          element={
            <RequireAuth roles={['morador', 'admin', 'porteiro']}>
              <VisitantesPage />
            </RequireAuth>
          }
        />
        <Route
          path="comida"
          element={
            <RequireAuth roles={['morador', 'admin', 'porteiro']}>
              <ComidaPage />
            </RequireAuth>
          }
        />
        <Route
          path="areas-comuns"
          element={
            <RequireAuth roles={['morador', 'admin']}>
              <AreasComunsPage />
            </RequireAuth>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
