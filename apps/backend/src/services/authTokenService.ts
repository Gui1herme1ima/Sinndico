import { createRemoteJWKSet, jwtVerify } from 'jose';

const SUPABASE_URL = process.env.SUPABASE_URL!;

const jwks = createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`));

export interface SupabaseTokenPayload {
  sub: string;
  email?: string;
}

export async function verifySupabaseToken(token: string): Promise<SupabaseTokenPayload> {
  const { payload } = await jwtVerify(token, jwks);
  return { sub: payload.sub as string, email: payload.email as string | undefined };
}
