import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Toggle } from '@/components/ui/Toggle';
import { condominiosApi } from '@/services/api/condominiosApi';
import type { PermissoesPorteiro } from '@/services/api/types';

const MODULOS: Array<{ key: keyof PermissoesPorteiro; label: string; helperText: string }> = [
  { key: 'encomendas', label: 'Encomendas', helperText: 'Cadastrar e listar encomendas.' },
  { key: 'visitantes', label: 'Visitantes', helperText: 'Registrar entrada/saída de visitantes.' },
  { key: 'comida', label: 'Comida', helperText: 'Ver e atualizar status de pedidos.' },
  { key: 'comunicados', label: 'Comunicados', helperText: 'Ler os comunicados do condomínio.' },
];

export function PermissoesPage() {
  const queryClient = useQueryClient();

  const condominioQuery = useQuery({
    queryKey: ['condominio-atual'],
    queryFn: () => condominiosApi.getMine(),
  });

  const [permissoes, setPermissoes] = useState<PermissoesPorteiro | null>(null);

  useEffect(() => {
    if (condominioQuery.data) {
      setPermissoes(condominioQuery.data.permissoesPorteiro);
    }
  }, [condominioQuery.data]);

  const mutation = useMutation({
    mutationFn: (novasPermissoes: PermissoesPorteiro) => condominiosApi.updatePermissoesPorteiro(novasPermissoes),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['condominio-atual'] });
      setPermissoes(response.permissoesPorteiro);
    },
  });

  function toggle(key: keyof PermissoesPorteiro, checked: boolean) {
    if (!permissoes) return;
    const novasPermissoes = { ...permissoes, [key]: checked };
    setPermissoes(novasPermissoes);
    mutation.mutate(novasPermissoes);
  }

  if (condominioQuery.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (condominioQuery.isError || !permissoes) {
    return (
      <Card>
        <p className="text-danger">Não foi possível carregar as permissões.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card title="Acesso da portaria">
        <p className="mb-2 text-sm text-text-secondary">
          Escolha quais módulos o papel de porteiro pode acessar neste condomínio. Administradores
          nunca são afetados por esses toggles.
        </p>
        <div className="divide-y divide-border">
          {MODULOS.map((modulo) => (
            <Toggle
              key={modulo.key}
              label={modulo.label}
              helperText={modulo.helperText}
              checked={permissoes[modulo.key]}
              disabled={mutation.isPending}
              onChange={(checked) => toggle(modulo.key, checked)}
            />
          ))}
        </div>
        {mutation.isError && <p className="mt-2 text-sm text-danger">Não foi possível salvar. Tente de novo.</p>}
      </Card>
    </div>
  );
}
