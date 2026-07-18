import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ApiError } from '@/services/api/client';
import { usersApi } from '@/services/api/usersApi';

export function CreateStaffUserForm() {
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

  return (
    <Card title="Novo administrador ou porteiro">
      {senhaGerada && (
        <div className="mb-4 flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/10 p-4">
          <p className="text-sm text-text-primary">
            Senha temporária (mostrada só uma vez, repasse à pessoa):{' '}
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
          <Select
            label="Papel"
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'porteiro')}
            options={[
              { value: 'porteiro', label: 'Porteiro' },
              { value: 'admin', label: 'Administrador' },
            ]}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" loading={mutation.isPending} className="self-start">
          Cadastrar
        </Button>
      </form>
    </Card>
  );
}
