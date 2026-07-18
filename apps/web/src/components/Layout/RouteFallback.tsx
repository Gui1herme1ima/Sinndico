import { Skeleton } from '@/components/ui/Skeleton';

// Fallback do Suspense enquanto o chunk da rota (lazy) carrega — Fatia 4.1, code splitting.
// Esqueleto genérico de cabeçalho + lista, no lugar de um spinner nu, mantendo a "assinatura" de
// skeleton loading do produto e respeitando prefers-reduced-motion (via Skeleton).
export function RouteFallback() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
