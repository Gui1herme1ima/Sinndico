import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ApiError } from '@/services/api/client';
import { encomendasApi } from '@/services/api/encomendasApi';
import { usersApi } from '@/services/api/usersApi';

function labelMorador(morador: { nome: string; residencia: { bloco: string | null; rua: string | null; numero: string | null } | null }) {
  if (!morador.residencia) return morador.nome;
  const { bloco, rua, numero } = morador.residencia;
  const local = bloco ? `Bloco ${bloco} — ${numero}` : `${rua}, ${numero}`;
  return `${morador.nome} — ${local}`;
}

export function CreateEncomendaForm() {
  const queryClient = useQueryClient();
  const [moradorId, setMoradorId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const diretorioQuery = useQuery({
    queryKey: ['moradores-diretorio'],
    queryFn: () => usersApi.listDiretorio(),
  });

  const mutation = useMutation({
    mutationFn: () =>
      encomendasApi.create({
        moradorId,
        descricao: descricao || undefined,
        fotoUrl: fotoUrl || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encomendas'] });
      setMoradorId('');
      setDescricao('');
      setFotoUrl('');
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Erro inesperado ao cadastrar encomenda.');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  const moradores = diretorioQuery.data ?? [];

  return (
    <Card title="Nova encomenda">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {diretorioQuery.isError && (
          <p className="text-sm text-danger">Não foi possível carregar a lista de moradores.</p>
        )}
        <Select
          label="Morador"
          required
          disabled={diretorioQuery.isLoading || moradores.length === 0}
          value={moradorId}
          onChange={(e) => setMoradorId(e.target.value)}
          options={[
            { value: '', label: diretorioQuery.isLoading ? 'Carregando...' : 'Selecione o morador' },
            ...moradores.map((m) => ({ value: m.id, label: labelMorador(m) })),
          ]}
        />
        <Textarea
          label="Descrição (opcional)"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <Input
          label="URL da foto (opcional)"
          type="url"
          value={fotoUrl}
          onChange={(e) => setFotoUrl(e.target.value)}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" loading={mutation.isPending} disabled={!moradorId} className="self-start">
          Cadastrar encomenda
        </Button>
      </form>
    </Card>
  );
}
