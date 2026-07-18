import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ApiError } from '@/services/api/client';
import { usersApi } from '@/services/api/usersApi';
import type { ResidenciaResponse } from '@/services/api/types';

function labelResidencia(residencia: ResidenciaResponse): string {
  return residencia.bloco
    ? `Bloco ${residencia.bloco} — ${residencia.numero}`
    : `${residencia.rua}, ${residencia.numero}`;
}

export interface CreateMoradorFormProps {
  residencias: ResidenciaResponse[];
}

export function CreateMoradorForm({ residencias }: CreateMoradorFormProps) {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [residenciaId, setResidenciaId] = useState(residencias[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);
  const [senhaGerada, setSenhaGerada] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      usersApi.createMorador({
        role: 'morador',
        nome,
        email,
        residenciaId,
        telefone: telefone || undefined,
      }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['moradores'] });
      setSenhaGerada(response.senhaTemporaria);
      setNome('');
      setEmail('');
      setTelefone('');
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao cadastrar morador.');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  if (residencias.length === 0) {
    return (
      <Card title="Novo morador">
        <p className="text-sm text-text-secondary">
          Cadastre ao menos uma residência antes de poder vincular um morador a ela.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Novo morador">
      {senhaGerada && (
        <div className="mb-4 flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/10 p-4">
          <p className="text-sm text-text-primary">
            Senha temporária (mostrada só uma vez, um e-mail de boas-vindas também foi enviado):{' '}
            <span className="font-mono font-semibold">{senhaGerada}</span>
          </p>
          <Button size="sm" variant="ghost" className="self-start" onClick={() => setSenhaGerada(null)}>
            Fechar
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
          <Input
            label="E-mail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Residência"
            value={residenciaId}
            onChange={(e) => setResidenciaId(e.target.value)}
            options={residencias.map((r) => ({ value: r.id, label: labelResidencia(r) }))}
          />
          <Input label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" loading={mutation.isPending} className="self-start">
          Cadastrar
        </Button>
      </form>
    </Card>
  );
}
