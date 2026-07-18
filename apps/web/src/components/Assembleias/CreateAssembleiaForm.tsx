import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { assembleiasApi } from '@/services/api/assembleiasApi';
import { ApiError } from '@/services/api/client';

export function CreateAssembleiaForm() {
  const queryClient = useQueryClient();
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [descricao, setDescricao] = useState('');
  const [pauta, setPauta] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      assembleiasApi.create({
        titulo,
        data: new Date(data).toISOString(),
        descricao: descricao || undefined,
        pauta: pauta || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assembleias'] });
      setTitulo('');
      setData('');
      setDescricao('');
      setPauta('');
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao convocar assembleia.');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <Card title="Convocar assembleia">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Título" required value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          <Input
            label="Data e hora"
            type="datetime-local"
            required
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>
        <Textarea label="Pauta" value={pauta} onChange={(e) => setPauta(e.target.value)} />
        <Textarea label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />

        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" loading={mutation.isPending} className="self-start">
          Convocar
        </Button>
      </form>
    </Card>
  );
}
