import { Request, Response } from 'express';
import { z } from 'zod';

import { ApiError } from '../middleware/errorHandler';
import { createUser, findUserByEmail, findUserById, User } from '../models/User';
import { supabaseAdmin, supabaseAuth } from '../services/supabaseClient';

export const registerSchema = z.object({
  condominioId: z.string().uuid(),
  email: z.string().email(),
  senha: z.string().min(8),
  nome: z.string().min(1),
  apto: z.string().optional(),
  telefone: z.string().optional(),
  role: z.enum(['morador', 'admin']),
});

export const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

function toUserResponse(user: User) {
  return {
    id: user.id,
    email: user.email,
    nome: user.nome,
    role: user.role,
    condominioId: user.condominio_id,
    apto: user.apto,
    telefone: user.telefone,
  };
}

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);

  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new ApiError(409, 'Já existe uma conta com este e-mail');
  }

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.senha,
    email_confirm: true,
  });

  if (createError || !created.user) {
    throw new ApiError(400, createError?.message ?? 'Não foi possível criar o usuário');
  }

  const user = await createUser({
    id: created.user.id,
    condominioId: input.condominioId,
    email: input.email,
    nome: input.nome,
    apto: input.apto,
    telefone: input.telefone,
    role: input.role,
  });

  const { data: signIn, error: signInError } = await supabaseAuth.auth.signInWithPassword({
    email: input.email,
    password: input.senha,
  });

  if (signInError || !signIn.session) {
    throw new ApiError(500, 'Usuário criado, mas não foi possível iniciar a sessão automaticamente');
  }

  res.status(201).json({
    accessToken: signIn.session.access_token,
    refreshToken: signIn.session.refresh_token,
    expiresIn: signIn.session.expires_in,
    user: toUserResponse(user),
  });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);

  const { data: signIn, error } = await supabaseAuth.auth.signInWithPassword({
    email: input.email,
    password: input.senha,
  });

  if (error || !signIn.session) {
    throw new ApiError(401, 'E-mail ou senha inválidos');
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
