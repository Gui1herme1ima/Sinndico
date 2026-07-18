import { NextFunction, Request, Response } from 'express';

import { findCondominioById } from '../models/Condominio';
import { ApiError } from './errorHandler';

type ModuloPorteiro = 'encomendas' | 'visitantes' | 'comida' | 'comunicados';

const FLAG_POR_MODULO: Record<ModuloPorteiro, string> = {
  encomendas: 'porteiro_acesso_encomendas',
  visitantes: 'porteiro_acesso_visitantes',
  comida: 'porteiro_acesso_comida',
  comunicados: 'porteiro_acesso_comunicados',
};

// Só restringe o papel porteiro — admin/morador/superadmin nunca são afetados, mesmo que a rota
// também os inclua. Roda depois de authorize(...) nas rotas onde 'porteiro' já está na lista de
// papéis permitidos; não substitui authorize, só adiciona uma checagem por-tenant em cima dele.
export function requirePorteiroModuleAccess(modulo: ModuloPorteiro) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (req.user!.role !== 'porteiro') {
      return next();
    }

    const condominio = await findCondominioById(req.user!.condominioId!);
    if (!condominio) {
      throw new ApiError(404, 'Condomínio não encontrado');
    }

    const flag = FLAG_POR_MODULO[modulo] as keyof typeof condominio;
    if (!condominio[flag]) {
      throw new ApiError(403, 'Seu condomínio desativou o acesso da portaria a este módulo');
    }

    next();
  };
}
