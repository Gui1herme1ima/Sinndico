import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/services/api/client';
import { residenciasApi } from '@/services/api/residenciasApi';
import type { TipoResidencia } from '@/services/api/types';

export interface CreateResidenciaFormProps {
  tipoResidencia: TipoResidencia;
  onSuccess?: () => void;
}

export function CreateResidenciaForm({ tipoResidencia, onSuccess }: CreateResidenciaFormProps) {
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
      onSuccess?.();
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label={ehApartamento ? 'Bloco' : 'Rua'}
        required
        value={blocoOuRua}
        onChange={(e) => setBlocoOuRua(e.target.value)}
      />
      <Input
        label={ehApartamento ? 'Número do apartamento' : 'Número da casa'}
        required
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" loading={mutation.isPending} className="w-full">
        Cadastrar
      </Button>
    </form>
  );
}
