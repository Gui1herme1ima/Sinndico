import * as XLSX from 'xlsx';

// Lê .csv ou .xlsx com a mesma API (SheetJS) — cobre os dois formatos do roadmap com uma dependência
// só. Chaves normalizadas pra minúsculo/sem espaço nas pontas, já que o cabeçalho da planilha do
// usuário pode vir com variação de maiúscula/espaçamento.
export async function parseSpreadsheetFile(file: File): Promise<Record<string, string>[]> {
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
