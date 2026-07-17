import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/services/api/client';
import { condominiosApi } from '@/services/api/condominiosApi';

export function CreateCondominioForm() {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => condominiosApi.create({ nome }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condominios'] });
      setNome('');
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao criar condomínio.');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <Card title="Novo condomínio">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" loading={mutation.isPending} className="self-start">
          Criar condomínio
        </Button>
      </form>
    </Card>
  );
}
