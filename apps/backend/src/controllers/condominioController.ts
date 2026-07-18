import { Request, Response } from 'express';
import { z } from 'zod';

import { ApiError } from '../middleware/errorHandler';
import {
  Condominio,
  CondominioComContagem,
  createCondominio,
  findCondominioById,
  findCondominioBySlug,
  listCondominios,
  updateCondominioNome,
} from '../models/Condominio';
import { findUserByUsername } from '../models/User';
import { sendWelcomeEmail } from '../services/emailService';
import { provisionUsuario } from '../services/userProvisioning';

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const USERNAME_REGEX = /^[a-z0-9._]+$/;

export const createCondominioSchema = z.object({
  nome: z.string().min(1),
  slug: z.string().min(1).regex(SLUG_REGEX, 'Use apenas letras minúsculas, números e hífen'),
  tipoResidencia: z.enum(['apartamento', 'casa']),
  endereco: z.string().optional(),
  contatoNome: z.string().optional(),
  contatoEmail: z.string().email().optional(),
  contatoTelefone: z.string().optional(),
  adminNome: z.string().min(1),
  adminUsername: z.string().min(3).regex(USERNAME_REGEX, 'Use apenas letras minúsculas, números, ponto ou underline'),
  adminEmail: z.string().email().optional(),
});

export const updateCondominioSchema = z.object({
  nome: z.string().min(1),
});

function toCondominioResponse(condominio: Condominio | CondominioComContagem) {
  return {
    id: condominio.id,
    nome: condominio.nome,
    slug: condominio.slug,
    endereco: condominio.endereco,
    contatoNome: condominio.contato_nome,
    contatoEmail: condominio.contato_email,
    contatoTelefone: condominio.contato_telefone,
    tipoResidencia: condominio.tipo_residencia,
    createdAt: condominio.created_at,
    totalUsuarios: 'total_usuarios' in condominio ? Number(condominio.total_usuarios) : undefined,
  };
}

export async function create(req: Request, res: Response) {
  const input = createCondominioSchema.parse(req.body);

  const slugEmUso = await findCondominioBySlug(input.slug);
  if (slugEmUso) {
    throw new ApiError(409, 'Já existe um condomínio com este identificador de URL');
  }

  const usernameEmUso = await findUserByUsername(input.adminUsername);
  if (usernameEmUso) {
    throw new ApiError(409, 'Nome de usuário já em uso');
  }

  const condominio = await createCondominio({
    nome: input.nome,
    slug: input.slug,
    tipoResidencia: input.tipoResidencia,
    endereco: input.endereco,
    contatoNome: input.contatoNome,
    contatoEmail: input.contatoEmail,
    contatoTelefone: input.contatoTelefone,
  });

  const { senhaTemporaria } = await provisionUsuario({
    condominioId: condominio.id,
    username: input.adminUsername,
    nome: input.adminNome,
    email: input.adminEmail ?? null,
    role: 'admin',
  });

  if (input.adminEmail) {
    await sendWelcomeEmail(input.adminEmail, {
      nome: input.adminNome,
      loginUrl: `${process.env.APP_BASE_URL ?? ''}/${condominio.slug}/login`,
      senhaTemporaria,
    });
  }

  // A senha gerada sempre volta na resposta (mostrada uma única vez no painel do superadmin) — é o
  // canal de entrega quando o admin foi criado sem e-mail.
  res.status(201).json({
    ...toCondominioResponse(condominio),
    admin: {
      username: input.adminUsername,
      email: input.adminEmail ?? null,
      senhaTemporaria,
    },
  });
}

export async function list(_req: Request, res: Response) {
  const condominios = await listCondominios();
  res.json(condominios.map(toCondominioResponse));
}

// Autenticado (admin) — devolve o próprio condomínio do usuário logado. Usado por telas que precisam
// da config do tenant (ex.: Residências, pra saber se mostra "Bloco" ou "Rua").
export async function getMine(req: Request, res: Response) {
  const condominio = await findCondominioById(req.user!.condominioId!);
  if (!condominio) {
    throw new ApiError(404, 'Condomínio não encontrado');
  }

  res.json(toCondominioResponse(condominio));
}

export async function getById(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);

  const condominio = await findCondominioById(id);
  if (!condominio) {
    throw new ApiError(404, 'Condomínio não encontrado');
  }

  res.json(toCondominioResponse(condominio));
}

// Público (sem auth) — a tela de login usa isso pra resolver /<slug>/login antes do usuário entrar
// com credenciais. Só devolve o essencial (nada sensível).
export async function getBySlug(req: Request, res: Response) {
  const slug = z.string().min(1).parse(req.params.slug);

  const condominio = await findCondominioBySlug(slug);
  if (!condominio) {
    throw new ApiError(404, 'Condomínio não encontrado');
  }

  res.json({ id: condominio.id, nome: condominio.nome, slug: condominio.slug });
}

export async function update(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const input = updateCondominioSchema.parse(req.body);

  const condominio = await updateCondominioNome(id, input.nome);
  if (!condominio) {
    throw new ApiError(404, 'Condomínio não encontrado');
  }

  res.json(toCondominioResponse(condominio));
}
