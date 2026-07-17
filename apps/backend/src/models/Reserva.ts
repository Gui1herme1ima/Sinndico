import { TenantContext, withTenantContext } from '../database/tenantContext';

export type ReservaStatus = 'pendente' | 'aprovada' | 'cancelada';

export interface Reserva {
  id: string;
  condominio_id: string;
  area_comum_id: string;
  morador_id: string;
  hora_inicio: Date;
  hora_fim: Date;
  status: ReservaStatus;
  created_at: Date;
}

export interface CreateReservaInput {
  condominioId: string;
  areaComumId: string;
  moradorId: string;
  horaInicio: string;
  horaFim: string;
}

// Pendente e aprovada bloqueiam o horário (só cancelada libera) — decisão confirmada com o usuário:
// reserva pendente já "segura" o horário, como reserva de restaurante, pra não deixar dois moradores
// pedirem o mesmo horário e um deles ser recusado depois por conflito.
export async function hasConflictingReserva(
  ctx: TenantContext,
  areaComumId: string,
  horaInicio: string,
  horaFim: string
): Promise<boolean> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query(
      `SELECT 1 FROM reservas
       WHERE area_comum_id = $1
         AND status IN ('pendente', 'aprovada')
         AND hora_inicio < $3
         AND hora_fim > $2
       LIMIT 1`,
      [areaComumId, horaInicio, horaFim]
    );
    return (result.rowCount ?? 0) > 0;
  });
}

export async function createReserva(ctx: TenantContext, input: CreateReservaInput): Promise<Reserva> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Reserva>(
      `INSERT INTO reservas (condominio_id, area_comum_id, morador_id, hora_inicio, hora_fim)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [input.condominioId, input.areaComumId, input.moradorId, input.horaInicio, input.horaFim]
    );
    return result.rows[0];
  });
}

export interface ListReservasFilter {
  moradorId?: string;
}

export async function listReservas(ctx: TenantContext, filter: ListReservasFilter): Promise<Reserva[]> {
  return withTenantContext(ctx, async (client) => {
    if (filter.moradorId) {
      const result = await client.query<Reserva>(
        'SELECT * FROM reservas WHERE morador_id = $1 ORDER BY hora_inicio DESC',
        [filter.moradorId]
      );
      return result.rows;
    }
    const result = await client.query<Reserva>('SELECT * FROM reservas ORDER BY hora_inicio DESC');
    return result.rows;
  });
}

export async function findReservaById(ctx: TenantContext, id: string): Promise<Reserva | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Reserva>('SELECT * FROM reservas WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  });
}

// restrictToMoradorId: quando informado, o próprio UPDATE filtra por dono (uso do morador
// cancelando a própria reserva); sem ele, atualiza por id sem restrição (uso do admin aprovando ou
// cancelando qualquer reserva do tenant).
export async function updateReservaStatus(
  ctx: TenantContext,
  id: string,
  status: Exclude<ReservaStatus, 'pendente'>,
  restrictToMoradorId?: string
): Promise<Reserva | null> {
  return withTenantContext(ctx, async (client) => {
    if (restrictToMoradorId) {
      const result = await client.query<Reserva>(
        'UPDATE reservas SET status = $1 WHERE id = $2 AND morador_id = $3 RETURNING *',
        [status, id, restrictToMoradorId]
      );
      return result.rows[0] ?? null;
    }
    const result = await client.query<Reserva>(
      'UPDATE reservas SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] ?? null;
  });
}
