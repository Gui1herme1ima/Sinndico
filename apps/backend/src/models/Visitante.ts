import { TenantContext, withTenantContext } from '../database/tenantContext';

export type VisitanteStatus = 'aprovado' | 'bloqueado' | 'ativo';

export interface Visitante {
  id: string;
  condominio_id: string;
  morador_id: string;
  aprovado_por: string;
  nome_visitante: string;
  rg: string | null;
  placa_veiculo: string | null;
  data_visita: Date;
  hora_entrada: Date | null;
  hora_saida: Date | null;
  status: VisitanteStatus;
  created_at: Date;
}

export interface CreateVisitanteInput {
  condominioId: string;
  moradorId: string;
  aprovadoPor: string;
  nomeVisitante: string;
  rg?: string;
  placaVeiculo?: string;
  dataVisita: string;
}

export async function createVisitante(ctx: TenantContext, input: CreateVisitanteInput): Promise<Visitante> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Visitante>(
      `INSERT INTO visitantes (condominio_id, morador_id, aprovado_por, nome_visitante, rg, placa_veiculo, data_visita)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        input.condominioId,
        input.moradorId,
        input.aprovadoPor,
        input.nomeVisitante,
        input.rg ?? null,
        input.placaVeiculo ?? null,
        input.dataVisita,
      ]
    );
    return result.rows[0];
  });
}

export interface ListVisitantesFilter {
  // RLS já restringe ao condomínio do contexto; isso aqui é só o filtro extra dentro do tenant
  // (moradores só veem os próprios visitantes; admin/porteiro veem todos).
  moradorId?: string;
}

export async function listVisitantes(ctx: TenantContext, filter: ListVisitantesFilter): Promise<Visitante[]> {
  return withTenantContext(ctx, async (client) => {
    if (filter.moradorId) {
      const result = await client.query<Visitante>(
        'SELECT * FROM visitantes WHERE morador_id = $1 ORDER BY data_visita DESC',
        [filter.moradorId]
      );
      return result.rows;
    }
    const result = await client.query<Visitante>('SELECT * FROM visitantes ORDER BY data_visita DESC');
    return result.rows;
  });
}

export async function findVisitanteById(ctx: TenantContext, id: string): Promise<Visitante | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Visitante>('SELECT * FROM visitantes WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  });
}

// A condição de status no próprio WHERE evita entrada fora de ordem (ex.: check-in duplicado ou de
// visitante bloqueado) — se não bater, RETURNING vem vazio e o controller trata como 400.
export async function registrarEntrada(ctx: TenantContext, id: string): Promise<Visitante | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Visitante>(
      `UPDATE visitantes SET hora_entrada = now(), status = 'ativo'
       WHERE id = $1 AND status = 'aprovado'
       RETURNING *`,
      [id]
    );
    return result.rows[0] ?? null;
  });
}

export async function registrarSaida(ctx: TenantContext, id: string): Promise<Visitante | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Visitante>(
      `UPDATE visitantes SET hora_saida = now()
       WHERE id = $1 AND status = 'ativo' AND hora_saida IS NULL
       RETURNING *`,
      [id]
    );
    return result.rows[0] ?? null;
  });
}

export async function updateVisitanteStatus(
  ctx: TenantContext,
  id: string,
  status: 'aprovado' | 'bloqueado'
): Promise<Visitante | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Visitante>(
      'UPDATE visitantes SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] ?? null;
  });
}
