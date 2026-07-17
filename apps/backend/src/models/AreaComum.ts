import { TenantContext, withTenantContext } from '../database/tenantContext';

export interface AreaComum {
  id: string;
  condominio_id: string;
  nome: string;
  horario_funcionamento: string | null;
  descricao: string | null;
  created_at: Date;
}

export interface CreateAreaComumInput {
  condominioId: string;
  nome: string;
  horarioFuncionamento?: string;
  descricao?: string;
}

export async function createAreaComum(ctx: TenantContext, input: CreateAreaComumInput): Promise<AreaComum> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<AreaComum>(
      `INSERT INTO areas_comuns (condominio_id, nome, horario_funcionamento, descricao)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.condominioId, input.nome, input.horarioFuncionamento ?? null, input.descricao ?? null]
    );
    return result.rows[0];
  });
}

export async function listAreasComuns(ctx: TenantContext): Promise<AreaComum[]> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<AreaComum>('SELECT * FROM areas_comuns ORDER BY nome ASC');
    return result.rows;
  });
}

export async function findAreaComumById(ctx: TenantContext, id: string): Promise<AreaComum | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<AreaComum>('SELECT * FROM areas_comuns WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  });
}

export interface UpdateAreaComumInput {
  nome?: string;
  horarioFuncionamento?: string;
  descricao?: string;
}

export async function updateAreaComum(
  ctx: TenantContext,
  id: string,
  input: UpdateAreaComumInput
): Promise<AreaComum | null> {
  return withTenantContext(ctx, async (client) => {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.nome !== undefined) {
      sets.push(`nome = $${idx++}`);
      values.push(input.nome);
    }
    if (input.horarioFuncionamento !== undefined) {
      sets.push(`horario_funcionamento = $${idx++}`);
      values.push(input.horarioFuncionamento);
    }
    if (input.descricao !== undefined) {
      sets.push(`descricao = $${idx++}`);
      values.push(input.descricao);
    }

    if (sets.length === 0) {
      const result = await client.query<AreaComum>('SELECT * FROM areas_comuns WHERE id = $1', [id]);
      return result.rows[0] ?? null;
    }

    values.push(id);
    const result = await client.query<AreaComum>(
      `UPDATE areas_comuns SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] ?? null;
  });
}
