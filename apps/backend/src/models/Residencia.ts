import { TenantContext, withTenantContext } from '../database/tenantContext';

export interface Residencia {
  id: string;
  condominio_id: string;
  setor_id: string;
  numero: string;
  created_at: Date;
}

export interface ResidenciaComContagem extends Residencia {
  moradores_count: number;
}

export interface CreateResidenciaInput {
  condominioId: string;
  setorId: string;
  numero: string;
}

export interface UpdateResidenciaInput {
  setorId: string;
  numero: string;
}

export async function createResidencia(ctx: TenantContext, input: CreateResidenciaInput): Promise<Residencia> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Residencia>(
      `INSERT INTO residencias (condominio_id, setor_id, numero)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [input.condominioId, input.setorId, input.numero]
    );
    return result.rows[0];
  });
}

// Checagem explícita de duplicidade antes do insert (caminho principal de UX) — o índice único
// (setor_id, numero) da migration é só a rede de segurança.
export async function findConflictingResidencia(
  ctx: TenantContext,
  filtro: { setorId: string; numero: string },
  excluirId?: string
): Promise<Residencia | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Residencia>(
      `SELECT * FROM residencias
       WHERE setor_id = $1 AND numero = $2
         AND ($3::uuid IS NULL OR id <> $3)`,
      [filtro.setorId, filtro.numero, excluirId ?? null]
    );
    return result.rows[0] ?? null;
  });
}

export interface ResidenciaComSetorNome {
  id: string;
  setor_nome: string;
  numero: string;
}

// Usado só pela importação em massa de moradores (userController.importarMoradores), que resolve
// cada linha da planilha por nome-do-setor + número em vez de um UUID que a planilha não tem.
export async function listResidenciasComSetorParaTenant(ctx: TenantContext): Promise<ResidenciaComSetorNome[]> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<ResidenciaComSetorNome>(
      `SELECT r.id, s.nome AS setor_nome, r.numero
       FROM residencias r
       JOIN setores s ON s.id = r.setor_id`
    );
    return result.rows;
  });
}

export interface ResidenciaComSetorInfo extends Residencia {
  setor_nome: string;
  setor_tipo: string;
}

// Lista achatada de todas as residências do tenant (todos os setores), com o setor resolvido —
// usada pelo seletor de residência do form de morador (Moradores continua permitindo escolher
// livremente, fora do contexto de um setor específico).
export async function listTodasResidencias(ctx: TenantContext): Promise<ResidenciaComSetorInfo[]> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<ResidenciaComSetorInfo>(
      `SELECT r.*, s.nome AS setor_nome, s.tipo AS setor_tipo
       FROM residencias r
       JOIN setores s ON s.id = r.setor_id
       ORDER BY s.nome, r.numero`
    );
    return result.rows;
  });
}

export async function listResidenciasPorSetor(
  ctx: TenantContext,
  setorId: string,
  search?: string
): Promise<ResidenciaComContagem[]> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<ResidenciaComContagem>(
      `SELECT r.*, COUNT(u.id) AS moradores_count
       FROM residencias r
       LEFT JOIN users u ON u.residencia_id = r.id
       WHERE r.setor_id = $1 AND ($2::text IS NULL OR r.numero ILIKE '%' || $2 || '%')
       GROUP BY r.id
       ORDER BY r.numero`,
      [setorId, search ?? null]
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

export async function findSetorNomeByResidenciaId(
  ctx: TenantContext,
  setorId: string
): Promise<{ nome: string; tipo: string } | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<{ nome: string; tipo: string }>(
      'SELECT nome, tipo FROM setores WHERE id = $1',
      [setorId]
    );
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
      `UPDATE residencias SET setor_id = $1, numero = $2 WHERE id = $3 RETURNING *`,
      [input.setorId, input.numero, id]
    );
    return result.rows[0] ?? null;
  });
}
