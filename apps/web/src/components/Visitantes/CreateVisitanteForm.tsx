import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MoradorSelect } from '@/components/ui/MoradorSelect';
import { ApiError } from '@/services/api/client';
import { visitantesApi } from '@/services/api/visitantesApi';

export interface CreateVisitanteFormProps {
  isMorador: boolean;
  onSuccess?: () => void;
}

export function CreateVisitanteForm({ isMorador, onSuccess }: CreateVisitanteFormProps) {
  const queryClient = useQueryClient();
  const [moradorId, setMoradorId] = useState('');
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
        moradorId: isMorador ? undefined : moradorId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitantes'] });
      setMoradorId('');
      setNomeVisitante('');
      setRg('');
      setPlacaVeiculo('');
      setDataVisita('');
      setError(null);
      onSuccess?.();
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {!isMorador && (
        <MoradorSelect label="Morador" required value={moradorId} onChange={setMoradorId} />
      )}
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
      <Button type="submit" loading={mutation.isPending} disabled={!isMorador && !moradorId} className="w-full">
        Registrar visitante
      </Button>
    </form>
  );
}
