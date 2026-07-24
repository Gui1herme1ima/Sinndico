import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import { CreateMoradorForm } from '@/components/Moradores/CreateMoradorForm';
import { STATUS_LABELS as ENCOMENDA_STATUS_LABELS } from '@/components/Encomendas/encomendaLabels';
import { PlaceholderTab } from '@/components/Residencias/PlaceholderTab';
import {
  CATEGORIA_LABELS,
  STATUS_LABELS as SOLICITACAO_STATUS_LABELS,
} from '@/components/Solicitacoes/solicitacaoLabels';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Drawer } from '@/components/ui/Drawer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs } from '@/components/ui/Tabs';
import { ChevronRightIcon, EncomendaIcon, PlusIcon, SolicitacaoManutencaoIcon, UserIcon, VisitanteIcon } from '@/components/ui/icons';
import { formatDate } from '@/lib/formatDate';
import { residenciasApi } from '@/services/api/residenciasApi';

type TabKey = 'moradores' | 'visitantes' | 'encomendas' | 'solicitacoes' | 'financeiro' | 'veiculos';

export function ResidenciaDetalhePage() {
  const { setorId, residenciaId } = useParams<{ setorId: string; residenciaId: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>('moradores');
  const [createMoradorOpen, setCreateMoradorOpen] = useState(false);

  const detalheQuery = useQuery({
    queryKey: ['residencia-detalhe', residenciaId],
    queryFn: () => residenciasApi.getDetalhe(residenciaId!),
    enabled: Boolean(residenciaId),
  });

  if (detalheQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (detalheQuery.isError || !detalheQuery.data) {
    return (
      <Card>
        <p className="text-danger">Não foi possível carregar os dados da residência.</p>
      </Card>
    );
  }

  const { residencia, moradores, visitantes, encomendas, solicitacoes } = detalheQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          to={`/residencias/${setorId}`}
          className="flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-primary"
        >
          <ChevronRightIcon width={14} height={14} className="rotate-180" />
          {residencia.setorNome}
        </Link>

        <PageHeader title={`${residencia.setorNome} — ${residencia.numero}`} />

        <Card padding="none">
          <Tabs
            tabs={[
              { key: 'moradores', label: 'Moradores', icon: <UserIcon width={16} height={16} />, badge: moradores.length },
              { key: 'visitantes', label: 'Visitantes', icon: <VisitanteIcon width={16} height={16} />, badge: visitantes.length },
              { key: 'encomendas', label: 'Encomendas', icon: <EncomendaIcon width={16} height={16} />, badge: encomendas.length },
              {
                key: 'solicitacoes',
                label: 'Solicitações',
                icon: <SolicitacaoManutencaoIcon width={16} height={16} />,
                badge: solicitacoes.length,
              },
              { key: 'financeiro', label: 'Financeiro', disabled: true },
              { key: 'veiculos', label: 'Veículos', disabled: true },
            ]}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as TabKey)}
          />

          <div className="p-5 md:p-8">
            {activeTab === 'moradores' && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => setCreateMoradorOpen(true)}>
                    <PlusIcon width={14} height={14} />
                    Cadastrar morador
                  </Button>
                </div>
                {moradores.length === 0 ? (
                  <p className="text-sm text-text-secondary">Nenhum morador vinculado ainda.</p>
                ) : (
                  <ul className="flex flex-col divide-y divide-border">
                    {moradores.map((morador) => (
                      <li key={morador.id} className="flex flex-col gap-0.5 py-3">
                        <p className="font-medium text-text-primary">{morador.nome}</p>
                        <p className="text-sm text-text-secondary">{morador.email}</p>
                        {morador.telefone && <p className="text-xs text-text-muted">{morador.telefone}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === 'visitantes' &&
              (visitantes.length === 0 ? (
                <p className="text-sm text-text-secondary">Nenhum visitante registrado ainda.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {visitantes.map((visitante) => (
                    <li key={visitante.id} className="flex items-center justify-between gap-4 py-3">
                      <div>
                        <p className="font-medium text-text-primary">{visitante.nomeVisitante}</p>
                        <p className="text-xs text-text-muted">{formatDate(visitante.dataVisita)}</p>
                      </div>
                      <Badge status={visitante.status}>{visitante.status}</Badge>
                    </li>
                  ))}
                </ul>
              ))}

            {activeTab === 'encomendas' &&
              (encomendas.length === 0 ? (
                <p className="text-sm text-text-secondary">Nenhuma encomenda registrada ainda.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {encomendas.map((encomenda) => (
                    <li key={encomenda.id} className="flex items-center justify-between gap-4 py-3">
                      <div>
                        <p className="font-medium text-text-primary">{encomenda.descricao ?? 'Sem descrição'}</p>
                        <p className="text-xs text-text-muted">{formatDate(encomenda.horarioChegada)}</p>
                      </div>
                      <Badge status={encomenda.status}>{ENCOMENDA_STATUS_LABELS[encomenda.status]}</Badge>
                    </li>
                  ))}
                </ul>
              ))}

            {activeTab === 'solicitacoes' &&
              (solicitacoes.length === 0 ? (
                <p className="text-sm text-text-secondary">Nenhuma solicitação aberta ainda.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {solicitacoes.map((solicitacao) => (
                    <li key={solicitacao.id} className="flex items-center justify-between gap-4 py-3">
                      <div>
                        <p className="font-medium text-text-primary">{solicitacao.titulo}</p>
                        <p className="text-xs text-text-muted">
                          {CATEGORIA_LABELS[solicitacao.categoria]} — {formatDate(solicitacao.dataCriacao)}
                        </p>
                      </div>
                      <Badge status={solicitacao.status}>{SOLICITACAO_STATUS_LABELS[solicitacao.status]}</Badge>
                    </li>
                  ))}
                </ul>
              ))}

            {activeTab === 'financeiro' && (
              <PlaceholderTab
                titulo="Financeiro"
                mensagem="Em breve — módulo Financeiro ainda não implementado (fatia 4.11)."
              />
            )}

            {activeTab === 'veiculos' && (
              <PlaceholderTab
                titulo="Veículos"
                mensagem="Em breve — módulo de Veículos ainda não implementado (fatia 4.17)."
              />
            )}
          </div>
        </Card>
      </div>

      <Drawer open={createMoradorOpen} onClose={() => setCreateMoradorOpen(false)} title="Novo morador">
        <CreateMoradorForm
          residencias={[]}
          residenciaId={residenciaId}
          onSuccess={() => setCreateMoradorOpen(false)}
        />
      </Drawer>
    </div>
  );
}
