import { TenantContext, withTenantContext } from '../database/tenantContext';

export type ChamadoCategoria = 'manutencao' | 'seguranca' | 'animal' | 'outra';
export type ChamadoStatus = 'aberto' | 'em-progresso' | 'resolvido';
export type ChamadoPrioridade = 'baixa' | 'media' | 'alta';

export interface Chamado {
  id: string;
  condominio_id: string;
  morador_id: string;
  assigned_to: string | null;
  categoria: ChamadoCategoria;
  titulo: string;
  descricao: string;
  status: ChamadoStatus;
  prioridade: ChamadoPrioridade;
  data_criacao: Date;
  data_resolvimento: Date | null;
}

export interface CreateChamadoInput {
  condominioId: string;
  moradorId: string;
  categoria: ChamadoCategoria;
  titulo: string;
  descricao: string;
}

export async function createChamado(ctx: TenantContext, input: CreateChamadoInput): Promise<Chamado> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Chamado>(
      `INSERT INTO chamados (condominio_id, morador_id, categoria, titulo, descricao)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [input.condominioId, input.moradorId, input.categoria, input.titulo, input.descricao]
    );
    return result.rows[0];
  });
}

export interface ListChamadosFilter {
  // RLS já restringe ao condomínio do contexto; isso aqui é só o filtro extra dentro do tenant
  // (moradores só veem os próprios chamados, admin vê todos).
  moradorId?: string;
}

export async function listChamados(ctx: TenantContext, filter: ListChamadosFilter): Promise<Chamado[]> {
  return withTenantContext(ctx, async (client) => {
    if (filter.moradorId) {
      const result = await client.query<Chamado>(
        'SELECT * FROM chamados WHERE morador_id = $1 ORDER BY data_criacao DESC',
        [filter.moradorId]
      );
      return result.rows;
    }
    const result = await client.query<Chamado>('SELECT * FROM chamados ORDER BY data_criacao DESC');
    return result.rows;
  });
}

export async function findChamadoById(ctx: TenantContext, id: string): Promise<Chamado | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Chamado>('SELECT * FROM chamados WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  });
}

export interface UpdateChamadoInput {
  status?: ChamadoStatus;
  prioridade?: ChamadoPrioridade;
  assignedTo?: string | null;
}

export async function updateChamado(ctx: TenantContext, id: string, input: UpdateChamadoInput): Promise<Chamado | null> {
  return withTenantContext(ctx, async (client) => {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.status !== undefined) {
      sets.push(`status = $${idx++}`);
      values.push(input.status);
      // Reabrir um chamado (tirar de "resolvido") limpa a data de resolução; resolver agora seta.
      sets.push(`data_resolvimento = ${input.status === 'resolvido' ? 'now()' : 'NULL'}`);
    }
    if (input.prioridade !== undefined) {
      sets.push(`prioridade = $${idx++}`);
      values.push(input.prioridade);
    }
    if (input.assignedTo !== undefined) {
      sets.push(`assigned_to = $${idx++}`);
      values.push(input.assignedTo);
    }

    if (sets.length === 0) {
      const result = await client.query<Chamado>('SELECT * FROM chamados WHERE id = $1', [id]);
      return result.rows[0] ?? null;
    }

    values.push(id);
    const result = await client.query<Chamado>(
      `UPDATE chamados SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] ?? null;
  });
}
