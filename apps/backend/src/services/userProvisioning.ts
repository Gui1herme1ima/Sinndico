import { ApiError } from '../middleware/errorHandler';
import { createUser, syntheticEmailFor, User, UserRole } from '../models/User';
import { supabaseAdmin } from './supabaseClient';
import { generateTempPassword } from '../utils/generatePassword';

export interface ProvisionUsuarioInput {
  condominioId: string | null;
  username: string;
  nome: string;
  email?: string | null;
  telefone?: string;
  role: UserRole;
  residenciaId?: string | null;
}

export interface ProvisionUsuarioResult {
  user: User;
  senhaTemporaria: string;
}

// Cria a conta no Supabase Auth (com e-mail real ou sintético) + o perfil em public.users, sempre com
// senha temporária. Compartilhado por três chamadores: condominioController.create (primeiro admin),
// e o novo fluxo de admin/porteiro e de morador (userController) — evita triplicar essa dança.
// Não envia e-mail de boas-vindas: a condição de "quando enviar" difere entre morador (sempre, e-mail
// é obrigatório) e admin/porteiro (só se um e-mail foi informado), então fica a critério do chamador.
export async function provisionUsuario(input: ProvisionUsuarioInput): Promise<ProvisionUsuarioResult> {
  const senhaTemporaria = generateTempPassword();
  const authEmail = input.email ?? syntheticEmailFor(input.username);

  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email: authEmail,
    password: senhaTemporaria,
    email_confirm: true,
  });

  if (error || !created.user) {
    throw new ApiError(400, error?.message ?? 'Não foi possível criar o usuário');
  }

  const user = await createUser({
    id: created.user.id,
    condominioId: input.condominioId,
    username: input.username,
    email: input.email ?? null,
    nome: input.nome,
    telefone: input.telefone,
    role: input.role,
    residenciaId: input.residenciaId ?? null,
    senhaTemporaria: true,
  });

  return { user, senhaTemporaria };
}
