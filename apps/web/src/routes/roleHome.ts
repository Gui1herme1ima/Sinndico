import type { UserRole } from '@/services/api/types';

export function roleHome(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/dashboard';
    case 'morador':
      return '/solicitacoes';
    case 'porteiro':
      return '/encomendas';
    case 'superadmin':
      return '/em-construcao';
  }
}
