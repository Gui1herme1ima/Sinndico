// Caso degenerado: o admin desligou os 4 módulos configuráveis da portaria (Fatia 5/RBAC) ao mesmo
// tempo, então não há nenhuma rota segura pra redirecionar um porteiro sem criar um loop de navegação
// (todo alvo possível estaria bloqueado). Mostra uma mensagem em vez de tentar um Navigate.
export function SemAcessoAoModulo() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
      <p className="text-text-primary">Nenhum módulo está liberado pra portaria neste condomínio.</p>
      <p className="text-sm text-text-secondary">Fale com o administrador do condomínio.</p>
    </div>
  );
}
