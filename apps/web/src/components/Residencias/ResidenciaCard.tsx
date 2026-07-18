import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { residenciasApi } from '@/services/api/residenciasApi';
import type { ResidenciaResponse, TipoResidencia } from '@/services/api/types';

export interface ResidenciaCardProps {
  residencia: ResidenciaResponse;
  tipoResidencia: TipoResidencia;
}

export function ResidenciaCard({ residencia, tipoResidencia }: ResidenciaCardProps) {
  const queryClient = useQueryClient();
  const ehApartamento = tipoResidencia === 'apartamento';
  const [editing, setEditing] = useState(false);
  const [blocoOuRua, setBlocoOuRua] = useState(
    (ehApartamento ? residencia.bloco : residencia.rua) ?? ''
  );
  const [numero, setNumero] = useState(residencia.numero);

  const mutation = useMutation({
    mutationFn: () =>
      residenciasApi.update(
        residencia.id,
        ehApartamento ? { bloco: blocoOuRua, numero } : { rua: blocoOuRua, numero }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residencias'] });
      setEditing(false);
    },
  });

  function handleCancel() {
    setBlocoOuRua((ehApartamento ? residencia.bloco : residencia.rua) ?? '');
    setNumero(residencia.numero);
    setEditing(false);
  }

  return (
    <Card>
      {editing ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label={ehApartamento ? 'Bloco' : 'Rua'}
            className="flex-1"
            value={blocoOuRua}
            onChange={(e) => setBlocoOuRua(e.target.value)}
          />
          <Input
            label={ehApartamento ? 'Número do apartamento' : 'Número da casa'}
            className="flex-1"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
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
          <h3 className="font-display text-lg font-semibold text-text-primary">
            {ehApartamento ? `Bloco ${residencia.bloco} — ` : `${residencia.rua}, `}
            {residencia.numero}
          </h3>
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
