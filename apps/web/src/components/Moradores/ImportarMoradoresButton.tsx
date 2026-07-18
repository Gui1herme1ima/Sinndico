import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { parseSpreadsheetFile } from '@/lib/parseSpreadsheet';
import { ApiError } from '@/services/api/client';
import { usersApi } from '@/services/api/usersApi';
import type { ImportarResultado } from '@/services/api/types';

// Colunas esperadas: nome, email, telefone (opcional), bloco (ou rua), numero — a residência é
// casada por bloco/rua+número contra as já cadastradas (o CSV não tem o UUID), ver
// userController.importarMoradores.
export function ImportarMoradoresButton() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [resultado, setResultado] = useState<ImportarResultado | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (
      moradores: { nome: string; email: string; telefone?: string; bloco?: string; rua?: string; numero: string }[]
    ) => usersApi.importarMoradores({ moradores }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['moradores'] });
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
      const moradores = linhas
        .filter((linha) => linha.nome && linha.email && linha.numero)
        .map((linha) => ({
          nome: linha.nome,
          email: linha.email,
          telefone: linha.telefone || undefined,
          bloco: linha.bloco || undefined,
          rua: linha.rua || undefined,
          numero: linha.numero,
        }));

      if (moradores.length === 0) {
        setError('Nenhuma linha com nome/email/numero preenchidos foi encontrada no arquivo.');
        return;
      }

      mutation.mutate(moradores);
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
            {resultado.criadas} morador(es) importado(s)
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
