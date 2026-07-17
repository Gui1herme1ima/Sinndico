import { useQuery } from '@tanstack/react-query';

import { AreaComumCard } from '@/components/AreasComuns/AreaComumCard';
import { CreateAreaComumForm } from '@/components/AreasComuns/CreateAreaComumForm';
import { ReservaCard } from '@/components/AreasComuns/ReservaCard';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { areasComunsApi } from '@/services/api/areasComunsApi';
import { reservasApi } from '@/services/api/reservasApi';
import { useAuth } from '@/store/useAuth';

export function AreasComunsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isMorador = user?.role === 'morador';

  const areasQuery = useQuery({
    queryKey: ['areas-comuns'],
    queryFn: () => areasComunsApi.list(),
  });
  const reservasQuery = useQuery({
    queryKey: ['reservas'],
    queryFn: () => reservasApi.list(),
  });

  const areaNomePorId = new Map((areasQuery.data ?? []).map((area) => [area.id, area.nome]));

  return (
    <div className="flex flex-col gap-6">
      {isAdmin && <CreateAreaComumForm />}

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">Áreas comuns</h2>

        {areasQuery.isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {areasQuery.isError && (
          <Card>
            <p className="text-danger">Não foi possível carregar as áreas comuns.</p>
          </Card>
        )}

        {!areasQuery.isLoading && !areasQuery.isError && areasQuery.data?.length === 0 && (
          <Card>
            <p className="text-text-secondary">Nenhuma área comum cadastrada ainda.</p>
          </Card>
        )}

        {areasQuery.data?.map((area) => (
          <AreaComumCard key={area.id} area={area} isAdmin={isAdmin} isMorador={isMorador} />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          {isMorador ? 'Minhas reservas' : 'Reservas'}
        </h2>

        {reservasQuery.isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {reservasQuery.isError && (
          <Card>
            <p className="text-danger">Não foi possível carregar as reservas.</p>
          </Card>
        )}

        {!reservasQuery.isLoading && !reservasQuery.isError && reservasQuery.data?.length === 0 && (
          <Card>
            <p className="text-text-secondary">Nenhuma reserva por aqui ainda.</p>
          </Card>
        )}

        {reservasQuery.data?.map((reserva) => (
          <ReservaCard
            key={reserva.id}
            reserva={reserva}
            areaNome={areaNomePorId.get(reserva.areaComumId) ?? 'Área removida'}
            isOwner={reserva.moradorId === user?.id}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  );
}
