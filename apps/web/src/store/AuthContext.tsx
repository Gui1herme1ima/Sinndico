import { createContext, useCallback, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';

import { authApi } from '@/services/api/authApi';
import { setAuthExpiredHandler } from '@/services/api/client';
import type { LoginPayload, UserResponse } from '@/services/api/types';
import { tokenStorage } from '@/services/tokenStorage';

export type AuthState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'authenticated'; user: UserResponse }
  | { status: 'unauthenticated' };

type AuthAction =
  | { type: 'LOADING' }
  | { type: 'AUTHENTICATED'; user: UserResponse }
  | { type: 'UNAUTHENTICATED' };

function authReducer(_state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOADING':
      return { status: 'loading' };
    case 'AUTHENTICATED':
      return { status: 'authenticated', user: action.user };
    case 'UNAUTHENTICATED':
      return { status: 'unauthenticated' };
  }
}

export interface AuthContextValue {
  state: AuthState;
  login(payload: LoginPayload): Promise<void>;
  logout(): Promise<void>;
  // Re-busca /me — usada depois de trocar senha (zera mustChangePassword) e depois de
  // entrar/sair do modo "ver como" (troca a identidade efetiva sem precisar de novo login).
  refreshUser(): Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, { status: 'idle' });

  useEffect(() => {
    setAuthExpiredHandler(() => dispatch({ type: 'UNAUTHENTICATED' }));

    async function bootstrap() {
      if (!tokenStorage.getAccess()) {
        dispatch({ type: 'UNAUTHENTICATED' });
        return;
      }
      dispatch({ type: 'LOADING' });
      try {
        const user = await authApi.me();
        dispatch({ type: 'AUTHENTICATED', user });
      } catch {
        tokenStorage.clear();
        dispatch({ type: 'UNAUTHENTICATED' });
      }
    }

    void bootstrap();
  }, []);

  // Callbacks estáveis (useCallback) + value memoizado (useMemo): sem isso, cada render do provider
  // criaria novas referências e re-renderizaria todo consumidor de useAuth à toa. Agora o value só
  // muda quando `state` muda de fato (Fatia 4.1, eliminar re-renders).
  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authApi.login(payload);
    tokenStorage.set(response);
    dispatch({ type: 'AUTHENTICATED', user: response.user });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // best-effort — mesmo se a chamada de rede falhar, o estado local é limpo abaixo
    }
    tokenStorage.clear();
    dispatch({ type: 'UNAUTHENTICATED' });
  }, []);

  const refreshUser = useCallback(async () => {
    const user = await authApi.me();
    dispatch({ type: 'AUTHENTICATED', user });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ state, login, logout, refreshUser }),
    [state, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
