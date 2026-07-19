import { TenantContext, withTenantContext } from '../database/tenantContext';

export type NotificacaoTipo = 'chat' | 'comida' | 'comunicado' | 'reserva' | 'assembleia' | 'encomenda';

export interface Notificacao {
  id: string;
  condominio_id: string;
  user_id: string;
  tipo: NotificacaoTipo;
  titulo: string;
  corpo: string;
  referencia_id: string;
  lida: boolean;
  created_at: Date;
}

export interface CreateNotificacoesInput {
  tipo: NotificacaoTipo;
  titulo: string;
  corpo: string;
  referenciaId: string;
}

// Inserção em lote via unnest — uma linha por userId. Chamado só a partir de
// notificationService.notifyUsers, nunca direto pelos controllers.
export async function createNotificacoes(
  ctx: TenantContext,
  userIds: string[],
  input: CreateNotificacoesInput
): Promise<void> {
  if (userIds.length === 0) return;
  await withTenantContext(ctx, async (client) => {
    await client.query(
      `INSERT INTO notificacoes (condominio_id, user_id, tipo, titulo, corpo, referencia_id)
       SELECT $1, unnest($2::uuid[]), $3, $4, $5, $6`,
      [ctx.condominioId, userIds, input.tipo, input.titulo, input.corpo, input.referenciaId]
    );
  });
}

// Últimas 20 do usuário, mais recentes primeiro. apenasNaoLidas filtra lida = false.
export async function listNotificacoes(
  ctx: TenantContext,
  userId: string,
  apenasNaoLidas: boolean
): Promise<Notificacao[]> {
  return withTenantContext(ctx, async (client) => {
    const where = apenasNaoLidas ? 'AND lida = false' : '';
    const result = await client.query<Notificacao>(
      `SELECT * FROM notificacoes WHERE user_id = $1 ${where} ORDER BY created_at DESC LIMIT 20`,
      [userId]
    );
    return result.rows;
  });
}

export async function countNaoLidas(ctx: TenantContext, userId: string): Promise<number> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<{ count: string }>(
      'SELECT COUNT(*) FROM notificacoes WHERE user_id = $1 AND lida = false',
      [userId]
    );
    return Number(result.rows[0].count);
  });
}

export async function marcarComoLida(ctx: TenantContext, userId: string, id: string): Promise<void> {
  await withTenantContext(ctx, async (client) => {
    await client.query('UPDATE notificacoes SET lida = true WHERE id = $1 AND user_id = $2', [id, userId]);
  });
}

export async function marcarTodasComoLidas(ctx: TenantContext, userId: string): Promise<void> {
  await withTenantContext(ctx, async (client) => {
    await client.query('UPDATE notificacoes SET lida = true WHERE user_id = $1 AND lida = false', [userId]);
  });
}
