import type { PermissoesPorteiro, UserRole } from '@/services/api/types';

const PORTEIRO_ROTA_POR_MODULO: Array<{ moduleKey: keyof PermissoesPorteiro; to: string }> = [
  { moduleKey: 'encomendas', to: '/encomendas' },
  { moduleKey: 'visitantes', to: '/visitantes' },
  { moduleKey: 'comida', to: '/comida' },
  { moduleKey: 'comunicados', to: '/comunicados' },
];

// Pra porteiro, considera as permissões por módulo (Fatia 5/RBAC) — nunca aponta pra um módulo que o
// admin desligou pra portaria, senão RequireAuth bloquearia de novo e criaria um loop de redirect.
// Devolve null só no caso degenerado de o admin ter desligado os 4 módulos ao mesmo tempo.
export function roleHome(role: UserRole, permissoesPorteiro?: PermissoesPorteiro): string | null {
  switch (role) {
    case 'admin':
      return '/dashboard';
    case 'morador':
      return '/solicitacoes';
    case 'porteiro': {
      if (!permissoesPorteiro) return '/encomendas';
      const habilitado = PORTEIRO_ROTA_POR_MODULO.find((item) => permissoesPorteiro[item.moduleKey]);
      return habilitado?.to ?? null;
    }
    case 'superadmin':
      return '/condominios';
  }
}
