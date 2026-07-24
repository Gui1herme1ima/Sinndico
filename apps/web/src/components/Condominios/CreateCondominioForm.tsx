import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ApiError } from '@/services/api/client';
import { condominiosApi } from '@/services/api/condominiosApi';
import type { CreateCondominioResponse, TipoResidencia } from '@/services/api/types';

const CAMPOS_INICIAIS = {
  nome: '',
  slug: '',
  tipoResidencia: 'apartamento' as TipoResidencia,
  endereco: '',
  contatoNome: '',
  contatoEmail: '',
  contatoTelefone: '',
  adminNome: '',
  adminUsername: '',
  adminEmail: '',
};

export interface CreateCondominioFormProps {
  onSuccess?: () => void;
}

export function CreateCondominioForm({ onSuccess }: CreateCondominioFormProps) {
  const queryClient = useQueryClient();
  const [campos, setCampos] = useState(CAMPOS_INICIAIS);
  const [error, setError] = useState<string | null>(null);
  const [criado, setCriado] = useState<CreateCondominioResponse | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      condominiosApi.create({
        nome: campos.nome,
        slug: campos.slug,
        tipoResidencia: campos.tipoResidencia,
        endereco: campos.endereco || undefined,
        contatoNome: campos.contatoNome || undefined,
        contatoEmail: campos.contatoEmail || undefined,
        contatoTelefone: campos.contatoTelefone || undefined,
        adminNome: campos.adminNome,
        adminUsername: campos.adminUsername,
        adminEmail: campos.adminEmail || undefined,
      }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['condominios'] });
      setCriado(response);
      setCampos(CAMPOS_INICIAIS);
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao criar condomínio.');
    },
  });

  function set<K extends keyof typeof campos>(campo: K, valor: (typeof campos)[K]) {
    setCampos((atual) => ({ ...atual, [campo]: valor }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  if (criado) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-text-primary">
          Condomínio <strong>{criado.nome}</strong> criado. Acesso:{' '}
          <span className="font-mono">/{criado.slug}/login</span>
        </p>
        <p className="text-sm text-text-primary">
          Usuário do admin: <span className="font-mono">{criado.admin.username}</span>
        </p>
        <p className="text-sm text-text-primary">
          Senha temporária (mostrada só uma vez, repasse ao admin):{' '}
          <span className="font-mono font-semibold">{criado.admin.senhaTemporaria}</span>
        </p>
        {criado.admin.email && (
          <p className="text-sm text-text-secondary">
            Um e-mail de boas-vindas também foi enviado para {criado.admin.email}.
          </p>
        )}
        <Button
          className="self-start"
          onClick={() => {
            setCriado(null);
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
      <Input label="Nome" required value={campos.nome} onChange={(e) => set('nome', e.target.value)} />
      <Input
        label="Identificador de URL (slug)"
        required
        placeholder="condominio-vale-verde"
        value={campos.slug}
        onChange={(e) => set('slug', e.target.value)}
        helperText="Vira sinndico.com.br/<slug>"
      />
      <Select
        label="Tipo de residência"
        value={campos.tipoResidencia}
        onChange={(e) => set('tipoResidencia', e.target.value as TipoResidencia)}
        options={[
          { value: 'apartamento', label: 'Apartamento (blocos)' },
          { value: 'casa', label: 'Casa (ruas)' },
        ]}
      />
      <Input label="Endereço" value={campos.endereco} onChange={(e) => set('endereco', e.target.value)} />
      <Input
        label="Contato — nome"
        value={campos.contatoNome}
        onChange={(e) => set('contatoNome', e.target.value)}
      />
      <Input
        label="Contato — e-mail"
        type="email"
        value={campos.contatoEmail}
        onChange={(e) => set('contatoEmail', e.target.value)}
      />
      <Input
        label="Contato — telefone"
        value={campos.contatoTelefone}
        onChange={(e) => set('contatoTelefone', e.target.value)}
      />

      <div className="flex flex-col gap-4 border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-text-primary">Primeiro administrador</h3>
        <Input
          label="Nome"
          required
          value={campos.adminNome}
          onChange={(e) => set('adminNome', e.target.value)}
        />
        <Input
          label="Usuário"
          required
          placeholder="joao.silva"
          value={campos.adminUsername}
          onChange={(e) => set('adminUsername', e.target.value)}
        />
        <Input
          label="E-mail (opcional)"
          type="email"
          value={campos.adminEmail}
          onChange={(e) => set('adminEmail', e.target.value)}
          helperText="Sem e-mail, a senha é mostrada aqui pra você repassar."
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" loading={mutation.isPending} className="w-full">
        Criar condomínio
      </Button>
    </form>
  );
}
