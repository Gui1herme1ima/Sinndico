// Lê .csv ou .xlsx com a mesma API (SheetJS) — cobre os dois formatos do roadmap com uma dependência
// só. Chaves normalizadas pra minúsculo/sem espaço nas pontas, já que o cabeçalho da planilha do
// usuário pode vir com variação de maiúscula/espaçamento.
//
// O SheetJS é pesado (~400 kB) e só é usado na importação em massa. Por isso o `import('xlsx')` é
// dinâmico: o Vite o separa num chunk próprio, carregado sob demanda quando o usuário importa uma
// planilha — não entra no bundle inicial da aplicação (ver Fatia 4.1, code splitting).
export async function parseSpreadsheetFile(file: File): Promise<Record<string, string>[]> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  return rows.map((row) => {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      normalized[key.trim().toLowerCase()] = String(value ?? '').trim();
    }
    return normalized;
  });
}
