import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { areasComunsApi } from '@/services/api/areasComunsApi';
import { ApiError } from '@/services/api/client';
import { reservasApi } from '@/services/api/reservasApi';
import type { AreaComumResponse } from '@/services/api/types';

export interface AreaComumCardProps {
  area: AreaComumResponse;
  isAdmin: boolean;
  isMorador: boolean;
}

export function AreaComumCard({ area, isAdmin, isMorador }: AreaComumCardProps) {
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(area.nome);
  const [horarioFuncionamento, setHorarioFuncionamento] = useState(area.horarioFuncionamento ?? '');
  const [descricao, setDescricao] = useState(area.descricao ?? '');

  const updateMutation = useMutation({
    mutationFn: () =>
      areasComunsApi.update(area.id, {
        nome,
        horarioFuncionamento: horarioFuncionamento || undefined,
        descricao: descricao || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas-comuns'] });
      setEditing(false);
    },
  });

  function handleCancelEdit() {
    setNome(area.nome);
    setHorarioFuncionamento(area.horarioFuncionamento ?? '');
    setDescricao(area.descricao ?? '');
    setEditing(false);
  }

  const [reservando, setReservando] = useState(false);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [reservaError, setReservaError] = useState<string | null>(null);

  const reservaMutation = useMutation({
    mutationFn: () =>
      reservasApi.create({
        areaComumId: area.id,
        horaInicio: new Date(horaInicio).toISOString(),
        horaFim: new Date(horaFim).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      setHoraInicio('');
      setHoraFim('');
      setReservando(false);
      setReservaError(null);
    },
    onError: (err) => {
      setReservaError(err instanceof ApiError ? err.message : 'Erro inesperado ao solicitar reserva.');
    },
  });

  return (
    <Card>
      <div className="flex flex-col gap-3">
        {editing ? (
          <div className="flex flex-col gap-3">
            <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <Input
              label="Horário de funcionamento"
              value={horarioFuncionamento}
              onChange={(e) => setHorarioFuncionamento(e.target.value)}
            />
            <Input label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" loading={updateMutation.isPending} onClick={() => updateMutation.mutate()}>
                Salvar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelEdit}
                disabled={updateMutation.isPending}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-text-primary">{area.nome}</h3>
              {area.horarioFuncionamento && (
                <p className="font-mono text-xs text-text-secondary">{area.horarioFuncionamento}</p>
              )}
              {area.descricao && <p className="text-sm text-text-secondary">{area.descricao}</p>}
            </div>
            {isAdmin && (
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                Editar
              </Button>
            )}
          </div>
        )}

        {isMorador && !reservando && (
          <Button size="sm" variant="secondary" className="self-start" onClick={() => setReservando(true)}>
            Solicitar reserva
          </Button>
        )}

        {isMorador && reservando && (
          <div className="flex flex-col gap-3 border-t border-border pt-3">
            <Input
              label="Início"
              type="datetime-local"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
            />
            <Input
              label="Fim"
              type="datetime-local"
              value={horaFim}
              onChange={(e) => setHoraFim(e.target.value)}
            />
            {reservaError && <p className="text-sm text-danger">{reservaError}</p>}
            <div className="flex gap-2">
              <Button size="sm" loading={reservaMutation.isPending} onClick={() => reservaMutation.mutate()}>
                Confirmar solicitação
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setReservando(false);
                  setReservaError(null);
                }}
                disabled={reservaMutation.isPending}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
