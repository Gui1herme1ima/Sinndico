import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ApiError } from '@/services/api/client';
import { usersApi } from '@/services/api/usersApi';
import type { ResidenciaResponse } from '@/services/api/types';

function labelResidencia(residencia: ResidenciaResponse): string {
  return `${residencia.setorNome} — ${residencia.numero}`;
}

export interface CreateMoradorFormProps {
  residencias: ResidenciaResponse[];
  /** Fixa a residência (ex.: chamado a partir da aba Moradores do detalhe de uma residência) e
   * omite o Select — o admin escolhe livremente só quando isso não é passado. */
  residenciaId?: string;
  onSuccess?: () => void;
}

export function CreateMoradorForm({ residencias, residenciaId: residenciaIdFixa, onSuccess }: CreateMoradorFormProps) {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [residenciaId, setResidenciaId] = useState(residenciaIdFixa ?? residencias[0]?.id ?? '');
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
      queryClient.invalidateQueries({ queryKey: ['residencia-detalhe', residenciaId] });
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

  if (!residenciaIdFixa && residencias.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        Cadastre ao menos uma residência antes de poder vincular um morador a ela.
      </p>
    );
  }

  if (senhaGerada) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-text-primary">
          Senha temporária (mostrada só uma vez, um e-mail de boas-vindas também foi enviado):{' '}
          <span className="font-mono font-semibold">{senhaGerada}</span>
        </p>
        <Button
          className="self-start"
          onClick={() => {
            setSenhaGerada(null);
            onSuccess?.();
          }}
        >
          Fechar
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
      <Input label="E-mail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      {!residenciaIdFixa && (
        <Select
          label="Residência"
          value={residenciaId}
          onChange={(e) => setResidenciaId(e.target.value)}
          options={residencias.map((r) => ({ value: r.id, label: labelResidencia(r) }))}
        />
      )}
      <Input label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />

      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" loading={mutation.isPending} className="w-full">
        Cadastrar
      </Button>
    </form>
  );
}
