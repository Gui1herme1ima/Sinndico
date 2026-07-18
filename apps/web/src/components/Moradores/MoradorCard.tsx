import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { usersApi } from '@/services/api/usersApi';
import type { MoradorResponse, ResidenciaResponse } from '@/services/api/types';

function labelResidencia(residencia: ResidenciaResponse): string {
  return residencia.bloco
    ? `Bloco ${residencia.bloco} — ${residencia.numero}`
    : `${residencia.rua}, ${residencia.numero}`;
}

export interface MoradorCardProps {
  morador: MoradorResponse;
  residencias: ResidenciaResponse[];
}

export function MoradorCard({ morador, residencias }: MoradorCardProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(morador.nome);
  const [telefone, setTelefone] = useState(morador.telefone ?? '');
  const residenciaAtual = residencias.find(
    (r) => r.bloco === morador.residencia?.bloco && r.rua === morador.residencia?.rua && r.numero === morador.residencia?.numero,
  );
  const [residenciaId, setResidenciaId] = useState(residenciaAtual?.id ?? residencias[0]?.id ?? '');

  const mutation = useMutation({
    mutationFn: () => usersApi.updateMorador(morador.id, { nome, telefone: telefone || undefined, residenciaId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moradores'] });
      setEditing(false);
    },
  });

  function handleCancel() {
    setNome(morador.nome);
    setTelefone(morador.telefone ?? '');
    setResidenciaId(residenciaAtual?.id ?? residencias[0]?.id ?? '');
    setEditing(false);
  }

  return (
    <Card>
      {editing ? (
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <Input label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            <Select
              label="Residência"
              value={residenciaId}
              onChange={(e) => setResidenciaId(e.target.value)}
              options={residencias.map((r) => ({ value: r.id, label: labelResidencia(r) }))}
            />
          </div>
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
          <div>
            <h3 className="font-display text-lg font-semibold text-text-primary">{morador.nome}</h3>
            <p className="text-sm text-text-secondary">
              {morador.residencia
                ? morador.residencia.bloco
                  ? `Bloco ${morador.residencia.bloco} — ${morador.residencia.numero}`
                  : `${morador.residencia.rua}, ${morador.residencia.numero}`
                : 'Sem residência'}
              {' · '}
              {morador.email}
              {morador.telefone && ` · ${morador.telefone}`}
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            Editar
          </Button>
        </div>
      )}

      {mutation.isError && <p className="mt-2 text-sm text-danger">Não foi possível salvar. Tente de novo.</p>}
    </Card>
  );
}
