import { TenantContext, withTenantContext } from '../database/tenantContext';

export type SolicitacaoCategoria = 'manutencao' | 'seguranca' | 'animal' | 'outra';
export type SolicitacaoStatus = 'aberto' | 'em-progresso' | 'resolvido';
export type SolicitacaoPrioridade = 'baixa' | 'media' | 'alta';

export interface Solicitacao {
  id: string;
  condominio_id: string;
  morador_id: string;
  assigned_to: string | null;
  categoria: SolicitacaoCategoria;
  titulo: string;
  descricao: string;
  status: SolicitacaoStatus;
  prioridade: SolicitacaoPrioridade;
  data_criacao: Date;
  data_resolvimento: Date | null;
}

export interface CreateSolicitacaoInput {
  condominioId: string;
  moradorId: string;
  categoria: SolicitacaoCategoria;
  titulo: string;
  descricao: string;
}

export async function createSolicitacao(ctx: TenantContext, input: CreateSolicitacaoInput): Promise<Solicitacao> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Solicitacao>(
      `INSERT INTO solicitacoes (condominio_id, morador_id, categoria, titulo, descricao)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [input.condominioId, input.moradorId, input.categoria, input.titulo, input.descricao]
    );
    return result.rows[0];
  });
}

export interface ListSolicitacoesFilter {
  // RLS já restringe ao condomínio do contexto; isso aqui é só o filtro extra dentro do tenant
  // (moradores só veem as próprias solicitações, admin vê todas).
  moradorId?: string;
}

export async function listSolicitacoes(ctx: TenantContext, filter: ListSolicitacoesFilter): Promise<Solicitacao[]> {
  return withTenantContext(ctx, async (client) => {
    if (filter.moradorId) {
      const result = await client.query<Solicitacao>(
        'SELECT * FROM solicitacoes WHERE morador_id = $1 ORDER BY data_criacao DESC',
        [filter.moradorId]
      );
      return result.rows;
    }
    const result = await client.query<Solicitacao>('SELECT * FROM solicitacoes ORDER BY data_criacao DESC');
    return result.rows;
  });
}

export async function findSolicitacaoById(ctx: TenantContext, id: string): Promise<Solicitacao | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Solicitacao>('SELECT * FROM solicitacoes WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  });
}

export interface UpdateSolicitacaoInput {
  status?: SolicitacaoStatus;
  prioridade?: SolicitacaoPrioridade;
  assignedTo?: string | null;
}

export async function updateSolicitacao(
  ctx: TenantContext,
  id: string,
  input: UpdateSolicitacaoInput
): Promise<Solicitacao | null> {
  return withTenantContext(ctx, async (client) => {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.status !== undefined) {
      sets.push(`status = $${idx++}`);
      values.push(input.status);
      // Reabrir uma solicitação (tirar de "resolvido") limpa a data de resolução; resolver agora seta.
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
      const result = await client.query<Solicitacao>('SELECT * FROM solicitacoes WHERE id = $1', [id]);
      return result.rows[0] ?? null;
    }

    values.push(id);
    const result = await client.query<Solicitacao>(
      `UPDATE solicitacoes SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] ?? null;
  });
}
