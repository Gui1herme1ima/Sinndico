import { Request, Response } from 'express';
import { z } from 'zod';

import { ApiError } from '../middleware/errorHandler';
import { findUserById, findUserByUsername, setSenhaTemporaria, syntheticEmailFor, User } from '../models/User';
import { supabaseAdmin, supabaseAuth } from '../services/supabaseClient';

export const loginSchema = z.object({
  identificador: z.string().min(1),
  senha: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  tokenHash: z.string().min(1),
  novaSenha: z.string().min(8),
});

export const changePasswordSchema = z.object({
  novaSenha: z.string().min(8),
});

function toUserResponse(user: User) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    nome: user.nome,
    role: user.role,
    condominioId: user.condominio_id,
    apto: user.apto,
    telefone: user.telefone,
    mustChangePassword: user.senha_temporaria,
  };
}

// Login por username OU e-mail: se o identificador não parece e-mail, resolve pra que e-mail (real ou
// sintético — ver syntheticEmailFor em models/User.ts) o Supabase Auth tem cadastrado pra esse
// username, antes de chamar signInWithPassword (que só entende e-mail/telefone, não username).
export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);

  let email = input.identificador;
  if (!email.includes('@')) {
    const user = await findUserByUsername(input.identificador);
    if (!user) {
      throw new ApiError(401, 'Credenciais inválidas');
    }
    email = user.email ?? syntheticEmailFor(user.username);
  }

  const { data: signIn, error } = await supabaseAuth.auth.signInWithPassword({
    email,
    password: input.senha,
  });

  if (error || !signIn.session) {
    throw new ApiError(401, 'Credenciais inválidas');
  }

  const user = await findUserById(signIn.session.user.id);
  if (!user) {
    throw new ApiError(404, 'Perfil de usuário não encontrado');
  }

  res.json({
    accessToken: signIn.session.access_token,
    refreshToken: signIn.session.refresh_token,
    expiresIn: signIn.session.expires_in,
    user: toUserResponse(user),
  });
}

export async function refresh(req: Request, res: Response) {
  const input = refreshSchema.parse(req.body);

  const { data: refreshed, error } = await supabaseAuth.auth.refreshSession({
    refresh_token: input.refreshToken,
  });

  if (error || !refreshed.session) {
    throw new ApiError(401, 'Refresh token inválido ou expirado');
  }

  res.json({
    accessToken: refreshed.session.access_token,
    refreshToken: refreshed.session.refresh_token,
    expiresIn: refreshed.session.expires_in,
  });
}

export async function logout(req: Request, res: Response) {
  const header = req.headers.authorization;
  const accessToken = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;

  if (accessToken) {
    await supabaseAdmin.auth.admin.signOut(accessToken, 'global');
  }

  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  const user = await findUserById(req.user!.id);
  if (!user) {
    throw new ApiError(404, 'Usuário não encontrado');
  }

  res.json(toUserResponse(user));
}

// Sempre responde 204, exista ou não o e-mail — não revela se uma conta está cadastrada.
export async function forgotPassword(req: Request, res: Response) {
  const input = forgotPasswordSchema.parse(req.body);

  try {
    await supabaseAuth.auth.resetPasswordForEmail(input.email, {
      redirectTo: `${process.env.APP_BASE_URL ?? ''}/redefinir-senha`,
    });
  } catch (err) {
    console.error('[authController] erro ao disparar e-mail de redefinição de senha:', err);
  }

  res.status(204).send();
}

// Troca o token_hash recebido por e-mail (fluxo "esqueci minha senha") por uma sessão válida, depois
// atualiza a senha via Supabase Admin. Ponto mais incerto tecnicamente desta fatia: verifyOtp chamado
// server-side (fora de um browser) — a confirmar contra o Supabase real.
export async function resetPassword(req: Request, res: Response) {
  const input = resetPasswordSchema.parse(req.body);

  const { data, error } = await supabaseAuth.auth.verifyOtp({
    token_hash: input.tokenHash,
    type: 'recovery',
  });

  if (error || !data.session) {
    throw new ApiError(400, 'Link de redefinição inválido ou expirado');
  }

  const userId = data.session.user.id;

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: input.novaSenha,
  });
  if (updateError) {
    throw new ApiError(500, 'Não foi possível redefinir a senha');
  }

  await setSenhaTemporaria({ userId, condominioId: null }, userId, false);

  res.status(204).send();
}

// Troca de senha autoautenticada (usada tanto na troca obrigatória de primeiro login quanto por
// qualquer usuário que queira trocar a própria senha já sabendo a atual — provada implicitamente pelo
// próprio token de acesso).
export async function changePassword(req: Request, res: Response) {
  const input = changePasswordSchema.parse(req.body);

  const { error } = await supabaseAdmin.auth.admin.updateUserById(req.user!.id, {
    password: input.novaSenha,
  });
  if (error) {
    throw new ApiError(500, 'Não foi possível trocar a senha');
  }

  await setSenhaTemporaria({ userId: req.user!.id, condominioId: req.user!.condominioId }, req.user!.id, false);

  res.status(204).send();
}
