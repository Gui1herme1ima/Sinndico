import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { XIcon } from '@/components/ui/icons';
import { usersApi } from '@/services/api/usersApi';
import type { MoradorResponse, ResidenciaResponse } from '@/services/api/types';

function labelResidencia(residencia: ResidenciaResponse): string {
  return residencia.bloco
    ? `Bloco ${residencia.bloco} — ${residencia.numero}`
    : `${residencia.rua}, ${residencia.numero}`;
}

export interface EditarMoradorModalProps {
  morador: MoradorResponse;
  residencias: ResidenciaResponse[];
  onClose: () => void;
}

export function EditarMoradorModal({ morador, residencias, onClose }: EditarMoradorModalProps) {
  const queryClient = useQueryClient();
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
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/40 p-4">
      <Card className="w-full max-w-md" padding="default">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-text-primary">Editar morador</h3>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-text-secondary hover:text-text-primary">
            <XIcon width={18} height={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Input label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          <Select
            label="Residência"
            value={residenciaId}
            onChange={(e) => setResidenciaId(e.target.value)}
            options={residencias.map((r) => ({ value: r.id, label: labelResidencia(r) }))}
          />

          {mutation.isError && <p className="text-sm text-danger">Não foi possível salvar. Tente de novo.</p>}

          <div className="mt-1 flex gap-2">
            <Button size="sm" loading={mutation.isPending} onClick={() => mutation.mutate()}>
              Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} disabled={mutation.isPending}>
              Cancelar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
