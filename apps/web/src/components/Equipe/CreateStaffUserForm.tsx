import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ApiError } from '@/services/api/client';
import { usersApi } from '@/services/api/usersApi';

export interface CreateStaffUserFormProps {
  onSuccess?: () => void;
}

export function CreateStaffUserForm({ onSuccess }: CreateStaffUserFormProps) {
  const queryClient = useQueryClient();
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'porteiro'>('porteiro');
  const [error, setError] = useState<string | null>(null);
  const [senhaGerada, setSenhaGerada] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      usersApi.createStaffUser({
        role,
        nome,
        username,
        email: email || undefined,
      }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['equipe'] });
      setSenhaGerada(response.senhaTemporaria);
      setNome('');
      setUsername('');
      setEmail('');
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao cadastrar usuário.');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  if (senhaGerada) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-text-primary">
          Senha temporária (mostrada só uma vez, repasse à pessoa):{' '}
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
      <Select
        label="Papel"
        value={role}
        onChange={(e) => setRole(e.target.value as 'admin' | 'porteiro')}
        options={[
          { value: 'porteiro', label: 'Porteiro' },
          { value: 'admin', label: 'Administrador' },
        ]}
      />
      <Input
        label="Usuário"
        required
        placeholder="joao.silva"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input
        label="E-mail (opcional)"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        helperText="Sem e-mail, a senha é mostrada aqui pra você repassar."
      />

      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" loading={mutation.isPending} className="w-full">
        Cadastrar
      </Button>
    </form>
  );
}
