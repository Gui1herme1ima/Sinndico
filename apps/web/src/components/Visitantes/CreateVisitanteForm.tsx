import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/services/api/client';
import { visitantesApi } from '@/services/api/visitantesApi';

export function CreateVisitanteForm() {
  const queryClient = useQueryClient();
  const [nomeVisitante, setNomeVisitante] = useState('');
  const [rg, setRg] = useState('');
  const [placaVeiculo, setPlacaVeiculo] = useState('');
  const [dataVisita, setDataVisita] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      visitantesApi.create({
        nomeVisitante,
        rg: rg || undefined,
        placaVeiculo: placaVeiculo || undefined,
        dataVisita: new Date(dataVisita).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitantes'] });
      setNomeVisitante('');
      setRg('');
      setPlacaVeiculo('');
      setDataVisita('');
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao registrar visitante.');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <Card title="Novo visitante">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome do visitante"
          required
          value={nomeVisitante}
          onChange={(e) => setNomeVisitante(e.target.value)}
        />
        <Input label="RG (opcional)" value={rg} onChange={(e) => setRg(e.target.value)} />
        <Input
          label="Placa do veículo (opcional)"
          value={placaVeiculo}
          onChange={(e) => setPlacaVeiculo(e.target.value)}
        />
        <Input
          label="Data e hora da visita"
          type="datetime-local"
          required
          value={dataVisita}
          onChange={(e) => setDataVisita(e.target.value)}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" loading={mutation.isPending} className="self-start">
          Registrar visitante
        </Button>
      </form>
    </Card>
  );
}
