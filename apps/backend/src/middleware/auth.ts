import { NextFunction, Request, Response } from 'express';

import { findUserById, UserRole } from '../models/User';
import { verifySupabaseToken } from '../services/authTokenService';
import { ApiError } from './errorHandler';

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  condominioId: string;
  nome: string;
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
