import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/formatDate';
import { impersonation } from '@/services/impersonation';
import { condominiosApi } from '@/services/api/condominiosApi';
import type { CondominioResponse } from '@/services/api/types';
import { useAuth } from '@/store/useAuth';

export interface CondominioCardProps {
  condominio: CondominioResponse;
}

export function CondominioCard({ condominio }: CondominioCardProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(condominio.nome);

  const mutation = useMutation({
    mutationFn: () => condominiosApi.update(condominio.id, { nome }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condominios'] });
      setEditing(false);
    },
  });

  async function entrarComoAdmin() {
    impersonation.set(condominio.id, condominio.nome);
    await refreshUser();
    navigate('/dashboard');
  }

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
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                Editar
              </Button>
              <Button size="sm" onClick={() => void entrarComoAdmin()}>
                Entrar como admin
              </Button>
            </div>
          </div>
        )}

        <p className="font-mono text-xs text-text-secondary">/{condominio.slug}/login</p>
        <p className="font-mono text-xs text-text-secondary">{condominio.id}</p>

        <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
          <span>{condominio.tipoResidencia === 'apartamento' ? 'Apartamento' : 'Casa'}</span>
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
