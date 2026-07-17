import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ApiError } from '@/services/api/client';
import { solicitacoesApi } from '@/services/api/solicitacoesApi';
import type { SolicitacaoCategoria } from '@/services/api/types';

const CATEGORIA_OPTIONS: { value: SolicitacaoCategoria; label: string }[] = [
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'seguranca', label: 'Segurança' },
  { value: 'animal', label: 'Animal invasor' },
  { value: 'outra', label: 'Outra' },
];

export function CreateSolicitacaoForm() {
  const queryClient = useQueryClient();
  const [categoria, setCategoria] = useState<SolicitacaoCategoria>('manutencao');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => solicitacoesApi.create({ categoria, titulo, descricao }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
      setTitulo('');
      setDescricao('');
      setCategoria('manutencao');
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao criar solicitação.');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <Card title="Nova solicitação">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          label="Categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as SolicitacaoCategoria)}
          options={CATEGORIA_OPTIONS}
        />
        <Input label="Título" required value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <Textarea
          label="Descrição"
          required
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" loading={mutation.isPending} className="self-start">
          Enviar solicitação
        </Button>
      </form>
    </Card>
  );
}
