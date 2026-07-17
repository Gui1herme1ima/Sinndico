import { PoolClient } from 'pg';

import { appPool } from './connection';

export interface TenantContext {
  userId: string;
  // null só é válido pra superadmin (não pertence a um condomínio) — nesse caso a policy só libera
  // o self-lookup do próprio usuário, então operações cross-tenant de superadmin usam `pool` direto.
  condominioId?: string | null;
}

// Roda fn dentro de uma transação com o contexto de tenant setado via SET LOCAL (na prática,
// set_config(..., true) = escopo local à transação). As RLS policies (ver migration
// 1700000000009_add-restricted-app-role-and-rls) leem esses valores via current_setting(...).
export async function withTenantContext<T>(ctx: TenantContext, fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await appPool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.user_id', $1, true)", [ctx.userId]);
    // set_config com valor NULL vira string vazia (não NULL de verdade) — por isso as RLS policies
    // usam NULLIF(current_setting(...), '') antes de fazer o cast pra uuid.
    await client.query("SELECT set_config('app.condominio_id', $1, true)", [ctx.condominioId ?? '']);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
