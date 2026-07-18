import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      // Cache (Fatia 4.1): dado é "fresco" por 30s — revisitar uma lista dentro desse intervalo serve
      // do cache na hora, sem refetch. Depois de 30s o dado ainda aparece do cache (stale) enquanto
      // revalida em background. gcTime mantém o cache 5min após a query ficar sem observador, então
      // voltar pra uma tela já visitada é instantâneo.
      staleTime: 30_000,
      gcTime: 5 * 60_000,
    },
  },
});
