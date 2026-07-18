import { TenantContext, withTenantContext } from '../database/tenantContext';

export interface Residencia {
  id: string;
  condominio_id: string;
  bloco: string | null;
  rua: string | null;
  numero: string;
  created_at: Date;
}

export interface CreateResidenciaInput {
  condominioId: string;
  bloco: string | null;
  rua: string | null;
  numero: string;
}

export interface UpdateResidenciaInput {
  bloco: string | null;
  rua: string | null;
  numero: string;
}

export async function createResidencia(ctx: TenantContext, input: CreateResidenciaInput): Promise<Residencia> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Residencia>(
      `INSERT INTO residencias (condominio_id, bloco, rua, numero)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.condominioId, input.bloco, input.rua, input.numero]
    );
    return result.rows[0];
  });
}

// Checagem explícita de duplicidade antes do insert (caminho principal de UX) — os índices únicos
// parciais da migration são só a rede de segurança. `bloco`/`rua` são exclusivos entre si (só um dos
// dois é preenchido por vez, decidido no controller a partir do tipo do condomínio).
export async function findConflictingResidencia(
  ctx: TenantContext,
  filtro: { bloco: string | null; rua: string | null; numero: string },
  excluirId?: string
): Promise<Residencia | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Residencia>(
      `SELECT * FROM residencias
       WHERE numero = $1
         AND bloco IS NOT DISTINCT FROM $2
         AND rua IS NOT DISTINCT FROM $3
         AND ($4::uuid IS NULL OR id <> $4)`,
      [filtro.numero, filtro.bloco, filtro.rua, excluirId ?? null]
    );
    return result.rows[0] ?? null;
  });
}

export async function listResidencias(ctx: TenantContext): Promise<Residencia[]> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Residencia>(
      'SELECT * FROM residencias ORDER BY bloco NULLS LAST, rua NULLS LAST, numero'
    );
    return result.rows;
  });
}

export async function findResidenciaById(ctx: TenantContext, id: string): Promise<Residencia | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Residencia>('SELECT * FROM residencias WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  });
}

export async function updateResidencia(
  ctx: TenantContext,
  id: string,
  input: UpdateResidenciaInput
): Promise<Residencia | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Residencia>(
      `UPDATE residencias SET bloco = $1, rua = $2, numero = $3 WHERE id = $4 RETURNING *`,
      [input.bloco, input.rua, input.numero, id]
    );
    return result.rows[0] ?? null;
  });
}
