import { Request, Response } from 'express';
import { z } from 'zod';

import { ApiError } from '../middleware/errorHandler';
import { findResidenciaById } from '../models/Residencia';
import {
  findUserByIdForTenant,
  findUserByUsername,
  listUsersForTenant,
  setSenhaTemporaria,
  updateUser,
  User,
  UserComResidencia,
  UserRole,
} from '../models/User';
import { sendWelcomeEmail } from '../services/emailService';
import { provisionUsuario } from '../services/userProvisioning';
import { supabaseAdmin } from '../services/supabaseClient';
import { generateTempPassword } from '../utils/generatePassword';

const USERNAME_REGEX = /^[a-z0-9._]+$/;

export const createUserSchema = z.discriminatedUnion('role', [
  z.object({
    role: z.literal('morador'),
    nome: z.string().min(1),
    email: z.string().email(),
    residenciaId: z.string().uuid(),
    telefone: z.string().optional(),
  }),
  z.object({
    role: z.enum(['admin', 'porteiro']),
    nome: z.string().min(1),
    username: z.string().min(3).regex(USERNAME_REGEX, 'Use apenas letras minúsculas, números, ponto ou underline'),
    email: z.string().email().optional(),
    telefone: z.string().optional(),
  }),
]);

export const updateUserSchema = z.object({
  nome: z.string().min(1).optional(),
  telefone: z.string().optional(),
  residenciaId: z.string().uuid().optional(),
});

function tenantContextOf(req: Request) {
  return { userId: req.user!.id, condominioId: req.user!.condominioId };
}

function toUserResponse(user: User | UserComResidencia) {
  const comResidencia = user as UserComResidencia;
  return {
    id: user.id,
    nome: user.nome,
    username: user.username,
    email: user.email,
    telefone: user.telefone,
    role: user.role,
    residencia:
      'residencia_bloco' in comResidencia && user.residencia_id
        ? {
            bloco: comResidencia.residencia_bloco,
            rua: comResidencia.residencia_rua,
            numero: comResidencia.residencia_numero,
          }
        : null,
    createdAt: user.created_at,
  };
}

// Deriva o username do morador a partir do e-mail (parte antes do @) — o admin nunca digita/vê esse
// campo, já que login de morador sempre pode ser feito por e-mail (obrigatório pra esse papel). Mesma
// lógica de sufixo numérico em colisão usada no backfill da migration 1700000000020, agora em TS
// porque roda em request time.
async function deriveUsernameFromEmail(email: string): Promise<string> {
  const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g, '') || 'morador';
  let candidate = base;
  let suffix = 1;
  while (await findUserByUsername(candidate)) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }
  return candidate;
}

export async function create(req: Request, res: Response) {
  const input = createUserSchema.parse(req.body);
  const condominioId = req.user!.condominioId!;

  if (input.role === 'morador') {
    const residencia = await findResidenciaById(tenantContextOf(req), input.residenciaId);
    if (!residencia) {
      throw new ApiError(404, 'Residência não encontrada');
    }

    const username = await deriveUsernameFromEmail(input.email);

    const { user, senhaTemporaria } = await provisionUsuario({
      condominioId,
      username,
      nome: input.nome,
      email: input.email,
      telefone: input.telefone,
      role: 'morador',
      residenciaId: input.residenciaId,
    });

    // E-mail é obrigatório pra morador (regra da Fatia 1) — o envio não é condicional como no caso de
    // admin/porteiro, sempre há um endereço real pra mandar.
    await sendWelcomeEmail(input.email, {
      nome: input.nome,
      loginUrl: `${process.env.APP_BASE_URL ?? ''}/login`,
      senhaTemporaria,
    });

    res.status(201).json({ ...toUserResponse(user), senhaTemporaria });
    return;
  }

  const usernameEmUso = await findUserByUsername(input.username);
  if (usernameEmUso) {
    throw new ApiError(409, 'Nome de usuário já em uso');
  }

  const { user, senhaTemporaria } = await provisionUsuario({
    condominioId,
    username: input.username,
    nome: input.nome,
    email: input.email ?? null,
    telefone: input.telefone,
    role: input.role,
  });

  if (input.email) {
    await sendWelcomeEmail(input.email, {
      nome: input.nome,
      loginUrl: `${process.env.APP_BASE_URL ?? ''}/login`,
      senhaTemporaria,
    });
  }

  res.status(201).json({ ...toUserResponse(user), senhaTemporaria });
}

export async function list(req: Request, res: Response) {
  const rolesParam = typeof req.query.roles === 'string' ? req.query.roles : undefined;
  const roles = rolesParam ? (rolesParam.split(',').filter(Boolean) as UserRole[]) : undefined;

  const users = await listUsersForTenant(tenantContextOf(req), roles);
  res.json(users.map(toUserResponse));
}

export async function update(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const input = updateUserSchema.parse(req.body);
  const ctx = tenantContextOf(req);

  if (input.residenciaId) {
    const residencia = await findResidenciaById(ctx, input.residenciaId);
    if (!residencia) {
      throw new ApiError(404, 'Residência não encontrada');
    }
  }

  const user = await updateUser(ctx, id, input);
  if (!user) {
    throw new ApiError(404, 'Usuário não encontrado');
  }

  res.json(toUserResponse(user));
}

// Redefinição direta pelo admin — pra contas de porteiro/admin que podem não ter e-mail cadastrado e
// por isso não conseguem usar "esqueci minha senha". Nunca vale pra morador: essas contas sempre têm
// e-mail (obrigatório na criação) e seguem só pelo fluxo de e-mail, por decisão explícita do usuário.
export async function resetSenha(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);

  const target = await findUserByIdForTenant(tenantContextOf(req), id);
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

  await setSenhaTemporaria(tenantContextOf(req), target.id, true);

  res.json({ senhaTemporaria: novaSenha });
}
