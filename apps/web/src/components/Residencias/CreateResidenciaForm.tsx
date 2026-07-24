import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/services/api/client';
import { residenciasApi } from '@/services/api/residenciasApi';

export interface CreateResidenciaFormProps {
  setorId: string;
  onSuccess?: () => void;
}

export function CreateResidenciaForm({ setorId, onSuccess }: CreateResidenciaFormProps) {
  const queryClient = useQueryClient();
  const [numero, setNumero] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => residenciasApi.create({ setorId, numero }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residencias', setorId] });
      queryClient.invalidateQueries({ queryKey: ['setores'] });
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
      <Input label="Número" required value={numero} onChange={(e) => setNumero(e.target.value)} />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" loading={mutation.isPending} className="w-full">
        Cadastrar
      </Button>
    </form>
  );
}
