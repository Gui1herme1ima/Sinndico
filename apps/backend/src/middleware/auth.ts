import { NextFunction, Request, Response } from 'express';

import { findUserById, UserRole } from '../models/User';
import { verifySupabaseToken } from '../services/authTokenService';
import { ApiError } from './errorHandler';

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  // null só para role = 'superadmin'.
  condominioId: string | null;
  nome: string;
  // presente só durante "ver como" — id do superadmin real, pra manter auditável quem está agindo.
  impersonatedBy?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Token de acesso ausente');
  }

  let sub: string;
  try {
    ({ sub } = await verifySupabaseToken(header.slice('Bearer '.length)));
  } catch {
    throw new ApiError(401, 'Token de acesso inválido ou expirado');
  }

  const profile = await findUserById(sub);
  if (!profile) {
    throw new ApiError(401, 'Perfil de usuário não encontrado');
  }

  // "Ver como": superadmin opera as rotas normais de admin de um tenant sem uma segunda conta. Não
  // gera token novo — é uma elevação por request do próprio token do superadmin, honrada só quando o
  // perfil real (verificado acima via JWT) já é superadmin, nunca a partir do que o cliente afirma.
  const impersonateCondominioId = req.headers['x-impersonate-condominio-id'];
  if (profile.role === 'superadmin' && typeof impersonateCondominioId === 'string' && impersonateCondominioId) {
    console.log(
      `[auth] superadmin ${profile.id} agindo como admin do condomínio ${impersonateCondominioId} em ${req.method} ${req.path}`
    );
    req.user = {
      id: profile.id,
      role: 'admin',
      condominioId: impersonateCondominioId,
      nome: profile.nome,
      impersonatedBy: profile.id,
    };
    return next();
  }

  req.user = {
    id: profile.id,
    role: profile.role,
    condominioId: profile.condominio_id,
    nome: profile.nome,
  };
  next();
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, 'Sem permissão para este recurso');
    }
    next();
  };
}
