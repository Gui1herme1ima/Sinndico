import { createContext, useEffect, useReducer } from 'react';
import type { ReactNode } from 'react';

import { authApi } from '@/services/api/authApi';
import { setAuthExpiredHandler } from '@/services/api/client';
import type { LoginPayload, RegisterPayload, UserResponse } from '@/services/api/types';
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
  register(payload: RegisterPayload): Promise<void>;
  logout(): Promise<void>;
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

  async function login(payload: LoginPayload) {
    const response = await authApi.login(payload);
    tokenStorage.set(response);
    dispatch({ type: 'AUTHENTICATED', user: response.user });
  }

  async function register(payload: RegisterPayload) {
    const response = await authApi.register(payload);
    tokenStorage.set(response);
    dispatch({ type: 'AUTHENTICATED', user: response.user });
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // best-effort — mesmo se a chamada de rede falhar, o estado local é limpo abaixo
    }
    tokenStorage.clear();
    dispatch({ type: 'UNAUTHENTICATED' });
  }

  return <AuthContext.Provider value={{ state, login, register, logout }}>{children}</AuthContext.Provider>;
}
