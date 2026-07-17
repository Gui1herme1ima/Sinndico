import { API_URL } from '@/lib/env';
import { impersonation } from '@/services/impersonation';
import { tokenStorage } from '@/services/tokenStorage';

export interface ApiErrorDetails {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
}

export class ApiError extends Error {
  status: number;
  details?: ApiErrorDetails;

  constructor(status: number, message: string, details?: ApiErrorDetails) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

let authExpiredHandler: (() => void) | null = null;

export function setAuthExpiredHandler(fn: () => void): void {
  authExpiredHandler = fn;
}

// Dedup: N chamadas simultâneas que tomam 401 devem disparar um único /refresh, não um por request.
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return false;

    const data = (await response.json()) as { accessToken: string; refreshToken: string };
    tokenStorage.set(data);
    return true;
  } catch {
    return false;
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  let body: { error?: string; details?: ApiErrorDetails } = {};
  try {
    body = await response.json();
  } catch {
    // resposta sem corpo JSON (ex.: falha de rede antes do backend responder)
  }
  return new ApiError(response.status, body.error ?? 'Erro inesperado', body.details);
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { skipAuth, headers, body, ...rest } = options;

  const doFetch = (): Promise<Response> => {
    const finalHeaders = new Headers(headers);
    if (body !== undefined && !finalHeaders.has('Content-Type')) {
      finalHeaders.set('Content-Type', 'application/json');
    }
    if (!skipAuth) {
      const accessToken = tokenStorage.getAccess();
      if (accessToken) finalHeaders.set('Authorization', `Bearer ${accessToken}`);

      const viewingAs = impersonation.get();
      if (viewingAs) finalHeaders.set('X-Impersonate-Condominio-Id', viewingAs.condominioId);
    }
    return fetch(`${API_URL}${path}`, { ...rest, headers: finalHeaders, body });
  };

  let response = await doFetch();

  if (response.status === 401 && !skipAuth) {
    if (!refreshPromise) {
      refreshPromise = refreshTokens().finally(() => {
        refreshPromise = null;
      });
    }
    const refreshed = await refreshPromise;

    if (!refreshed) {
      tokenStorage.clear();
      authExpiredHandler?.();
      throw await toApiError(response);
    }

    response = await doFetch();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  return (await response.json()) as T;
}
