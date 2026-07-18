import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { parseSpreadsheetFile } from '@/lib/parseSpreadsheet';
import { ApiError } from '@/services/api/client';
import { residenciasApi } from '@/services/api/residenciasApi';
import type { ImportarResultado } from '@/services/api/types';

// Colunas esperadas na planilha: bloco (ou rua) + numero — mesmas regras condicionais do form de
// cadastro individual, aplicadas linha a linha no backend (ver residenciaController.importar).
export function ImportarResidenciasButton() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [resultado, setResultado] = useState<ImportarResultado | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (residencias: { bloco?: string; rua?: string; numero: string }[]) =>
      residenciasApi.importar({ residencias }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['residencias'] });
      setResultado(response);
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao importar.');
      setResultado(null);
    },
  });

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setResultado(null);
    setError(null);

    try {
      const linhas = await parseSpreadsheetFile(file);
      const residencias = linhas
        .filter((linha) => linha.numero)
        .map((linha) => ({
          bloco: linha.bloco || undefined,
          rua: linha.rua || undefined,
          numero: linha.numero,
        }));

      if (residencias.length === 0) {
        setError('Nenhuma linha com a coluna "numero" preenchida foi encontrada no arquivo.');
        return;
      }

      mutation.mutate(residencias);
    } catch {
      setError('Não foi possível ler o arquivo. Confira se é um .csv ou .xlsx válido.');
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx"
        className="hidden"
        onChange={(e) => void handleFileChange(e)}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        loading={mutation.isPending}
        onClick={() => inputRef.current?.click()}
        className="self-start"
      >
        Importar de planilha (.csv/.xlsx)
      </Button>

      {error && <p className="text-sm text-danger">{error}</p>}

      {resultado && (
        <div className="text-sm">
          <p className="text-text-secondary">
            {resultado.criadas} residência(s) importada(s)
            {resultado.erros.length > 0 && `, ${resultado.erros.length} com erro:`}
          </p>
          {resultado.erros.length > 0 && (
            <ul className="mt-1 list-disc pl-5 text-danger">
              {resultado.erros.map((erro) => (
                <li key={erro.linha}>
                  Linha {erro.linha}: {erro.motivo}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
