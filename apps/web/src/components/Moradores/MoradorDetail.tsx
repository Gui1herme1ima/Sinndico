import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatResidencia } from '@/components/ui/MoradorSelect';
import { Select } from '@/components/ui/Select';
import type { MoradorResponse, ResidenciaResponse } from '@/services/api/types';

function labelResidencia(residencia: ResidenciaResponse): string {
  return `${residencia.setorNome} — ${residencia.numero}`;
}

export interface MoradorDetailPayload {
  nome: string;
  telefone?: string;
  residenciaId: string;
}

export interface MoradorDetailProps {
  morador: MoradorResponse;
  residencias: ResidenciaResponse[];
  pending: boolean;
  hasError: boolean;
  onSave: (payload: MoradorDetailPayload) => void;
}

export function MoradorDetail({ morador, residencias, pending, hasError, onSave }: MoradorDetailProps) {
  const [nome, setNome] = useState(morador.nome);
  const [telefone, setTelefone] = useState(morador.telefone ?? '');
  const residenciaAtual = residencias.find(
    (r) => r.setorNome === morador.residencia?.setorNome && r.numero === morador.residencia?.numero,
  );
  const [residenciaId, setResidenciaId] = useState(residenciaAtual?.id ?? residencias[0]?.id ?? '');

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-text-secondary">
        <p>{morador.email}</p>
        <p className="font-mono text-xs text-text-muted">{formatResidencia(morador.residencia)}</p>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Input label="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        <Select
          label="Residência"
          value={residenciaId}
          onChange={(e) => setResidenciaId(e.target.value)}
          options={residencias.map((r) => ({ value: r.id, label: labelResidencia(r) }))}
        />

        {hasError && <p className="text-sm text-danger">Não foi possível salvar. Tente de novo.</p>}

        <Button size="sm" loading={pending} onClick={() => onSave({ nome, telefone: telefone || undefined, residenciaId })}>
          Salvar
        </Button>
      </div>
    </div>
  );
}
