import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ApiError } from '@/services/api/client';
import { setoresApi } from '@/services/api/setoresApi';
import type { SetorTipo } from '@/services/api/types';

export const SETOR_TIPO_OPTIONS: { value: SetorTipo; label: string }[] = [
  { value: 'bloco', label: 'Bloco' },
  { value: 'rua', label: 'Rua' },
  { value: 'quadra', label: 'Quadra' },
  { value: 'torre', label: 'Torre' },
  { value: 'outro', label: 'Outro' },
];

export interface CreateSetorFormProps {
  onSuccess?: () => void;
}

export function CreateSetorForm({ onSuccess }: CreateSetorFormProps) {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<SetorTipo>('bloco');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => setoresApi.create({ nome, tipo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setores'] });
      setNome('');
      setTipo('bloco');
      setError(null);
      onSuccess?.();
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao cadastrar setor.');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select
        label="Tipo de setor"
        value={tipo}
        onChange={(e) => setTipo(e.target.value as SetorTipo)}
        options={SETOR_TIPO_OPTIONS}
      />
      <Input
        label="Nome"
        placeholder="Ex.: Bloco A, Rua das Flores"
        required
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" loading={mutation.isPending} className="w-full">
        Cadastrar
      </Button>
    </form>
  );
}
