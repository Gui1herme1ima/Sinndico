import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { MoradorSelect } from '@/components/ui/MoradorSelect';
import { comidaApi } from '@/services/api/comidaApi';
import { ApiError } from '@/services/api/client';

export interface CreateComidaFormProps {
  isMorador: boolean;
}

export function CreateComidaForm({ isMorador }: CreateComidaFormProps) {
  const queryClient = useQueryClient();
  const [moradorId, setMoradorId] = useState('');
  const [restaurante, setRestaurante] = useState('');
  const [horarioChegadaEstimada, setHorarioChegadaEstimada] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      comidaApi.create({
        restaurante,
        horarioChegadaEstimada: new Date(horarioChegadaEstimada).toISOString(),
        moradorId: isMorador ? undefined : moradorId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comida'] });
      setMoradorId('');
      setRestaurante('');
      setHorarioChegadaEstimada('');
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao avisar o pedido.');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <Card title="Avisar pedido">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!isMorador && (
          <MoradorSelect label="Morador" required value={moradorId} onChange={setMoradorId} />
        )}
        <Input
          label="Restaurante"
          required
          value={restaurante}
          onChange={(e) => setRestaurante(e.target.value)}
        />
        <Input
          label="Horário estimado de chegada"
          type="datetime-local"
          required
          value={horarioChegadaEstimada}
          onChange={(e) => setHorarioChegadaEstimada(e.target.value)}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button
          type="submit"
          loading={mutation.isPending}
          disabled={!isMorador && !moradorId}
          className="self-start"
        >
          Avisar portaria
        </Button>
      </form>
    </Card>
  );
}
