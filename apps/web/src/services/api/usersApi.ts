import { apiFetch } from '@/services/api/client';
import type {
  CreateMoradorPayload,
  CreateStaffUserPayload,
  CreateUserResponse,
  MoradorResponse,
  ResetSenhaResponse,
  StaffUserResponse,
  UpdateMoradorPayload,
} from '@/services/api/types';

export const usersApi = {
  listMoradores(): Promise<MoradorResponse[]> {
    return apiFetch<MoradorResponse[]>('/api/users?roles=morador');
  },

  listEquipe(): Promise<StaffUserResponse[]> {
    return apiFetch<StaffUserResponse[]>('/api/users?roles=admin,porteiro');
  },

  createMorador(payload: CreateMoradorPayload): Promise<MoradorResponse & CreateUserResponse> {
    return apiFetch<MoradorResponse & CreateUserResponse>('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  createStaffUser(payload: CreateStaffUserPayload): Promise<StaffUserResponse & CreateUserResponse> {
    return apiFetch<StaffUserResponse & CreateUserResponse>('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateMorador(id: string, payload: UpdateMoradorPayload): Promise<MoradorResponse> {
    return apiFetch<MoradorResponse>(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  resetSenha(id: string): Promise<ResetSenhaResponse> {
    return apiFetch<ResetSenhaResponse>(`/api/users/${id}/senha`, {
      method: 'PATCH',
    });
  },
};
