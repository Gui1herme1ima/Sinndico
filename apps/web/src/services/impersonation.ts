const CONDOMINIO_ID_KEY = 'sinndico:impersonatingCondominioId';
const NOME_KEY = 'sinndico:impersonatingNome';

// "Ver como": sessionStorage (não localStorage) de propósito — é uma elevação transitória da sessão
// do superadmin, não deve sobreviver a reabrir o navegador. O client de API anexa o condominioId aqui
// guardado como header em toda request (ver services/api/client.ts).
export const impersonation = {
  get(): { condominioId: string; nome: string } | null {
    const condominioId = sessionStorage.getItem(CONDOMINIO_ID_KEY);
    const nome = sessionStorage.getItem(NOME_KEY);
    return condominioId ? { condominioId, nome: nome ?? '' } : null;
  },
  set(condominioId: string, nome: string): void {
    sessionStorage.setItem(CONDOMINIO_ID_KEY, condominioId);
    sessionStorage.setItem(NOME_KEY, nome);
  },
  clear(): void {
    sessionStorage.removeItem(CONDOMINIO_ID_KEY);
    sessionStorage.removeItem(NOME_KEY);
  },
};
