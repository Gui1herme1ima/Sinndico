const MINUTO = 60;
const HORA = 3600;
const DIA = 86400;
const MES = 2592000;

// Formato curto ("5 min", "3 h", "2 d") pro dropdown de notificações — sem dependência externa,
// só o suficiente pra esse uso (não é um formatador genérico de datas).
export function formatRelativeTime(iso: string): string {
  const diffSegundos = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);

  if (diffSegundos < MINUTO) return 'agora';
  if (diffSegundos < HORA) return `${Math.floor(diffSegundos / MINUTO)} min`;
  if (diffSegundos < DIA) return `${Math.floor(diffSegundos / HORA)} h`;
  if (diffSegundos < MES) return `${Math.floor(diffSegundos / DIA)} d`;

  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(iso));
}
