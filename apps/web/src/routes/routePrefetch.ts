import { queryClient } from '@/lib/queryClient';
import { areasComunsApi } from '@/services/api/areasComunsApi';
import { assembleiasApi } from '@/services/api/assembleiasApi';
import { comidaApi } from '@/services/api/comidaApi';
import { comunicadosApi } from '@/services/api/comunicadosApi';
import { condominiosApi } from '@/services/api/condominiosApi';
import { dashboardApi } from '@/services/api/dashboardApi';
import { encomendasApi } from '@/services/api/encomendasApi';
import { reservasApi } from '@/services/api/reservasApi';
import { residenciasApi } from '@/services/api/residenciasApi';
import { solicitacoesApi } from '@/services/api/solicitacoesApi';
import { usersApi } from '@/services/api/usersApi';
import { visitantesApi } from '@/services/api/visitantesApi';

// Prefetch on hover (Fatia 4.1): ao passar o mouse/foco por um link da navegação, a query da lista
// daquela rota já é buscada e cacheada — quando o usuário clica, a tela abre com o dado pronto.
// `prefetchQuery` respeita o `staleTime` global (queryClient): se o dado ainda está fresco, não
// dispara request. Cada entrada usa a MESMA queryKey/queryFn da página, senão o cache não bate.
const PREFETCHERS: Record<string, () => void> = {
  '/dashboard': () =>
    void queryClient.prefetchQuery({ queryKey: ['dashboard-summary'], queryFn: () => dashboardApi.getSummary() }),
  '/solicitacoes': () =>
    void queryClient.prefetchQuery({ queryKey: ['solicitacoes'], queryFn: () => solicitacoesApi.list() }),
  '/encomendas': () =>
    void queryClient.prefetchQuery({ queryKey: ['encomendas'], queryFn: () => encomendasApi.list() }),
  '/comunicados': () =>
    void queryClient.prefetchQuery({ queryKey: ['comunicados'], queryFn: () => comunicadosApi.list() }),
  '/chat': () =>
    void queryClient.prefetchQuery({
      queryKey: ['moradores-diretorio'],
      queryFn: () => usersApi.listDiretorio(),
    }),
  '/visitantes': () =>
    void queryClient.prefetchQuery({ queryKey: ['visitantes'], queryFn: () => visitantesApi.list() }),
  '/comida': () => void queryClient.prefetchQuery({ queryKey: ['comida'], queryFn: () => comidaApi.list() }),
  '/areas-comuns': () => {
    void queryClient.prefetchQuery({ queryKey: ['areas-comuns'], queryFn: () => areasComunsApi.list() });
    void queryClient.prefetchQuery({ queryKey: ['reservas'], queryFn: () => reservasApi.list() });
  },
  '/assembleias': () =>
    void queryClient.prefetchQuery({ queryKey: ['assembleias'], queryFn: () => assembleiasApi.list() }),
  '/residencias': () =>
    void queryClient.prefetchQuery({ queryKey: ['residencias'], queryFn: () => residenciasApi.list() }),
  '/moradores': () =>
    void queryClient.prefetchQuery({ queryKey: ['moradores'], queryFn: () => usersApi.listMoradores() }),
  '/equipe': () => void queryClient.prefetchQuery({ queryKey: ['equipe'], queryFn: () => usersApi.listEquipe() }),
  '/condominios': () =>
    void queryClient.prefetchQuery({ queryKey: ['condominios'], queryFn: () => condominiosApi.list() }),
};

export function prefetchRoute(path: string): void {
  PREFETCHERS[path]?.();
}
