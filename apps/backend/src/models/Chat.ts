import { TenantContext, withTenantContext } from '../database/tenantContext';

export interface Chat {
  id: string;
  condominio_id: string;
  morador_id: string;
  autor_id: string;
  mensagem: string;
  lido: boolean;
  created_at: Date;
}

export interface CreateChatInput {
  condominioId: string;
  moradorId: string;
  autorId: string;
  mensagem: string;
}

export async function createChatMessage(ctx: TenantContext, input: CreateChatInput): Promise<Chat> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Chat>(
      `INSERT INTO chats (condominio_id, morador_id, autor_id, mensagem)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.condominioId, input.moradorId, input.autorId, input.mensagem]
    );
    return result.rows[0];
  });
}

export async function listChatMessages(ctx: TenantContext, moradorId: string): Promise<Chat[]> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Chat>(
      'SELECT * FROM chats WHERE morador_id = $1 ORDER BY created_at ASC',
      [moradorId]
    );
    return result.rows;
  });
}

// Marca como lidas as mensagens do outro lado (autor_id != readerId) que ainda não tinham sido
// lidas — chamado sempre que a thread é aberta (GET), sem endpoint separado.
export async function markThreadAsRead(ctx: TenantContext, moradorId: string, readerId: string): Promise<void> {
  return withTenantContext(ctx, async (client) => {
    await client.query(
      'UPDATE chats SET lido = true WHERE morador_id = $1 AND autor_id <> $2 AND lido = false',
      [moradorId, readerId]
    );
  });
}
