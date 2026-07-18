# CLAUDE.md — Sinndico (Plataforma de Gestão Condominial)

> Este arquivo orienta o Claude Code sobre o projeto. Leia por completo antes de qualquer alteração de código.

## 1. O que é o Sinndico

Sinndico é um SaaS de gestão condominial que centraliza a comunicação entre morador, diretoria/síndico e portaria. Substitui WhatsApp, caderno de portaria e planilhas soltas por um sistema único, rastreável e auditável.

**Público-alvo:** síndicos profissionais, administradoras condominiais, condomínios com 20+ unidades.
**Modelo de negócio:** assinatura mensal por condomínio, escalada pelo número de unidades.

## 2. Módulos do sistema (visão funcional)

1. **Solicitações** — morador abre solicitação (manutenção, segurança, animal invasor, outros), admin gerencia status e prioridade.
2. **Encomendas** — porteiro cadastra encomenda (foto + horário), morador é notificado, assinatura digital na retirada.
3. **Comida/Delivery** — morador avisa pedido feito com ETA, portaria recebe pré-aviso, status atualizado até retirada.
4. **Visitantes** — morador aprova visitante (nome, RG, placa), fica salvo no perfil para acessos futuros; porteiro vê histórico completo ao consultar.
5. **Comunicados** — admin publica (tipo mural/blog), morador recebe notificação.
6. **Áreas comuns** — reserva de salão/churrasqueira/etc com calendário e aprovação.
7. **Assembleia e votação** — convocação digital, votação rastreável, ata automática.
8. **Chat morador-admin** — canal direto dentro do sistema.

Detalhe completo de cada módulo, schema de dados e stack: ver `README.md` na raiz do projeto — ele é a fonte de verdade sobre arquitetura, banco de dados e estrutura de pastas. Este CLAUDE.md não repete o schema; consulte o README sempre que precisar de detalhes de modelo de dados ou endpoints.

## 3. Identidade Visual — REGRA OBRIGATÓRIA

O visual é um pilar do produto, não um detalhe secundário. Antes de implementar qualquer tela nova, siga a identidade visual definida no `README.md` (seção 3):

- **Cor primária:** verde-petróleo profundo (`#146C5B`, variante `#2ED9A8` no modo escuro). Não substituir por azul corporativo genérico nem pelos clichês de design gerado por IA (creme+terracota, preto+verde ácido).
- **Modo claro e escuro:** obrigatórios desde a primeira tela construída, via CSS variables/design tokens — nunca implementar um modo primeiro e "adicionar" o outro depois.
- **Tipografia:** Space Grotesk/Sora (display) + Inter/Manrope (corpo) + JetBrains Mono (dados/utilitário).
- **Animações:** fluidas e propositais (transições de página, reveal de cards, feedback tátil em botões, skeleton loading), sempre respeitando `prefers-reduced-motion`. Evitar excesso de efeitos decorativos sem função.
- **Antes de codar qualquer módulo funcional:** garantir que o design system básico (`docs/DESIGN_SYSTEM.md`: cores, tipografia, botão, card, input, badge, toggle de tema) já existe. Se não existir, criar primeiro.
- **Todo componente novo deve ser visualmente testado em ambos os modos (claro/escuro) antes de ser considerado concluído.**
- **Arquivos-fonte do brand kit** (logo/símbolo em SVG, ícones de domínio, `tokens.json` machine-readable) vivem em `brand-assets/` na raiz — complementa `docs/DESIGN_SYSTEM.md` (a especificação escrita). Ainda não integrado ao código do app (`apps/web`) — ver Checkpoint Log Session 16.

Se o usuário não especificar identidade visual em uma tarefa nova, use os tokens acima por padrão — não invente nova paleta sem perguntar.

## 4. Stack (resumo — detalhes no README.md)

- Backend: Node.js + Express/Fastify + TypeScript, PostgreSQL (gerenciado via Supabase) + Redis
- Web admin: React + TypeScript + Tailwind
- Mobile morador: PWA (prioridade) — React Native como evolução futura
- Notificações: Firebase Cloud Messaging
- Auth: Supabase Auth (GoTrue) — JWT verificado no backend via JWKS
- Multi-tenancy: banco único + `condominio_id` + Row Level Security (não banco por cliente) — ver README seção 5. Role `superadmin` gerencia todos os condomínios.
- Hospedagem: Hostinger (app) + Supabase (Postgres + Auth), integração oficial entre as duas

## 5. Ordem de desenvolvimento (fases)

Sempre seguir a ordem abaixo. Não pular fase nem implementar módulo de fase futura antes da atual estar funcional e testada.

- **Fase 1 (MVP):** Auth, Solicitações, Encomendas, Comunicados, Chat básico, Dashboard admin, Notificações push.
- **Fase 2:** Visitantes, Comida/Delivery.
- **Fase 3:** Áreas comuns, Assembleia/votação.
- **Fase 4:** Testes, otimização, deploy produção, documentação.
- **Fase 5+:** Melhorias contínuas (fechadura inteligente, OCR hidrômetro, app nativo, BI, SMS fallback).

## 6. Regras de trabalho para o Claude Code

- **Sempre pergunte o escopo da sessão** se não estiver claro qual módulo/fase está em andamento, antes de escrever código.
- **Nunca implemente funcionalidade fora da fase atual** sem confirmação explícita do usuário.
- **Todo código novo precisa ser consistente com a estrutura de pastas do README.md** (monorepo: apps/backend, apps/web, apps/mobile).
- **Documentação em português** (comentários de código podem ser em inglês, mas docs, commits e comunicação com o usuário em português — plain text, sem formatação markdown pesada quando for pra colar em outro lugar).
- **O sistema está sujeito a mudanças contínuas de escopo.** Correções de bugs e melhorias futuras são esperadas e normais — não trate isso como desvio do plano original.

## 7. Checkpoint de progresso — OBRIGATÓRIO

Ao final de cada sessão de desenvolvimento (ou sempre que o usuário disser "vamos parar por aqui" / fechar o terminal), o Claude Code deve:

1. **Sobrescrever** (não acrescentar) a seção `## 9. Estado atual` deste arquivo com o estado mais recente: em que fatia/fase o projeto está, o que foi concluído na sessão, o próximo passo, decisões técnicas relevantes e bugs conhecidos em aberto. Este bloco deve ficar **curto o bastante pra ler em menos de 1 minuto** — nada de histórico de sessões anteriores aqui.
2. Adicionar o registro detalhado da sessão (mesmo formato de sempre, ver abaixo) no **topo** de `docs/CHECKPOINT_HISTORY.md`. É aí que mora o histórico completo, sessão a sessão — CLAUDE.md nunca acumula esse detalhe.

Ao **iniciar** uma nova sessão, ler primeiro a seção `## 9. Estado atual` (rápido). Só abrir
`docs/CHECKPOINT_HISTORY.md` se precisar entender o raciocínio ou uma decisão técnica de uma sessão
específica mais antiga — não é leitura obrigatória a cada início de sessão.

Formato de cada entrada em `docs/CHECKPOINT_HISTORY.md`:

```
### Session N (Data: DD/MM/AAAA)
**Completado:**
- [x] item 1
- [x] item 2

**Próximo passo:**
- [ ] item 1

**Decisões técnicas / desvios do plano original:**
- (se houver)

**Bugs conhecidos:**
- (se houver)
```

## 8. Fase 4 — Robustez e Expansão

Fase 3 concluída (roadmap funcional inteiro do README implementado). A Fase 4 evolui o Sinndico de
MVP para produto robusto. **Regra de fatiamento:** uma fatia = uma sessão de desenvolvimento;
seguir a ordem numérica; não pular fatia nem antecipar fatia futura sem confirmação explícita do
usuário (vale a mesma regra da seção 6). A fundação de UX (Bloco A) vem **antes** de qualquer módulo
novo — não começar módulo do Bloco C sem o Bloco A estar pronto.

> Nota de numeração: esta "Fase 4 — Robustez e Expansão" substitui, na prática, a antiga "Fase 4:
> Polish + Deployment" do README (seção 6). Testes/otimização/deploy continuam válidos e aparecem
> diluídos nas fatias abaixo (ex.: 4.1 é auditoria de performance).

### Bloco A — Fundação de UX (base pra todo o resto)

- **Fatia 4.1 — Auditoria e correção de performance.** Lazy loading de rotas (code splitting),
  cache/prefetch com a lib de data-fetching atual, eliminar re-renders desnecessários. Medir com
  Lighthouse + React Profiler antes e depois (registrar os números no checkpoint).
- **Fatia 4.2 — Componente de listagem padrão (base + 2 telas).** Tabela/lista reutilizável com
  busca, filtros (status/categoria/data), ordenação e paginação. Construir o componente e aplicar em
  Solicitações e Encomendas.
- **Fatia 4.3 — Rollout da listagem padrão.** Aplicar o componente da 4.2 em Visitantes, Comida,
  Reservas e Moradores.
- **Fatia 4.4 — Seletor de moradores com busca.** Substituir todo campo de UUID cru por seletor com
  busca (nome/apto). Em Encomendas e Chat já existe (`GET /api/users/diretorio`, Session 30);
  estender pra Comida e Visitantes e padronizar o componente entre as quatro telas.
- **Fatia 4.5 — Polimento visual.** Ícones faltantes na nav (Comida, Dashboard, Cadastros), empty
  states ilustrados com call-to-action, skeleton loading em todas as listas, revisão de
  espaçamento/grid (hoje sobra espaço vazio). Testar nos dois modos (claro/escuro).
- **Fatia 4.6 — Drawer de detalhe.** Detalhe de item em drawer lateral em vez de expandir inline,
  como padrão reutilizável nas listas do Bloco A.
- **Fatia 4.7 — Central de notificações in-app.** Sino no header com badge de não lidas, alimentado
  pelos mesmos eventos que já disparam push.

### Bloco B — Dashboard rico

- **Fatia 4.8 — Dashboard admin.** Gráficos com Recharts (já previsto na stack): solicitações por
  status e por categoria ao longo do tempo, ocupação de áreas comuns, encomendas por dia. Feed de
  atividade recente + atalhos rápidos. Inadimplência fica placeholder até o Financeiro existir
  (Bloco C).
- **Fatia 4.9 — Dashboard do porteiro.** Encomendas pendentes, visitantes esperados hoje, entregas a
  caminho.
- **Fatia 4.10 — Dashboard do morador.** Minhas pendências, próximas reservas, últimos comunicados.

### Bloco C — Módulos novos (ordem de valor)

- **Fatia 4.11 — Financeiro (cobranças).** Taxa condominial por residência, geração de cobranças
  mensais, registro de pagamento, inadimplência visível no admin. Integração de boleto/PIX fica pra
  depois — começar com controle manual.
- **Fatia 4.12 — Financeiro (despesas + prestação de contas).** Despesas do condomínio com
  categorias e prestação de contas mensal (relatório). Habilita o gráfico de inadimplência da 4.8.
- **Fatia 4.13 — Ocorrências e penalidades.** Admin registra ocorrência contra uma residência
  (barulho, infração de regimento), fluxo advertência → multa, morador visualiza e pode contestar.
- **Fatia 4.14 — Documentos.** Repositório de atas, regimento interno, convenção, contratos e
  prestações de contas (upload pelo admin, leitura por morador), usando o storage já previsto na
  stack (Supabase Storage / S3).
- **Fatia 4.15 — Manutenção preventiva.** Cadastro de ativos (elevador, bomba, portão) com
  agendamento recorrente de manutenção e histórico — complementa as Solicitações reativas.
- **Fatia 4.16 — Portaria avançada (QR de visitante).** QR code de pré-autorização: morador gera,
  porteiro escaneia/valida.
- **Fatia 4.17 — Portaria avançada (veículos, pets, mudanças).** Cadastro de veículos e pets por
  residência + agendamento de mudanças.
- **Fatia 4.18 — Enquetes rápidas.** Votação leve criada pelo admin, separada do módulo formal de
  Assembleias.
- **Fatia 4.19 — Auditoria.** Tabela de log de ações sensíveis (quem mudou status, quem
  cadastrou/excluiu), visível ao admin — substitui o `console.log` do "ver como".
- **Fatia 4.20 — Onboarding real.** Convite por e-mail com link de cadastro (elimina o UUID cru no
  `/register`), fluxo de primeiro acesso do condomínio.

### Bloco D — Relatórios e exportação

- **Fatia 4.21 — Exportar PDF/planilha.** Relatório mensal de solicitações, financeiro e ocupação de
  áreas, usando os dados já existentes. Depende do Financeiro (4.11–4.12).

---

## 9. Estado atual

> Atualizado em 18/07/2026, fim da Session 31. Histórico completo sessão a sessão em
> `docs/CHECKPOINT_HISTORY.md`.

- **Fase 4 — Robustez e Expansão em andamento.** Roadmap aprovado, dividido em 21 fatias (seção 8).
  **Fatia 4.1 (performance) concluída nesta sessão.** Próxima: Fatia 4.2 (componente de listagem
  padrão).
- **Fatia 4.1 — o que mudou em `apps/web`:** code splitting por rota (`router.tsx` com `React.lazy`
  + Suspense; `RouteFallback` skeleton); `xlsx` carregado via `await import('xlsx')` (fora do bundle
  inicial); `queryClient` com `staleTime` 30s + `gcTime` 5min; prefetch on hover na nav
  (`routes/routePrefetch.ts`); `AuthContext` memoizado. Bundle inicial gzip caiu ~66% (209.83 →
  70.48 kB). Lighthouse/Profiler ficam como verificação manual do usuário (headless não roda).
- **Roadmap funcional do README 100% implementado** (Fases 1/2/3): Solicitações, Encomendas,
  Comunicados, Chat, Dashboard admin, Notificações push (FCM), Visitantes, Comida/Delivery, Áreas
  Comuns/Reservas, Assembleia/Votação. Brand kit integrado desde a Session 21.
- **Acesso hierárquico (Sessions 25-30):** fim do auto-registro; superadmin cria condomínio+primeiro
  admin; admin cadastra o resto; morador recebe acesso por e-mail. Residências, Moradores, Equipe,
  barra lateral agrupada, acesso do porteiro configurável por módulo, importação em massa CSV/XLSX,
  diretório real de morador (`GET /api/users/diretorio`).
- **Infra real:** Supabase conectado (Postgres + Auth) via Transaction Pooler. Multi-tenancy de verdade
  (banco único + `condominio_id` + RLS, role `app_user` restrita). Hospedagem alvo: Hostinger + Supabase.
- **Firebase configurado, envio real de push ainda não confirmado ponta a ponta** — falta um device
  token de verdade.
- **`apps/web` usa `xlsx` (SheetJS) instalado do CDN oficial deles**
  (`https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`), não do npm — a versão do npm (`0.18.5`)
  tem 2 vulnerabilidades high sem fix; o próprio SheetJS recomenda o CDN. Decisão confirmada pelo
  usuário. (A partir da 4.1 o SheetJS é importado dinamicamente, então nem entra no bundle inicial.)
- **Login fixo de teste** (condomínio "Condominio Teste", slug `teste`): usuário `admin`, senha
  `Admin123!`.
- **Verificação pendente do usuário:** mudanças de UI da 4.1 e das Sessions 29-30 testadas via
  build/API (passam), mas verificação visual no browser (dois modos, Playwright) ainda não conferida —
  usuário testa manualmente.
- **Próximo passo:** Fatia 4.2 — componente de listagem padrão (busca/filtros/ordenação/paginação) +
  aplicar em Solicitações e Encomendas.
