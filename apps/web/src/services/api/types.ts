export type UserRole = 'morador' | 'admin' | 'porteiro' | 'superadmin';

export interface UserResponse {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
  condominioId: string | null;
  apto: string | null;
  telefone: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserResponse;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterPayload {
  condominioId: string;
  email: string;
  senha: string;
  nome: string;
  apto?: string;
  telefone?: string;
  role: 'morador' | 'admin';
}

export interface LoginPayload {
  email: string;
  senha: string;
}
