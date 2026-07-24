import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ApiError } from '@/services/api/client';
import { comunicadosApi } from '@/services/api/comunicadosApi';

export interface CreateComunicadoFormProps {
  onSuccess?: () => void;
}

export function CreateComunicadoForm({ onSuccess }: CreateComunicadoFormProps) {
  const queryClient = useQueryClient();
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => comunicadosApi.create({ titulo, conteudo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comunicados'] });
      setTitulo('');
      setConteudo('');
      setError(null);
      onSuccess?.();
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao publicar comunicado.');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Título" required value={titulo} onChange={(e) => setTitulo(e.target.value)} />
      <Textarea
        label="Conteúdo"
        required
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" loading={mutation.isPending} className="w-full">
        Publicar comunicado
      </Button>
    </form>
  );
}
