import { TenantContext, withTenantContext } from '../database/tenantContext';

export type DevicePlatform = 'web' | 'android' | 'ios';

export interface DeviceToken {
  id: string;
  condominio_id: string;
  user_id: string;
  token: string;
  platform: DevicePlatform;
  created_at: Date;
}

export interface RegisterDeviceTokenInput {
  condominioId: string;
  userId: string;
  token: string;
  platform: DevicePlatform;
}

// Upsert por token: o mesmo dispositivo pode re-registrar (renovação, troca de usuário logado)
// sem duplicar linha.
export async function registerDeviceToken(ctx: TenantContext, input: RegisterDeviceTokenInput): Promise<DeviceToken> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<DeviceToken>(
      `INSERT INTO device_tokens (condominio_id, user_id, token, platform)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (token) DO UPDATE SET user_id = EXCLUDED.user_id, platform = EXCLUDED.platform
       RETURNING *`,
      [input.condominioId, input.userId, input.token, input.platform]
    );
    return result.rows[0];
  });
}

export async function removeDeviceToken(ctx: TenantContext, token: string): Promise<void> {
  return withTenantContext(ctx, async (client) => {
    await client.query('DELETE FROM device_tokens WHERE token = $1', [token]);
  });
}

// Usado pelos gatilhos de notificação (encomenda chegou, resposta no chat) pra buscar os tokens de
// destinatários específicos dentro do mesmo tenant.
export async function listTokensForUsers(ctx: TenantContext, userIds: string[]): Promise<string[]> {
  if (userIds.length === 0) return [];
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<{ token: string }>(
      'SELECT token FROM device_tokens WHERE user_id = ANY($1::uuid[])',
      [userIds]
    );
    return result.rows.map((r) => r.token);
  });
}
