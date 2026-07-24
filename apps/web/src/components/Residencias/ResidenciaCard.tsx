import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { residenciasApi } from '@/services/api/residenciasApi';
import type { ResidenciaResponse } from '@/services/api/types';

export interface ResidenciaCardProps {
  residencia: ResidenciaResponse;
}

export function ResidenciaCard({ residencia }: ResidenciaCardProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [numero, setNumero] = useState(residencia.numero);

  const mutation = useMutation({
    mutationFn: () => residenciasApi.update(residencia.id, { setorId: residencia.setorId, numero }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residencias', residencia.setorId] });
      setEditing(false);
    },
  });

  function handleCancel() {
    setNumero(residencia.numero);
    setEditing(false);
  }

  return (
    <Card>
      {editing ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input label="Número" className="flex-1" value={numero} onChange={(e) => setNumero(e.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" loading={mutation.isPending} onClick={() => mutation.mutate()}>
              Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} disabled={mutation.isPending}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <Link
            to={`/residencias/${residencia.setorId}/${residencia.id}`}
            className="font-display text-lg font-semibold text-text-primary hover:text-primary"
          >
            {residencia.numero}
            {residencia.moradoresCount !== undefined && (
              <span className="ml-2 text-sm font-normal text-text-secondary">
                {residencia.moradoresCount} morador(es)
              </span>
            )}
          </Link>
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            Editar
          </Button>
        </div>
      )}

      {mutation.isError && (
        <p className="mt-2 text-sm text-danger">Não foi possível salvar. Tente de novo.</p>
      )}
    </Card>
  );
}
