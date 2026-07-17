import { apiFetch } from '@/services/api/client';
import type {
  AuthResponse,
  LoginPayload,
  RefreshResponse,
  RegisterPayload,
  UserResponse,
} from '@/services/api/types';

export const authApi = {
  register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  login(payload: LoginPayload): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  refresh(refreshToken: string): Promise<RefreshResponse> {
    return apiFetch<RefreshResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      skipAuth: true,
    });
  },

  logout(): Promise<void> {
    return apiFetch<void>('/api/auth/logout', { method: 'POST' });
  },

  me(): Promise<UserResponse> {
    return apiFetch<UserResponse>('/api/auth/me');
  },
};
