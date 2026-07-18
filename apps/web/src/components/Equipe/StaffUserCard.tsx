import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { usersApi } from '@/services/api/usersApi';
import type { StaffUserResponse } from '@/services/api/types';

export interface StaffUserCardProps {
  usuario: StaffUserResponse;
}

export function StaffUserCard({ usuario }: StaffUserCardProps) {
  const [senhaGerada, setSenhaGerada] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => usersApi.resetSenha(usuario.id),
    onSuccess: (response) => {
      setSenhaGerada(response.senhaTemporaria);
    },
  });

  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold text-text-primary">{usuario.nome}</h3>
            <Badge status={usuario.role}>{usuario.role === 'admin' ? 'Administrador' : 'Porteiro'}</Badge>
          </div>
          <p className="text-sm text-text-secondary">
            <span className="font-mono">{usuario.username}</span>
            {' · '}
            {usuario.email ?? 'sem e-mail'}
          </p>
        </div>
        <Button size="sm" variant="ghost" loading={mutation.isPending} onClick={() => mutation.mutate()}>
          Redefinir senha
        </Button>
      </div>

      {senhaGerada && (
        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/10 p-4">
          <p className="text-sm text-text-primary">
            Nova senha temporária (mostrada só uma vez):{' '}
            <span className="font-mono font-semibold">{senhaGerada}</span>
          </p>
          <Button size="sm" variant="ghost" className="self-start" onClick={() => setSenhaGerada(null)}>
            Fechar
          </Button>
        </div>
      )}

      {mutation.isError && (
        <p className="mt-2 text-sm text-danger">Não foi possível redefinir a senha. Tente de novo.</p>
      )}
    </Card>
  );
}
