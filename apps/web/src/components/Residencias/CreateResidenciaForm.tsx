import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/services/api/client';
import { residenciasApi } from '@/services/api/residenciasApi';
import type { TipoResidencia } from '@/services/api/types';

export interface CreateResidenciaFormProps {
  tipoResidencia: TipoResidencia;
}

export function CreateResidenciaForm({ tipoResidencia }: CreateResidenciaFormProps) {
  const queryClient = useQueryClient();
  const [blocoOuRua, setBlocoOuRua] = useState('');
  const [numero, setNumero] = useState('');
  const [error, setError] = useState<string | null>(null);

  const ehApartamento = tipoResidencia === 'apartamento';

  const mutation = useMutation({
    mutationFn: () =>
      residenciasApi.create(
        ehApartamento ? { bloco: blocoOuRua, numero } : { rua: blocoOuRua, numero }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residencias'] });
      setBlocoOuRua('');
      setNumero('');
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao cadastrar residência.');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <Card title="Nova residência">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <Input
          label={ehApartamento ? 'Bloco' : 'Rua'}
          required
          className="flex-1"
          value={blocoOuRua}
          onChange={(e) => setBlocoOuRua(e.target.value)}
        />
        <Input
          label={ehApartamento ? 'Número do apartamento' : 'Número da casa'}
          required
          className="flex-1"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
        />
        <Button type="submit" loading={mutation.isPending}>
          Cadastrar
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </Card>
  );
}
