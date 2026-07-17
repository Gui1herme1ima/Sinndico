import { Request, Response } from 'express';
import { z } from 'zod';

import { ApiError } from '../middleware/errorHandler';
import { findUserByIdForTenant, setSenhaTemporaria } from '../models/User';
import { supabaseAdmin } from '../services/supabaseClient';
import { generateTempPassword } from '../utils/generatePassword';

// Redefinição direta pelo admin — pra contas de porteiro/admin que podem não ter e-mail cadastrado e
// por isso não conseguem usar "esqueci minha senha". Nunca vale pra morador: essas contas sempre têm
// e-mail (obrigatório na criação) e seguem só pelo fluxo de e-mail, por decisão explícita do usuário.
export async function resetSenha(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);

  const target = await findUserByIdForTenant(
    { userId: req.user!.id, condominioId: req.user!.condominioId },
    id
  );
  if (!target) {
    throw new ApiError(404, 'Usuário não encontrado');
  }
  if (target.role === 'morador') {
    throw new ApiError(400, 'Contas de morador só redefinem senha pelo fluxo de "esqueci minha senha"');
  }

  const novaSenha = generateTempPassword();

  const { error } = await supabaseAdmin.auth.admin.updateUserById(target.id, { password: novaSenha });
  if (error) {
    throw new ApiError(500, 'Não foi possível redefinir a senha');
  }

  await setSenhaTemporaria({ userId: req.user!.id, condominioId: req.user!.condominioId }, target.id, true);

  res.json({ senhaTemporaria: novaSenha });
}
