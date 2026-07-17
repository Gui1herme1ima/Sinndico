import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const noSessionPersistence = { auth: { autoRefreshToken: false, persistSession: false } };

// Usado só no backend para operações administrativas (criar usuário, revogar sessão). Nunca expor ao frontend.
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, noSessionPersistence);

// Usado para login/refresh via password grant, como se fosse um cliente comum (chave anônima).
export const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, noSessionPersistence);
