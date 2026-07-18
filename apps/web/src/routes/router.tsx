import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from '@/components/Layout/AppShell';
import { RouteFallback } from '@/components/Layout/RouteFallback';
import { RequireAuth } from '@/routes/RequireAuth';
import { RequireGuest } from '@/routes/RequireGuest';
import { roleHome } from '@/routes/roleHome';
import { SemAcessoAoModulo } from '@/routes/SemAcessoAoModulo';
import { useAuth } from '@/store/useAuth';

// Code splitting (Fatia 4.1): cada página vira um chunk próprio, carregado sob demanda pela rota.
// O shell (AppShell/Require*/Nav) e o roteador ficam no bundle inicial; o corpo de cada tela só é
// baixado quando o usuário navega até ela. As páginas usam export nomeado, então o import dinâmico
// remapeia pro `default` que o React.lazy espera.
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import('@/pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
);
const ChangePasswordPage = lazy(() =>
  import('@/pages/auth/ChangePasswordPage').then((m) => ({ default: m.ChangePasswordPage })),
);
const DashboardPage = lazy(() =>
  import('@/pages/Dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const ResidenciasPage = lazy(() =>
  import('@/pages/Residencias/ResidenciasPage').then((m) => ({ default: m.ResidenciasPage })),
);
const MoradoresPage = lazy(() =>
  import('@/pages/Moradores/MoradoresPage').then((m) => ({ default: m.MoradoresPage })),
);
const EquipePage = lazy(() => import('@/pages/Equipe/EquipePage').then((m) => ({ default: m.EquipePage })));
const PermissoesPage = lazy(() =>
  import('@/pages/Permissoes/PermissoesPage').then((m) => ({ default: m.PermissoesPage })),
);
const SolicitacoesPage = lazy(() =>
  import('@/pages/Solicitacoes/SolicitacoesPage').then((m) => ({ default: m.SolicitacoesPage })),
);
const EncomendasPage = lazy(() =>
  import('@/pages/Encomendas/EncomendasPage').then((m) => ({ default: m.EncomendasPage })),
);
const ComunicadosPage = lazy(() =>
  import('@/pages/Comunicados/ComunicadosPage').then((m) => ({ default: m.ComunicadosPage })),
);
const ChatPage = lazy(() => import('@/pages/Chat/ChatPage').then((m) => ({ default: m.ChatPage })));
const CondominiosPage = lazy(() =>
  import('@/pages/Condominios/CondominiosPage').then((m) => ({ default: m.CondominiosPage })),
);
const VisitantesPage = lazy(() =>
  import('@/pages/Visitantes/VisitantesPage').then((m) => ({ default: m.VisitantesPage })),
);
const ComidaPage = lazy(() => import('@/pages/Comida/ComidaPage').then((m) => ({ default: m.ComidaPage })));
const AreasComunsPage = lazy(() =>
  import('@/pages/AreasComuns/AreasComunsPage').then((m) => ({ default: m.AreasComunsPage })),
);
const AssembleiasPage = lazy(() =>
  import('@/pages/Assembleias/AssembleiasPage').then((m) => ({ default: m.AssembleiasPage })),
);
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function IndexRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const home = roleHome(user.role, user.permissoesPorteiro);
  if (!home) return <SemAcessoAoModulo />;
  return <Navigate to={home} replace />;
}

export function AppRoutes() {
  return (
    // Suspense de topo cobre as rotas fora do AppShell (login, recuperação de senha, 404). As rotas
    // internas têm o próprio Suspense dentro do AppShell (mantém header/sidebar visíveis no load).
    <Suspense fallback={<RouteFallback />}>
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
            path="residencias"
            element={
              <RequireAuth roles={['admin']}>
                <ResidenciasPage />
              </RequireAuth>
            }
          />
          <Route
            path="moradores"
            element={
              <RequireAuth roles={['admin']}>
                <MoradoresPage />
              </RequireAuth>
            }
          />
          <Route
            path="equipe"
            element={
              <RequireAuth roles={['admin']}>
                <EquipePage />
              </RequireAuth>
            }
          />
          <Route
            path="permissoes"
            element={
              <RequireAuth roles={['admin']}>
                <PermissoesPage />
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
              <RequireAuth roles={['morador', 'admin', 'porteiro']} moduleKey="encomendas">
                <EncomendasPage />
              </RequireAuth>
            }
          />
          <Route
            path="comunicados"
            element={
              <RequireAuth roles={['morador', 'admin', 'porteiro']} moduleKey="comunicados">
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
              <RequireAuth roles={['morador', 'admin', 'porteiro']} moduleKey="visitantes">
                <VisitantesPage />
              </RequireAuth>
            }
          />
          <Route
            path="comida"
            element={
              <RequireAuth roles={['morador', 'admin', 'porteiro']} moduleKey="comida">
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
          <Route
            path="assembleias"
            element={
              <RequireAuth roles={['morador', 'admin']}>
                <AssembleiasPage />
              </RequireAuth>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
