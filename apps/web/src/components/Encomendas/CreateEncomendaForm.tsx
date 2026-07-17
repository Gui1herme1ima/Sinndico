import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ApiError } from '@/services/api/client';
import { encomendasApi } from '@/services/api/encomendasApi';

export function CreateEncomendaForm() {
  const queryClient = useQueryClient();
  const [moradorId, setMoradorId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      encomendasApi.create({
        moradorId,
        descricao: descricao || undefined,
        fotoUrl: fotoUrl || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encomendas'] });
      setMoradorId('');
      setDescricao('');
      setFotoUrl('');
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao cadastrar encomenda.');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <Card title="Nova encomenda">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="ID do morador"
          helperText="UUID do morador dono da encomenda."
          required
          value={moradorId}
          onChange={(e) => setMoradorId(e.target.value)}
        />
        <Textarea
          label="Descrição (opcional)"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <Input
          label="URL da foto (opcional)"
          type="url"
          value={fotoUrl}
          onChange={(e) => setFotoUrl(e.target.value)}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" loading={mutation.isPending} className="self-start">
          Cadastrar encomenda
        </Button>
      </form>
    </Card>
  );
}
