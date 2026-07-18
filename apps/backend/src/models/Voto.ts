import { TenantContext, withTenantContext } from '../database/tenantContext';

export type OpcaoVoto = 'sim' | 'nao' | 'abstencao';

export interface Voto {
  id: string;
  assembleia_id: string;
  morador_id: string;
  voto: OpcaoVoto;
  timestamp: Date;
}

export interface ContagemVotos {
  sim: number;
  nao: number;
  abstencao: number;
  total: number;
}

export async function findVotoDoMorador(
  ctx: TenantContext,
  assembleiaId: string,
  moradorId: string
): Promise<Voto | null> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Voto>(
      'SELECT * FROM votos WHERE assembleia_id = $1 AND morador_id = $2',
      [assembleiaId, moradorId]
    );
    return result.rows[0] ?? null;
  });
}

export async function createVoto(
  ctx: TenantContext,
  assembleiaId: string,
  moradorId: string,
  voto: OpcaoVoto
): Promise<Voto> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<Voto>(
      `INSERT INTO votos (assembleia_id, morador_id, voto)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [assembleiaId, moradorId, voto]
    );
    return result.rows[0];
  });
}

// "Ata automática" — contagem em tempo real, sempre calculada, nunca um documento à parte.
export async function contarVotos(ctx: TenantContext, assembleiaId: string): Promise<ContagemVotos> {
  return withTenantContext(ctx, async (client) => {
    const result = await client.query<{ voto: OpcaoVoto; total: string }>(
      'SELECT voto, COUNT(*) AS total FROM votos WHERE assembleia_id = $1 GROUP BY voto',
      [assembleiaId]
    );
    const contagem: ContagemVotos = { sim: 0, nao: 0, abstencao: 0, total: 0 };
    for (const row of result.rows) {
      const total = Number(row.total);
      contagem[row.voto] = total;
      contagem.total += total;
    }
    return contagem;
  });
}

// Usada pelo list() do controller pra resolver o "meuVoto" de um morador em várias assembleias numa
// query só, em vez de uma consulta por linha.
export async function listVotosDoMorador(
  ctx: TenantContext,
  assembleiaIds: string[],
  moradorId: string
): Promise<Map<string, OpcaoVoto>> {
  const mapa = new Map<string, OpcaoVoto>();
  if (assembleiaIds.length === 0) return mapa;

  return withTenantContext(ctx, async (client) => {
    const result = await client.query<{ assembleia_id: string; voto: OpcaoVoto }>(
      'SELECT assembleia_id, voto FROM votos WHERE assembleia_id = ANY($1::uuid[]) AND morador_id = $2',
      [assembleiaIds, moradorId]
    );
    for (const row of result.rows) {
      mapa.set(row.assembleia_id, row.voto);
    }
    return mapa;
  });
}

// Usada pelo list() do controller pra não fazer N+1 query de contagem por assembleia listada.
export async function contarVotosPorAssembleias(
  ctx: TenantContext,
  assembleiaIds: string[]
): Promise<Map<string, ContagemVotos>> {
  const mapa = new Map<string, ContagemVotos>();
  if (assembleiaIds.length === 0) return mapa;

  return withTenantContext(ctx, async (client) => {
    const result = await client.query<{ assembleia_id: string; voto: OpcaoVoto; total: string }>(
      'SELECT assembleia_id, voto, COUNT(*) AS total FROM votos WHERE assembleia_id = ANY($1::uuid[]) GROUP BY assembleia_id, voto',
      [assembleiaIds]
    );
    for (const row of result.rows) {
      const contagem = mapa.get(row.assembleia_id) ?? { sim: 0, nao: 0, abstencao: 0, total: 0 };
      const total = Number(row.total);
      contagem[row.voto] = total;
      contagem.total += total;
      mapa.set(row.assembleia_id, contagem);
    }
    return mapa;
  });
}
