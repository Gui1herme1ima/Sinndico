import { apiFetch } from '@/services/api/client';
import type {
  AuthResponse,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RefreshResponse,
  ResetPasswordPayload,
  UserResponse,
} from '@/services/api/types';

export const authApi = {
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

  forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    return apiFetch<void>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  resetPassword(payload: ResetPasswordPayload): Promise<void> {
    return apiFetch<void>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  changePassword(payload: ChangePasswordPayload): Promise<void> {
    return apiFetch<void>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
