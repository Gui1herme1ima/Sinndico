import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/formatDate';
import { condominiosApi } from '@/services/api/condominiosApi';
import type { CondominioResponse } from '@/services/api/types';

export interface CondominioCardProps {
  condominio: CondominioResponse;
}

export function CondominioCard({ condominio }: CondominioCardProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(condominio.nome);

  const mutation = useMutation({
    mutationFn: () => condominiosApi.update(condominio.id, { nome }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condominios'] });
      setEditing(false);
    },
  });

  function handleCancel() {
    setNome(condominio.nome);
    setEditing(false);
  }

  return (
    <Card>
      <div className="flex flex-col gap-3">
        {editing ? (
          <div className="flex items-end gap-2">
            <Input
              label="Nome"
              className="flex-1"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <Button size="sm" loading={mutation.isPending} onClick={() => mutation.mutate()}>
              Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} disabled={mutation.isPending}>
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display text-lg font-semibold text-text-primary">{condominio.nome}</h3>
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              Editar
            </Button>
          </div>
        )}

        <p className="font-mono text-xs text-text-secondary">{condominio.id}</p>

        <div className="flex gap-4 text-sm text-text-secondary">
          <span>
            {condominio.totalUsuarios} usuário{condominio.totalUsuarios === 1 ? '' : 's'}
          </span>
          <span>Criado em {formatDate(condominio.createdAt)}</span>
        </div>

        {mutation.isError && (
          <p className="text-sm text-danger">Não foi possível salvar. Tente de novo.</p>
        )}
      </div>
    </Card>
  );
}
