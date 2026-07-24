import { Request, Response } from 'express';
import { z } from 'zod';

import { ApiError } from '../middleware/errorHandler';
import { findResidenciaById, listResidenciasComSetorParaTenant, ResidenciaComSetorNome } from '../models/Residencia';
import {
  findUserByIdForTenant,
  findUserByUsername,
  listUsersForTenant,
  listUsersForTenantPaginated,
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
import { parsePagination, resolveSortColumn } from '../utils/listQuery';

const USERNAME_REGEX = /^[a-z0-9._]+$/;

const USER_SORT_COLUMNS = {
  nome: 'u.nome',
  createdAt: 'u.created_at',
} as const;

export const listUsersQuerySchema = z.object({
  roles: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.enum(['nome', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().trim().min(1).optional(),
});

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

export const importarMoradoresSchema = z.object({
  moradores: z
    .array(
      z.object({
        nome: z.string().min(1),
        email: z.string().email(),
        telefone: z.string().optional(),
        setor: z.string().min(1),
        numero: z.string().min(1),
      })
    )
    .min(1)
    .max(500),
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
      'residencia_setor_nome' in comResidencia && user.residencia_id
        ? {
            setorNome: comResidencia.residencia_setor_nome,
            setorTipo: comResidencia.residencia_setor_tipo,
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

// Compartilhada por create() (via residenciaId já resolvido) e importarMoradores() (via bloco/rua+
// número casado contra a lista de residências do tenant). Sempre envia e-mail de boas-vindas — e-mail
// é obrigatório pra morador, diferente de admin/porteiro.
async function criarUmMorador(
  condominioId: string,
  input: { nome: string; email: string; residenciaId: string; telefone?: string }
) {
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

  await sendWelcomeEmail(input.email, {
    nome: input.nome,
    loginUrl: `${process.env.APP_BASE_URL ?? ''}/login`,
    senhaTemporaria,
  });

  return { user, senhaTemporaria };
}

export async function create(req: Request, res: Response) {
  const input = createUserSchema.parse(req.body);
  const condominioId = req.user!.condominioId!;

  if (input.role === 'morador') {
    const residencia = await findResidenciaById(tenantContextOf(req), input.residenciaId);
    if (!residencia) {
      throw new ApiError(404, 'Residência não encontrada');
    }

    const { user, senhaTemporaria } = await criarUmMorador(condominioId, input);
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

function chaveResidencia(residencia: Pick<ResidenciaComSetorNome, 'setor_nome' | 'numero'>): string {
  return `${residencia.setor_nome}|${residencia.numero}`.toLowerCase();
}

// Importação em massa (Fatia 6) — o CSV/XLSX não tem residenciaId (UUID), então resolve por nome-do-
// setor + número contra a lista de residências do tenant (busca uma vez, não uma query por linha).
// Parcial de propósito, mesmo espírito de residenciaController.importar: uma linha ruim não derruba
// as outras.
export async function importarMoradores(req: Request, res: Response) {
  const input = importarMoradoresSchema.parse(req.body);
  const condominioId = req.user!.condominioId!;
  const ctx = tenantContextOf(req);

  const residencias = await listResidenciasComSetorParaTenant(ctx);
  const residenciaPorChave = new Map(residencias.map((r) => [chaveResidencia(r), r.id]));

  let criadas = 0;
  const erros: { linha: number; motivo: string }[] = [];

  for (let i = 0; i < input.moradores.length; i++) {
    const linha = input.moradores[i];
    try {
      const residenciaId = residenciaPorChave.get(
        chaveResidencia({ setor_nome: linha.setor, numero: linha.numero })
      );
      if (!residenciaId) {
        throw new ApiError(404, 'Residência não encontrada para o setor e número informados');
      }

      await criarUmMorador(condominioId, { ...linha, residenciaId });
      criadas++;
    } catch (err) {
      erros.push({ linha: i + 1, motivo: err instanceof ApiError ? err.message : 'Erro inesperado' });
    }
  }

  res.json({ criadas, erros });
}

// Diretório enxuto de moradores, acessível também por porteiro (diferente de list()/GET '/', que é
// admin-only) — usado por seletores de morador em outros módulos (ex.: dono de uma encomenda). Só
// {id, nome, residencia}, sem e-mail/username/telefone: porteiro não precisa desse dado só pra
// escolher um morador.
export async function diretorioMoradores(req: Request, res: Response) {
  const moradores = await listUsersForTenant(tenantContextOf(req), ['morador']);
  res.json(
    moradores.map((m) => ({
      id: m.id,
      nome: m.nome,
      residencia: m.residencia_id
        ? { setorNome: m.residencia_setor_nome, setorTipo: m.residencia_setor_tipo, numero: m.residencia_numero }
        : null,
    }))
  );
}

export async function list(req: Request, res: Response) {
  const query = listUsersQuerySchema.parse(req.query);
  const roles = query.roles ? (query.roles.split(',').filter(Boolean) as UserRole[]) : undefined;
  const { page, pageSize, limit, offset } = parsePagination(query);
  const sortColumn = resolveSortColumn(query.sortBy, USER_SORT_COLUMNS, 'nome');

  const filter = {
    roles,
    search: query.search,
    sortColumn,
    sortOrder: (query.sortOrder ?? 'asc').toUpperCase() as 'ASC' | 'DESC',
    limit,
    offset,
  };

  const { items, total } = await listUsersForTenantPaginated(tenantContextOf(req), filter);
  res.json({
    items: items.map(toUserResponse),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
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
