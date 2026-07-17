import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { areasComunsApi } from '@/services/api/areasComunsApi';
import { ApiError } from '@/services/api/client';

export function CreateAreaComumForm() {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState('');
  const [horarioFuncionamento, setHorarioFuncionamento] = useState('');
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      areasComunsApi.create({
        nome,
        horarioFuncionamento: horarioFuncionamento || undefined,
        descricao: descricao || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas-comuns'] });
      setNome('');
      setHorarioFuncionamento('');
      setDescricao('');
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao criar área comum.');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <Card title="Nova área comum">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
        <Input
          label="Horário de funcionamento (opcional)"
          placeholder="ex.: 08h às 22h"
          value={horarioFuncionamento}
          onChange={(e) => setHorarioFuncionamento(e.target.value)}
        />
        <Input
          label="Descrição (opcional)"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" loading={mutation.isPending} className="self-start">
          Criar área comum
        </Button>
      </form>
    </Card>
  );
}
