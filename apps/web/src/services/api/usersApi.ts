import { apiFetch } from '@/services/api/client';
import type {
  CreateMoradorPayload,
  CreateStaffUserPayload,
  CreateUserResponse,
  ImportarMoradoresPayload,
  ImportarResultado,
  MoradorDiretorioResponse,
  MoradorResponse,
  PaginatedResponse,
  ResetSenhaResponse,
  StaffUserResponse,
  UpdateMoradorPayload,
  UserListParams,
} from '@/services/api/types';

function toQueryString(params: UserListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const usersApi = {
  listMoradores(params: Omit<UserListParams, 'roles'> = {}): Promise<PaginatedResponse<MoradorResponse>> {
    return apiFetch<PaginatedResponse<MoradorResponse>>(
      `/api/users${toQueryString({ ...params, roles: 'morador' })}`
    );
  },

  listDiretorio(): Promise<MoradorDiretorioResponse[]> {
    return apiFetch<MoradorDiretorioResponse[]>('/api/users/diretorio');
  },

  // pageSize alto pra preservar o comportamento atual da tela de Equipe (mostra todos, sem paginação
  // — só Moradores ganhou UI de paginação na Fatia 4.3).
  listEquipe(): Promise<StaffUserResponse[]> {
    return apiFetch<PaginatedResponse<StaffUserResponse>>(
      `/api/users${toQueryString({ roles: 'admin,porteiro', pageSize: 100 })}`
    ).then((res) => res.items);
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

  importarMoradores(payload: ImportarMoradoresPayload): Promise<ImportarResultado> {
    return apiFetch<ImportarResultado>('/api/users/importar', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
