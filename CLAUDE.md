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

1. Atualizar a seção `## Checkpoint Log` no final deste arquivo (ou em `docs/CHECKPOINT.md`, se preferir separar) com:
   - O que foi concluído nesta sessão
   - O que ficou pendente/próximo passo
   - Qualquer decisão técnica tomada que não estava no README original
   - Bugs conhecidos não resolvidos

2. Ao **iniciar** uma nova sessão, o Claude Code deve **ler o Checkpoint Log primeiro**, antes de qualquer ação, para saber exatamente onde parou e não repetir trabalho nem perder contexto.

Formato do checkpoint:

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

## 8. Checkpoint Log

> **Estado atual do projeto (resumo rápido — 17/07/2026, fim da Session 11; detalhes sessão a sessão abaixo):**
>
> - **Infra real, não só planejada:** projeto Supabase real conectado (Postgres gerenciado + Auth), rodando via Transaction Pooler (a conexão direta trava por IPv6). Hospedagem alvo: Hostinger + Supabase.
> - **Multi-tenancy é de verdade, não só filtro de query:** banco único + `condominio_id` em cada tabela + Row Level Security, com uma role Postgres restrita (`app_user`, sem `BYPASSRLS`) — mesmo um bug no backend que esquecesse um filtro não vazaria dado entre condomínios. Ver Session 4.
> - **API da Fase 1 está 100% completa:** Auth (Supabase Auth/GoTrue), Solicitações (ex-"Chamados", renomeado na Session 6), Encomendas, Comunicados, Chat básico, Dashboard admin, Notificações push (FCM — projeto Firebase real configurado e inicialização validada na Session 12). Todos testados ponta a ponta contra o Supabase real, não com mocks.
> - **`apps/web` tem fundação real desde a Session 13, e as 5 telas de módulo da Fase 1 estão
>   completas desde a Session 19** (Solicitações — Session 14 —, Encomendas — Session 15 —,
>   Comunicados — Session 17 —, Chat — Session 18 — e Dashboard admin — Session 19): roteamento com
>   guarda por role, login/registro/logout contra a API real, componentes base do design system
>   (Button/Card/Input/Select/Textarea/Badge/Skeleton/ThemeToggle/StatTile), fontes self-hosted,
>   manifest de PWA, e `@tanstack/react-query` como camada de cache. **Com isso, a Fase 1 (MVP) está
>   funcionalmente completa ponta a ponta — API + telas.** `apps/mobile` segue só placeholder (o PWA
>   ainda não tem manifest com service worker/instalação offline, só o manifest estático — ver
>   Session 13).
> - **Conta de porteiro de teste**: não existe self-registro pra porteiro (só morador/admin em
>   `/register`, gap conhecido desde a Session 1 do backend) — criado `npm run seed:porteiro`
>   (Session 15, mesmo padrão do `seed:superadmin` já existente) só pra viabilizar testar telas que
>   dependem desse role.
> - **Brand kit integrado ao app desde a Session 21** (organizado na Session 16): favicon/ícones PWA
>   reais, componente `Logo` (símbolo reativo ao tema, sem precisar trocar arquivo por claro/escuro)
>   no header e telas de login/registro, os 8 ícones de domínio como componentes React (4 já usados
>   na navegação), e os 3 valores de token refinados do brand kit adotados em `tokens.css`.
> - **Painel superadmin completo desde a Session 20**: API de CRUD de condomínio (`/api/condominios`
>   — criar/listar/editar nome, sem exclusão por decisão explícita) e tela em `apps/web` (`/condominios`
>   — nav exclusiva do superadmin). **Com isso, a Fase 1 (MVP) está 100% completa**: API + telas de
>   todos os módulos + painel superadmin.
> - **Firebase configurado (Session 12), envio real de push ainda não confirmado ponta a ponta** — falta
>   um device token de verdade (SDK do Firebase rodando num client real); com `apps/web` já tendo tela
>   funcional, isso é destravável assim que fizer sentido priorizar.
> - **Fase 2 completa desde a Session 23** (iniciada na Session 22): Visitantes (morador registra
>   visitante auto-aprovado, porteiro/admin registram entrada/saída ou bloqueiam) e Comida/Delivery
>   (morador avisa pedido feito com ETA, porteiro/admin confirmam chegada e notificam o morador,
>   morador confirma retirada) — API + tela dos dois módulos, testados ponta a ponta.
> - **Próximo passo em aberto (nada decidido ainda, escolher ao retomar):** Fase 3 (Áreas comuns,
>   Assembleia/votação) — não há mais nenhum módulo pendente das Fases 1 e 2.

<!-- Claude Code: adicione novas entradas abaixo desta linha, sempre no topo (mais recente primeiro) -->

### Session 23 (Data: 17/07/2026)
**Completado:**
- [x] **Módulo de Comida/Delivery (API + tela)** — fecha a Fase 2. Sem ambiguidade entre os docs
  desta vez (README e CLAUDE.md batiam). Primeiro módulo com **atores diferentes fazendo transições
  de status diferentes no mesmo recurso**: morador avisa "a caminho" e confirma retirada, porteiro/
  admin confirma chegada — diferente de todo módulo anterior, que tinha um único ator dono da
  transição de status.
  - Migration `1700000000015_create-comida.ts` — RLS + `tenant_isolation` no mesmo molde de
    `visitantes`/`device_tokens`.
  - `models/User.ts` ganhou `listPorteiroIdsForTenant` (cópia de `listAdminIdsForTenant` trocando o
    filtro de role) — usado pra notificar todos os porteiros quando um pedido é criado (mesmo padrão
    de notificação de toda sessão anterior, só invertendo quem é notificado). Quando o porteiro
    confirma a chegada, o morador é notificado de volta (`"Seu pedido chegou"`), espelhando a
    notificação de encomenda mas na direção oposta.
  - `controllers/comidaController.ts`: como não tem um ator fixo, o `PATCH` de status valida por
    dentro do controller quem pode setar qual valor — `em-caminho`/`retirada` só morador (dono, via
    `restrictToMoradorId` no próprio `UPDATE`, mesmo estilo do `signEncomenda`), `chegou` só
    porteiro/admin. A rota autoriza os 3 papéis; a granularidade fica no controller.
  - Frontend: `ComidaCard.tsx` mostra botões diferentes por papel **e** status atual (não só por
    papel, como nos módulos anteriores). Nav ganhou o item "Comida" sem ícone — nenhum dos 8 ícones
    de domínio do brand kit cobre esse módulo.

**Verificação feita nesta sessão** (Playwright contra backend+web reais):
- Morador cria pedido → porteiro tenta marcar "a caminho" direto na API → 403 → morador marca "a
  caminho" pela tela → morador tenta marcar "chegou" → 403 → porteiro confirma chegada pela tela →
  porteiro tenta confirmar retirada → 403 → morador confirma retirada pela tela. Estado final
  (`status: retirada`, `notificacaoPortariaEnviada: true`) confirmado via API direta.
- `npx tsc --noEmit` (backend) e `npx tsc -b` (web) limpos.

**Próximo passo:**
- [ ] **Fases 1 e 2 completas.** Fase 3 (Áreas comuns, Assembleia/votação) é o próximo passo natural,
  nenhuma decisão tomada ainda sobre por qual módulo começar.
- [ ] Pedidos/usuários de teste acumulados (`teste.comida.*@sinndico.dev`) — limpar no painel se
  quiser um ambiente raso.

**Decisões técnicas / desvios do plano original:**
- Nenhuma — a granularidade de autorização por status (em vez de por rota) já estava prevista no
  plano desde o início, dado que o módulo genuinamente tem mais de um ator mudando o mesmo campo.

**Bugs conhecidos:**
- Nenhum.

### Session 22 (Data: 17/07/2026)
**Completado:**
- [x] **Módulo de Visitantes (API + tela)** — primeiro módulo da Fase 2, confirmado com o usuário.
  - **Ambiguidade entre docs resolvida**: o roadmap do README ("aprovação admin") contradizia o
    CLAUDE.md ("morador aprova visitante") e o schema só tem 3 status (`aprovado`/`bloqueado`/`ativo`
    — sem um 4º "pendente" que sustentasse um gate de admin separado). Decisão: morador cria o
    visitante já como `aprovado` (auto-aprovação — é o convidado dele); o campo `aprovado_por` do
    schema é preenchido com o próprio morador na criação em vez de ficar sem uso.
  - Migration `1700000000014_create-visitantes.ts` — RLS + policy `tenant_isolation` no mesmo molde
    de `device_tokens` (Session 11). `data_visita`/`hora_entrada`/`hora_saida` como `timestamptz`
    únicos (não data+hora separados), consistente com `encomendas.horario_chegada`.
  - `models/Visitante.ts`, `controllers/visitanteController.ts`, `routes/visitantes.ts` — mesmo
    padrão de todo módulo; `registrarEntrada`/`registrarSaida` usam a condição de status no próprio
    `WHERE` (mesmo estilo do `signEncomenda`) pra rejeitar transições fora de ordem sem checagem
    separada.
  - Frontend: `VisitantesPage.tsx` (form só pro morador, lista pros três papéis), `VisitanteCard.tsx`
    com os botões de porteiro/admin (registrar entrada/saída/bloquear) e o `VisitanteIcon` — já
    reservado desde a Session 21 — agora em uso na `Nav.tsx`.
  - **Bug pego na própria verificação e corrigido**: como o status fica `ativo` mesmo depois da
    saída (não existe um 4º status "concluído"), o badge mostrava "Na portaria" pra quem já tinha
    saído. Corrigido calculando o rótulo/cor a partir de `status` **+** presença de `horaSaida`
    juntos, não só do status cru — "Visita concluída" (verde) quando `ativo` com `horaSaida`
    preenchida, "Na portaria" só quando `ativo` sem `horaSaida`.

**Verificação feita nesta sessão** (Playwright contra backend+web reais):
- Morador cria 2 visitantes (`aprovado`). Porteiro registra entrada do primeiro (`ativo`,
  `horaEntrada` preenchida) → tentativa de check-in duplicado direto na API → 400, como esperado →
  registra saída (`horaSaida` preenchida) → bloqueia o segundo (`bloqueado`). Tudo confirmado via
  consulta direta à API, não só a tela. Morador não vê nenhum botão de ação; admin vê os mesmos
  botões do porteiro.
- `npx tsc --noEmit` (backend) e `npx tsc -b` (web) limpos.

**Próximo passo:**
- [ ] Comida/Delivery fecha a Fase 2, ou pular pra Fase 3 (Áreas comuns, Assembleia/votação) —
  nenhuma decidida.
- [ ] Visitantes/usuários de teste acumulados (`teste.visit.*@sinndico.dev`) — limpar no painel se
  quiser um ambiente raso.

**Decisões técnicas / desvios do plano original:**
- `aprovado_por` preenchido com o próprio morador na criação (não com um admin) — ver ambiguidade
  resolvida acima.
- Rótulo de status na UI depende de `status` + `horaSaida` juntos, não só do enum cru — schema não
  tem um 4º status "concluído", então a tela precisa dessa distinção adicional.

**Bugs conhecidos:**
- Nenhum (o bug do rótulo "Na portaria" pós-saída foi encontrado e corrigido na própria sessão).

### Session 21 (Data: 17/07/2026)
**Completado:**
- [x] **Brand kit real integrado ao app** (organizado desde a Session 16, nada tinha sido aplicado
  ainda). Confirmado com o usuário antes de codar: adotar os tokens refinados agora, e adicionar o
  símbolo real (componente React reativo ao tema) no header + telas de login/registro.
  - **Tokens**: `apps/web/src/styles/tokens.css` atualizado com os 3 valores que
    `brand-assets/tokens.json` trazia diferente (`--color-text-secondary` escuro, `--color-border`
    claro/escuro) + novo token `--color-text-muted` (claro/escuro) — `primary`/`accent`/`background`/
    `surface`/`danger`/`success` não mudaram (já eram idênticos). `tailwind.config.ts` ganhou a
    classe `text-muted`. `docs/DESIGN_SYSTEM.md` atualizado pra refletir os valores já aplicados
    (a antiga seção "1.1 Tokens candidatos" virou parte da tabela principal).
  - **Favicon/ícones PWA**: `apps/web/public/favicon.svg` e `icons/icon.svg` substituídos pelo
    `symbol.svg` real (ganhou o ponto de destaque âmbar e o raio de 28% que o placeholder não tinha).
    PNGs (192/512/maskable-512/apple-touch) regenerados a partir dele via `npx sharp-cli` (mesma
    conversão avulsa da Session 13, sem virar dependência permanente).
  - **Componente `Logo`** (`apps/web/src/components/ui/Logo.tsx`, novo): reimplementa o símbolo como
    SVG inline usando classes Tailwind (`fill-primary`/`fill-accent`/`fill-primary-contrast`) em vez
    de importar os SVGs estáticos do brand kit (que têm uma versão por tema) — assim reage ao tema
    automaticamente pelo mesmo mecanismo de `data-theme` que todo o resto do app já usa. Usado em
    `Header.tsx` (substituindo o `<span>Sinndico</span>` solto que era a única presença de marca no
    app até agora) e centralizado acima do card em `LoginPage.tsx`/`RegisterPage.tsx` (que não tinham
    nenhuma presença de marca antes).
  - **8 ícones de domínio**: adicionados em `apps/web/src/components/ui/icons.tsx` (mesmo `base()`
    compartilhado dos ícones de UI já existentes — o spec dos SVGs do brand kit já batia 1:1, sem
    reconciliar nada). Os 4 com módulo já construído (`SolicitacaoManutencaoIcon`, `EncomendaIcon`,
    `ComunicadoIcon`, `ChatIcon`) foram usados na `Nav.tsx`, ao lado do label de cada item — Dashboard
    e Condomínios ficaram só com texto (nenhum dos 8 ícones tem correspondência semântica com esses
    dois). Os outros 4 (`VisitanteIcon`, `AreaComumIcon`, `AssembleiaIcon`, `NotificacaoIcon`) ficam
    disponíveis pra quando os módulos correspondentes da Fase 2/3 existirem.

**Verificação feita nesta sessão** (Playwright, contra backend+web reais):
- `favicon.svg`, os 4 PNGs e o `manifest.webmanifest` respondendo 200; `favicon.svg` confirmado com o
  ponto de destaque (busca por `<circle` no conteúdo servido).
- Login, registro (morador e admin) e a área logada (nav com ícones) conferidos visualmente em claro
  e escuro — símbolo, ícones de nav e os tokens novos (texto secundário/bordas) renderizando
  corretamente nos dois modos, sem regressão de contraste nas telas já existentes.
- `npx tsc -b` limpo.

**Próximo passo:**
- [ ] Não há mais nenhum item de produto pendente da Fase 1. Avançar pra Fase 2 (Visitantes,
  Comida/Delivery) ou Fase 3 (Áreas comuns, Assembleia/votação) — nenhuma decidida ainda.
- [ ] Usuários de teste acumulados (`teste.brand.*@sinndico.dev`) — limpar no painel se quiser um
  ambiente raso.

**Decisões técnicas / desvios do plano original:**
- O símbolo foi reimplementado como componente React (cores via Tailwind) em vez de usar os SVGs
  estáticos do brand kit diretamente — decisão deliberada pra evitar ter que trocar de arquivo por
  tema; os SVGs originais (`logo-lockup-light.svg`/`dark.svg` etc.) continuam em `brand-assets/` como
  referência/fonte, só não são importados no código.

**Bugs conhecidos:**
- Nenhum.

### Session 20 (Data: 17/07/2026)
**Completado:**
- [x] **Painel superadmin (API + tela)** — último item de produto pendente da Fase 1. Escopo
  confirmado com o usuário antes de codar: só CRUD de condomínio (criar/listar/editar nome), sem
  criar a primeira conta de admin pelo painel (fica pra sessão futura) e sem exclusão/desativação
  (ação destrutiva não pedida, tabela não tem soft-delete).
  - **Achado que definiu o desenho do backend**: a tabela `condominios` só tem `id`/`nome`/
    `created_at`, com RLS habilitada só numa policy `FOR SELECT` (`id = app.condominio_id`). Um
    superadmin sempre tem `condominioId: null`; passando isso por `withTenantContext`, a policy nunca
    casa (`id = NULL` nunca é `TRUE`) — ou seja, **RLS bloqueia o superadmin, não libera "todos os
    condomínios"**. Isso já estava antecipado no comentário de `tenantContext.ts` ("operações
    cross-tenant de superadmin usam `pool` direto") e é como os seeds já existentes
    (`createSuperadmin.ts`, `run.ts`) sempre operaram. Além disso não existe nenhuma policy de
    INSERT/UPDATE/DELETE em `condominios` (só `SELECT`), então escrever via `appPool` seria rejeitado
    de qualquer forma.
  - `apps/backend/src/models/Condominio.ts` — **primeiro model do código a usar o `pool` privilegiado
    direto** (bypassa RLS de propósito, com `authorize('superadmin')` na rota como única porta de
    acesso) em vez de `withTenantContext`/`appPool` como todo outro model — comentário no arquivo
    explica o porquê, no mesmo espírito dos comentários já existentes em `tenantContext.ts`.
    `listCondominios`/`findCondominioById` fazem `LEFT JOIN` com `users` pra contar usuários por
    condomínio (`totalUsuarios`) — dado extra que não foi pedido explicitamente mas dá visibilidade
    real de gestão sem precisar de coluna/tabela nova.
  - `condominioController.ts` + `routes/condominios.ts` (mesmo padrão de todo controller/rota
    existente) + montado em `app.ts`.
  - **Frontend**: `condominiosApi.ts`, `CreateCondominioForm.tsx`, `CondominioCard.tsx` (nome como
    título, `id` em `font-mono` visível — dá ao superadmin de onde copiar o UUID que o `/register`
    já exige hoje, mitigando parte do gap conhecido de "sem convite/descoberta" —, contagem de
    usuários, botão "Editar" que revela edição inline do nome), `CondominiosPage.tsx`. `roleHome.ts`:
    `superadmin` passa a cair em `/condominios` (era `/em-construcao`). `router.tsx`: nova rota +
    removida a rota `em-construcao`/import de `ComingSoonPage` (ficou sem nenhum uso — o arquivo
    `ComingSoonPage.tsx` continua existindo, só não é mais importado). `Nav.tsx`: item exclusivo do
    superadmin.

**Verificação feita nesta sessão** (Playwright + consulta direta à API, contra backend+web reais):
- Login como superadmin → cai em `/condominios`, nav mostra só "Condomínios". Cria condomínio → some
  na lista com `totalUsuarios: 0`. Edita o nome inline → persistência confirmada via API direta.
  Copia o `id` exibido no card e registra um morador de teste nesse condomínio novo → confirma que o
  UUID exposto na tela é utilizável de ponta a ponta, e que `totalUsuarios` sobe pra `1` depois.
  Morador chamando `/api/condominios` direto → 403; nav do morador não mostra "Condomínios".
- Um teste inicial deu falso-negativo porque o locator do Playwright perdia a referência do card ao
  entrar em modo de edição (o nome deixa de ser texto renderizado e vira valor de `<input>`) —
  corrigido localizando o card pelo `id` (que fica visível nos dois estados); não era bug do app.
- `npx tsc --noEmit` (backend) e `npx tsc -b` (web) limpos.

**Próximo passo:**
- [ ] **Fase 1 (MVP) está 100% completa** (API + telas + painel superadmin). Direções em aberto,
  nenhuma decidida: (1) integrar o brand kit real ao app (Session 16), (2) avançar pra Fase 2
  (Visitantes, Comida/Delivery) ou Fase 3 (Áreas comuns, Assembleia/votação).
- [ ] Condomínios/usuários de teste acumulados (`teste.painel.*@sinndico.dev`,
  `teste.superadmin@sinndico.dev`) — limpar no painel se quiser um ambiente raso.

**Decisões técnicas / desvios do plano original:**
- `models/Condominio.ts` usa o `pool` privilegiado direto em vez de `withTenantContext` — única
  exceção deliberada ao padrão de acesso a dados do resto do código, motivada pela análise de RLS
  acima (não uma escolha arbitrária).

**Bugs conhecidos:**
- Nenhum.

### Session 19 (Data: 17/07/2026)
**Completado:**
- [x] **Tela de Dashboard admin**, consumindo `GET /api/dashboard/summary` — quinta e última tela de
  módulo da Fase 1. **Com isso, `apps/web` cobre toda a API da Fase 1: Auth, Solicitações,
  Encomendas, Comunicados, Chat e Dashboard, todas com tela funcional.**
  - Antes de codar, consultei a skill `dataviz` (o pedido bate com os gatilhos "dashboard"/"stat
    tile" dela) — a orientação relevante pra esse caso (sem gráfico nenhum, só números): rótulo em
    sentence case, valor grande em fonte proporcional (não `tabular-nums`, isso é só pra colunas de
    tabela), e o texto do valor/rótulo sempre em tokens neutros (texto nunca "veste" a cor do dado) —
    por isso os 4 números não têm cor por severidade, todos em `text-primary`/`text-secondary` como o
    resto do app.
  - Tipos novos (`DashboardSummaryResponse`) + `src/services/api/dashboardApi.ts` (`getSummary`).
  - `src/components/Dashboard/StatTile.tsx` — rótulo + número grande (`text-3xl`, `font-display`,
    já especificado desde o início em `docs/DESIGN_SYSTEM.md` como uso pretendido pra "números de
    destaque no dashboard").
  - `DashboardPage.tsx` substitui o placeholder em `/dashboard` — grid de 4 `StatTile` (solicitações
    abertas/em progresso, encomendas aguardando/chegadas hoje) + card com os 5 comunicados mais
    recentes (título + data, sem número).

**Verificação feita nesta sessão** (Playwright + consulta direta à API, contra backend+web reais):
- Capturado o resumo via API antes de criar dado novo, depois criada 1 solicitação, 1 encomenda e 1
  comunicado (papéis morador/porteiro/admin reais) e capturado de novo — confirmado que "abertas" e
  "aguardando retirada" incrementaram exatamente +1 cada, e que o comunicado novo apareceu como o
  primeiro item de "recentes". Os mesmos números foram conferidos batendo na tela renderizada
  (`DashboardPage`), não só na resposta crua da API.
- Testado visualmente em claro e escuro — grid de stat tiles e lista de comunicados renderizando
  corretamente nos dois modos.
- `npx tsc -b` limpo. Nenhum erro de console/página.

**Próximo passo:**
- [ ] **Fase 1 (MVP) está completa** (API + telas). Próximas direções, nenhuma decidida: (1) API de
  CRUD de condomínio + painel superadmin, (2) integrar o brand kit real ao app (Session 16), (3)
  avançar pra Fase 2 (Visitantes, Comida/Delivery) ou Fase 3 (Áreas comuns, Assembleia/votação) —
  seguindo a regra do CLAUDE.md de não pular fase sem confirmação explícita.
- [ ] Dados de teste seguem acumulando no condomínio de teste (`teste.dash.*@sinndico.dev`) — limpar
  no painel se quiser um ambiente raso pra demonstrações.

**Decisões técnicas / desvios do plano original:**
- Nenhuma — mesmo padrão de tela das sessões anteriores, com a skill `dataviz` consultada pra validar
  o tratamento visual dos números (nenhuma mudança de tokens/paleta, só confirmação do approach).

**Bugs conhecidos:**
- Nenhum.

### Session 18 (Data: 17/07/2026)
**Completado:**
- [x] **Tela de Chat**, consumindo a API real (`/api/chats`), quarta tela de módulo — com isso, só
  falta o Dashboard admin pra fechar o ciclo de telas da Fase 1.
  - Tipos novos (`ChatResponse`, `CreateChatPayload`) + `src/services/api/chatsApi.ts` (`list` aceita
    `moradorId` opcional pra montar a query string, `send`).
  - `src/components/Chat/`: `ChatThread.tsx` (bolhas alinhadas à direita/esquerda por `autorId`,
    rotuladas "Você"/"Morador"/"Administração" — sem diretório de usuários, o rótulo genérico é a
    melhor aproximação possível hoje) e `ChatMessageForm.tsx` (envia e invalida a query da thread
    certa, `queryKey: ['chats', moradorId]`).
  - `ChatPage.tsx` substitui o placeholder na rota `/chat` — morador vê direto a própria thread
    (`moradorId` implícito = o próprio id); admin precisa digitar o ID do morador (mesmo padrão já
    usado em Encomendas, sem diretório de moradores ainda) antes de ver/responder a conversa.
  - Nenhuma mudança no backend — a marcação automática de "lido" ao abrir a thread (`GET` já marca
    como lidas as mensagens do outro lado, sem endpoint separado) já existia e só foi consumida.

**Verificação feita nesta sessão** (Playwright contra backend+web reais):
- Morador manda mensagem → admin digita o ID do morador, vê a mensagem, responde → morador recarrega
  e vê a resposta. Confirmado via API direta que a marcação automática de leitura funciona nos dois
  sentidos: a mensagem do morador fica `lido: true` depois que o admin abre a thread (`GET`), e a
  resposta do admin fica `lido: true` depois que o morador reabre a própria thread.
- `npx tsc -b` limpo. Nenhum erro de console/página.

**Próximo passo:**
- [ ] **Dashboard admin** — última tela de módulo da Fase 1 (`GET /api/dashboard/summary`, só
  leitura, sem mutação — a mais simples de todas).
- [ ] Usuários/mensagens de teste acumulados no condomínio de teste (`teste.chat.*@sinndico.dev`) —
  limpar no painel se quiser um ambiente raso.

**Decisões técnicas / desvios do plano original:**
- Nenhuma nova — mesmo padrão de tela das três sessões anteriores.

**Bugs conhecidos:**
- Nenhum.

### Session 17 (Data: 17/07/2026)
**Completado:**
- [x] **Tela de Comunicados**, consumindo a API real (`/api/comunicados`), terceira tela de módulo
  seguindo a mesma ordem do backend e o mesmo padrão das anteriores (Solicitações/Encomendas).
  - Tipos novos (`ComunicadoResponse`, `CreateComunicadoPayload`) + `src/services/api/comunicadosApi.ts`
    (list/create/markAsRead).
  - `Badge` ganhou o status `novo` (reaproveitando `accent`, já documentado desde o início em
    `docs/DESIGN_SYSTEM.md` como uso pretendido pra "badge novo").
  - `src/components/Comunicados/`: `CreateComunicadoForm.tsx` (só admin — título/conteúdo) e
    `ComunicadoCard.tsx` (badge "Novo" enquanto `lido: false`, botão "Marcar como lido" que some após
    o `POST /:id/ler`, mensagem de erro inline se falhar).
  - `ComunicadosPage.tsx` substitui o placeholder na rota `/comunicados` — admin vê form+lista
    completa (comunicados não são escopados por role, é mural mesmo, então admin também marca como
    lido pra si); morador/porteiro só a lista, sem form.

**Verificação feita nesta sessão** (Playwright contra backend+web reais):
- Admin publica → aparece pra ele mesmo com badge "Novo" (comunicado é mural, `lido` é por usuário,
  inclusive pro autor). Morador registrado depois vê o mesmo comunicado, marca como lido → badge e
  botão somem imediatamente, persistência (`lido: true`) confirmada consultando a API diretamente.
  Porteiro (conta seedada na Session 15) também vê o comunicado, sem form de criar.
- `npx tsc -b` limpo. Nenhum erro de console/página.

**Próximo passo:**
- [ ] Próxima tela de módulo: Chat, depois Dashboard.
- [ ] Comunicados/usuários de teste acumulados no condomínio de teste (`teste.com.*@sinndico.dev`) —
  limpar no painel se quiser um ambiente raso.

**Decisões técnicas / desvios do plano original:**
- Nenhuma nova — mesmo padrão de tela (tipos → API client → componentes → página → roteamento →
  verificação Playwright) das duas sessões anteriores.

**Bugs conhecidos:**
- Nenhum.

### Session 16 (Data: 17/07/2026)
**Completado:**
- [x] **Brand kit anexado pelo usuário, organizado e documentado** — pedido explícito era só
  estruturar pra uso futuro, sem tocar no app rodando ainda (confirmado antes de começar).
  - Consolidado em `brand-assets/` na raiz (a pasta chegou como `Brand-assets/`, com 4 arquivos
    soltos de amostra duplicando 4 dos 22 arquivos reais dentro de `sinndico-brand-assets.zip`).
    Extraído o zip, apagados os arquivos soltos duplicados e o próprio zip, pasta renomeada pra
    minúsculo. Estrutura final: `brand-assets/assets/brand/` (8 SVGs — símbolo, wordmark, lockups
    claro/escuro, reverse-mono, favicons 16/32/48) e `brand-assets/assets/icons/` (8 ícones de
    domínio, um por módulo funcional) + `brand-assets/tokens.json` (versão machine-readable dos
    tokens).
  - **Fundido o `docs/DESIGN_SYSTEM.md` do brand kit no canônico** (`docs/DESIGN_SYSTEM.md` na raiz)
    em vez de manter os dois — seções novas: Logo e símbolo (§2), Ícones — confirma que o spec já
    bate 1:1 com `apps/web/src/components/ui/icons.tsx` (§4), Imagery (§7), nota de Motion sobre
    Framer Motion (§8). Restante do doc renumerado (era 6 seções, agora 9). Tokens do brand kit que
    divergem dos já implementados (`text-secondary` escuro, `border` claro/escuro, mais o token novo
    `text-muted`) entraram como tabela "candidatos, não aplicados" (§1.1) — não mudei nenhum valor
    real em `apps/web/src/styles/tokens.css`.
  - CLAUDE.md seção 3: uma linha nova apontando que os arquivos-fonte do brand kit vivem em
    `brand-assets/`, complementando o `docs/DESIGN_SYSTEM.md`.

**Verificação feita nesta sessão** (trabalho só de arquivo/documentação, sem código executável):
- `git status` confirmando que só existe `brand-assets/` (sem `Brand-assets/` residual, sem `.zip`,
  sem arquivos soltos duplicados).
- Conferidos visualmente `symbol.svg`, `chat.svg` e `tokens.json` extraídos do zip — sem corrupção,
  conteúdo íntegro.
- `docs/DESIGN_SYSTEM.md` final relido de ponta a ponta — cores/tipografia/componentes que já
  existiam continuam exatamente com os mesmos valores; nada do que estava implementado mudou.

**Próximo passo:**
- [ ] Integrar o brand kit ao app rodando, quando fizer sentido priorizar: trocar
  `apps/web/public/favicon.svg`/`icons/icon.svg` (+ PNGs derivados) pelo `symbol.svg`/`favicon-*.svg`
  reais; adicionar os 8 ícones de domínio como componentes React (mesmo padrão de
  `apps/web/src/components/ui/icons.tsx`); decidir se adota os 3 valores de token candidatos
  (§1.1 do `docs/DESIGN_SYSTEM.md`).
- [ ] Continuar a ordem das telas de módulo: Comunicados, depois Chat, depois Dashboard.

**Decisões técnicas / desvios do plano original:**
- Nenhuma — só organização/documentação, conforme pedido explícito do usuário e confirmado antes de
  começar (não alterar `apps/web` nesta sessão).

**Bugs conhecidos:**
- Nenhum.

### Session 15 (Data: 17/07/2026)
**Completado:**
- [x] **Tela de Encomendas**, consumindo a API real (`/api/encomendas`), seguindo a mesma ordem do
  backend (Session 7) e o mesmo padrão de tela estabelecido na Session 14 (Solicitações).
  - Tipos novos (`EncomendaResponse`, `CreateEncomendaPayload`) + `src/services/api/encomendasApi.ts`
    (list/create/sign).
  - `src/components/Encomendas/`: `CreateEncomendaForm.tsx` (só porteiro — `moradorId`/descrição/
    fotoUrl, mesmos como campos de texto crus já usados em outros formulários desta fase, já que não
    existe endpoint de busca/diretório de moradores nem upload de arquivo de verdade) e
    `EncomendaCard.tsx` (Badge de status aguardando/retirada, link pra foto se houver, e botão
    "Confirmar retirada" só pro morador dono, escondido se já assinada).
  - `EncomendasPage.tsx` substitui o placeholder na rota `/encomendas` — porteiro vê form+lista
    completa, admin só lista completa (sem form, sem botão de assinar), morador só a própria lista
    com o botão de assinar.
  - **Gap novo descoberto e resolvido**: não existe endpoint de auto-registro pra role `porteiro` (só
    morador/admin em `/register` — gap já documentado desde a Session 1 do backend, mas nunca tinha
    esbarrado nele até esta sessão precisar testar a tela). Criado
    `apps/backend/src/database/seeds/createPorteiro.ts` + script `npm run seed:porteiro`, no mesmo
    molde do `seed:superadmin` já existente (parametrizado via env vars
    `PORTEIRO_EMAIL`/`PORTEIRO_PASSWORD`/`PORTEIRO_CONDOMINIO_ID`/`PORTEIRO_NOME`) — não é uma feature
    de produto (isso seria "admin cria porteiro pela UI", ainda não existe), é só a mesma ferramenta de
    bootstrap que já usávamos pra superadmin, agora também pra porteiro.

**Verificação feita nesta sessão** (Playwright contra backend+web reais):
- Porteiro (conta criada via `seed:porteiro`) cadastra uma encomenda pro morador → aparece na lista do
  porteiro. Admin vê a mesma encomenda (sem form nem botão de assinar). Morador vê e confirma a
  retirada — persistência (`status: retirada`, `assinado: true`, `dataAssinatura` preenchida)
  confirmada consultando a API diretamente, não só lendo a tela.
- Nav por role conferida nos 3 papéis: porteiro só vê Encomendas/Comunicados; admin e morador mantêm
  o conjunto já validado nas sessões anteriores.
- `npx tsc -b` limpo.

**Próximo passo:**
- [ ] Próxima tela de módulo, seguindo a ordem do backend: Comunicados, depois Chat, depois Dashboard.
- [ ] Encomendas/usuários de teste acumulados no condomínio de teste
  (`teste.enc.*@sinndico.dev`, `teste.porteiro@sinndico.dev`) — limpar no painel se quiser um
  ambiente raso.

**Decisões técnicas / desvios do plano original:**
- `seed:porteiro` é uma ferramenta de bootstrap de teste/ambiente (como o `seed:superadmin`), não uma
  feature de produto — a feature real ("admin cria porteiro") continua no backlog do painel admin.

**Bugs conhecidos:**
- Nenhum.

### Session 14 (Data: 17/07/2026)
**Completado:**
- [x] **Primeira tela funcional de módulo: Solicitações**, consumindo a API real (`/api/solicitacoes`).
  - `@tanstack/react-query` entrou como dependência nesta sessão (decisão já prevista desde a Session
    13 — "sem telas de lista ainda para justificar cache" deixou de valer assim que a primeira lista
    apareceu). `src/lib/queryClient.ts` + `QueryClientProvider` envolvendo o app em `App.tsx`.
  - `src/services/api/solicitacoesApi.ts` + tipos novos em `types.ts` (`SolicitacaoResponse`,
    `CreateSolicitacaoPayload`, `UpdateSolicitacaoPayload`), espelhando o contrato do backend.
  - Dois componentes base novos no design system: `Select` e `Textarea` (mesmo padrão visual/estados
    do `Input` — label sempre visível, erro/helper, foco). `Badge` ganhou 3 status novos
    (`baixa`/`media`/`alta`) reaproveitando as cores já existentes (baixa→success, media→accent,
    alta→danger, no mesmo esquema do "urgente") em vez de inventar uma paleta nova pra prioridade.
  - `src/components/Solicitacoes/`: `CreateSolicitacaoForm.tsx` (só morador — categoria/título/
    descrição, `useMutation` invalidando a query da lista no sucesso) e `SolicitacaoCard.tsx` (lista
    read-only pro morador; admin ganha selects de Status/Prioridade que fazem `PATCH` imediato ao
    mudar, com invalidação de cache e mensagem de erro inline se falhar).
  - `SolicitacoesPage.tsx` substitui o placeholder "em construção" na rota `/solicitacoes`.

**Verificação feita nesta sessão** (Playwright contra backend+web reais, não mocado):
- Morador cria uma solicitação → aparece na própria lista, sem os controles de admin.
- Admin (mesmo condomínio) vê a solicitação do morador na lista completa do condomínio, muda Status
  pra "Em progresso" e Prioridade pra "Alta" via select — confirmado como persistido de verdade
  consultando a API diretamente (não só lendo o DOM), e o morador vê o reflexo ao recarregar.
- Um teste inicial deu falso-negativo por ler o DOM cedo demais (antes do refetch disparado pela
  invalidação do react-query terminar) — corrigido esperando a resposta do `GET` de refetch, não só
  do `PATCH`; não era bug do app, era o script de verificação lendo estado antes da hora.
- `npx tsc -b` limpo. Nenhum erro de console/página nos fluxos testados.

**Próximo passo:**
- [ ] Próxima tela de módulo (Encomendas, Comunicados, Chat ou Dashboard — Dashboard é a mais simples,
  só leitura de `GET /api/dashboard/summary`, sem mutação).
- [ ] Usuários e solicitações de teste ficaram acumulados no condomínio de teste do Supabase
  (`teste.sol*.{morador,admin}.*@sinndico.dev`) — limpar no painel se quiser um ambiente raso pra
  demonstrações.

**Decisões técnicas / desvios do plano original:**
- Nenhuma nova — a entrada do `@tanstack/react-query` já estava prevista explicitamente desde o plano
  da Session 13 pra este exato momento (primeira tela de lista).

**Bugs conhecidos:**
- Nenhum.

### Session 13 (Data: 17/07/2026)
**Completado:**
- [x] **Fundação do web/PWA** (`apps/web`), escopo combinado com o usuário: só a base, sem as telas de
  módulo ainda (essas ficam pra sessões seguintes, uma por vez).
  - Dependências novas: `react-router-dom`, `@fontsource/space-grotesk`/`inter`/`jetbrains-mono` (fontes
    self-hosted — antes só estavam referenciadas no Tailwind config, nunca carregadas de fato).
    Deliberadamente **não** entrou axios/`@tanstack/react-query`/zustand/clsx/ícones prontos/
    `vite-plugin-pwa` — ver `docs/DESIGN_SYSTEM.md` e o plano da sessão para a justificativa de cada
    corte (mesma leveza de dependências do backend: raw `pg`+zod, sem ORM).
  - **Cliente de API** (`src/services/api/{client,types,authApi}.ts` + `src/services/tokenStorage.ts`):
    `apiFetch<T>` injeta o Bearer token, e em `401` deduplica refresh concorrente (só um
    `POST /api/auth/refresh` mesmo com N chamadas simultâneas tomando 401 ao mesmo tempo — verificado
    de verdade, não só no papel) e reexecuta a chamada original uma vez; se o refresh falhar, limpa os
    tokens e desloga.
  - **Auth**: `AuthContext`/`useAuth` (Context + `useReducer`, sem lib de estado) hidrata via `GET /me`
    no boot se já existe token salvo. `RequireAuth`/`RequireGuest`/`roleHome` fazem o roteamento por
    role (`admin→/dashboard`, `morador→/solicitacoes`, `porteiro→/encomendas`,
    `superadmin→/em-construcao` — não tem painel próprio ainda).
  - **Componentes base do design system** implementados de verdade pela primeira vez (até então só
    existia a especificação em `docs/DESIGN_SYSTEM.md`): Button, Card, Input, Badge, Skeleton,
    ThemeToggle — este último **corrige um bug real do scaffold da Session 1**: `main.tsx` só lia o
    tema (localStorage/`prefers-color-scheme`) pra aplicar no boot, mas nunca escrevia de volta quando
    o usuário clicava em algo, porque não existia nenhum toggle de fato ainda.
  - Pré-requisito de plumbing pro Badge/hover: os tokens de cor em `tokens.css` são hex, e a sintaxe de
    opacidade do Tailwind (`bg-accent/10`) precisa do valor em RGB — adicionei variáveis irmãs
    `--color-*-rgb` (claro e escuro) e troquei as entradas de cor do `tailwind.config.ts` pra função de
    opacidade documentada do Tailwind. Aditivo, não mudou nenhum valor hex da tabela de tokens.
  - **Páginas**: Login, Register (aceita o `condominioId` como campo de texto cru — não existe fluxo de
    convite/descoberta ainda, gap conhecido, não resolvido agora) e placeholders "em construção" pros 5
    módulos + painel do superadmin, só provando que roteamento/role-gating funcionam ponta a ponta.
  - **PWA (só manifest, sem service worker ainda)**: `public/manifest.webmanifest`, ícones gerados a
    partir de um monograma "S" desenhado à mão em SVG (não existe logo real ainda) — rasterizado pra
    PNG via `npx sharp-cli` como conversão avulsa, sem virar dependência permanente do projeto. Tags
    novas no `index.html` (manifest, theme-color light/dark, apple-touch-icon, favicon SVG).
    Deliberadamente sem `navigator.serviceWorker.register(...)` — cache offline fica pra quando entrar
    em pauta de verdade.

**Verificação feita nesta sessão** (com backend e web reais rodando, não mocado — dirigido de verdade
num Chromium headless via Playwright, já que não há suíte de testes automatizados neste repo):
- Registro de morador → `/solicitacoes`, nav mostra Solicitações/Encomendas/Comunicados/Chat sem
  Dashboard. Registro de admin → `/dashboard`, nav completo.
- Morador forçando a URL `/dashboard` → ricocheteia de volta pra `/solicitacoes`, sem tela de erro.
- Tema: alternar no `ThemeToggle` muda o atributo `data-theme` e grava
  `localStorage['sinndico:theme']`; sobrevive a um reload completo da página sem flash do tema errado.
- Logout: limpa os tokens do `localStorage`, redireciona pra `/login`.
- **401 → refresh → retry, com dedup confirmado de verdade**: forcei um access token inválido; o log de
  rede mostrou duas chamadas `GET /api/auth/me` tomando 401 quase simultaneamente (efeito do
  `React.StrictMode` remontando o `AuthProvider` em dev) e **só um único** `POST /api/auth/refresh`
  disparou — as duas chamadas originais foram reexecutadas com sucesso depois. Corrompendo também o
  refresh token, o fluxo falha graciosamente: um único `POST /refresh` retorna 401, tokens são limpos,
  app redireciona pra `/login`, sem loop.
- Nenhum erro de console/página em nenhum dos fluxos acima.
- `npx tsc -b` e `npx vite build` limpos.

**Próximo passo:**
- [ ] Construir as telas funcionais de cada módulo, uma por vez (Solicitações é a candidata natural pra
  ir primeiro — desbloqueia validar o resto do fluxo de ponta a ponta pela UI).
- [ ] Isso também destrava testar o envio de push de verdade (Session 12 ficou pendente por falta de um
  client real capaz de gerar um device token via SDK do Firebase).
- [ ] Usuários de teste ficaram no Supabase Auth (`teste.web.morador.*@sinndico.dev`,
  `teste.web.admin.*@sinndico.dev`) — remover no painel se quiser um ambiente limpo.

**Decisões técnicas / desvios do plano original:**
- Nenhuma de arquitetura — as escolhas de dependência (o que entrou e o que ficou de fora) estão
  documentadas acima e no arquivo de plano da sessão, todas justificadas pela leveza que o resto do
  projeto já pratica.

**Bugs conhecidos:**
- Nenhum.

### Session 12 (Data: 17/07/2026)
**Completado:**
- [x] **Firebase configurado de verdade** — usuário gerou a chave de conta de serviço no Firebase Console
  e deixou o JSON solto na raiz do repo (`sinndico-92950-4e2893d2732b.json`, **não coberto pelo
  `.gitignore`** até então — risco real de vazar credencial num commit futuro). Extraí os 3 campos
  (`project_id`, `client_email`, `private_key`) pro `apps/backend/.env`, apaguei o arquivo JSON da raiz
  (a chave já vive só no `.env`, gitignored) e reforcei o `.gitignore` com padrões pra arquivo de conta
  de serviço (`*serviceAccount*.json`, `firebase-adminsdk*.json` etc.) — hardening pra não depender só
  de lembrar de não commitar.
- [x] **Validação de inicialização real do Firebase Admin SDK**: subi o backend local, registrei admin +
  morador de teste, registrei um device token (necessariamente fake, sem frontend/SDK client pra gerar
  um de verdade) e criei um comunicado (dispara push pro condomínio inteiro). Log resultante:
  `push "Novo comunicado": 0 ok, 1 falhas` — a métrica vem de uma resposta estruturada por token do
  FCM, não do catch genérico de erro; ou seja, o SDK autenticou de verdade com o Google e fez a chamada
  real à API do FCM. A falha é exatamente a esperada (token fake não existe em nenhum device
  registrado), não um erro de credencial/config.

**Verificação feita nesta sessão:**
- `GET /health` → 200 antes de qualquer teste.
- Registro de admin/morador de teste, registro de device token (201), criação de comunicado (201) — tudo
  contra o Supabase real.
- Log do `notificationService` confirmando envio real tentado (contagem de sucesso/falha por token),
  não o aviso de "Firebase não configurado" que aparecia até a Session 11.
- Servidor de teste derrubado ao final (processo na porta 5000 finalizado).

**Próximo passo:**
- [ ] **Não foi possível confirmar entrega de push de fato** (precisa de um token de dispositivo real,
  que só existe com um client rodando o SDK do Firebase — web ou mobile). Isso só é testável quando
  houver alguma tela (mesmo que mínima) capaz de chamar `getToken()` do Firebase JS SDK e registrar em
  `POST /api/device-tokens`.
- [ ] Escolher entre: (1) telas web/PWA (o que também destravaria o teste de push real), (2) API de
  CRUD de condomínio + painel superadmin.
- [ ] Usuários de teste ficaram no Supabase Auth do projeto (`teste.fcm.admin.*@sinndico.dev`,
  `teste.fcm.morador.*@sinndico.dev`) — remover no painel se quiser um ambiente limpo.

**Decisões técnicas / desvios do plano original:**
- Nenhuma de arquitetura — só o hardening de `.gitignore` pra chaves de conta de serviço, motivado por
  um risco real observado nesta sessão (arquivo de credencial fora do controle do gitignore).

**Bugs conhecidos:**
- Nenhum. Entrega de push de fato (não só inicialização do SDK) segue pendente de um client real.

### Session 11 (Data: 17/07/2026)
**Completado:**
- [x] **Notificações push (FCM) — API completa, com fallback gracioso** (não há projeto Firebase real
  configurado neste ambiente — usuário decidiu construir agora e configurar depois).
  - Nova tabela `device_tokens` (migration `1700000000013`) — token de dispositivo por usuário,
    único (upsert em re-registro), RLS por `condominio_id`.
  - `src/services/notificationService.ts` — inicializa o `firebase-admin` só na primeira notificação
    (lazy) e só se `FIREBASE_PROJECT_ID`/`FIREBASE_CLIENT_EMAIL`/`FIREBASE_PRIVATE_KEY` estiverem
    todas definidas; se não estiverem, loga um aviso uma vez e vira no-op — **nunca** lança exceção,
    então uma notificação falhando (ou Firebase não configurado) nunca derruba a operação principal.
  - `src/models/DeviceToken.ts` + `POST`/`DELETE /api/device-tokens` (qualquer role autenticado
    registra/remove o próprio token).
  - Gatilhos conectados nos 3 módulos que o README pedia: encomenda criada → notifica o morador
    dono; comunicado criado → notifica todo mundo do condomínio; mensagem de chat → notifica o
    outro lado (todos os admins do condomínio se quem escreveu foi morador; o morador específico se
    quem escreveu foi admin). Novo `listAdminIdsForTenant` em `User.ts` pra resolver "todos os
    admins" no gatilho do chat.

**Verificação feita nesta sessão (contra o Supabase real, sem Firebase configurado):**
- Registrar device token → 201. Criar encomenda/comunicado/mensagem de chat com o token registrado
  → todas continuam retornando 201 normalmente, e o log mostra exatamente o aviso esperado
  ("Firebase não configurado ... notificações push desativadas"), sem nenhum erro/crash.
- Remover device token → 204.
- **Não foi possível testar o envio de push de verdade** (precisa de um projeto Firebase real — ver
  Próximo passo).

**Próximo passo:**
- [ ] **Ação do usuário:** criar projeto no Firebase Console, gerar a chave de conta de serviço
  (Configurações do projeto > Contas de serviço > Gerar nova chave privada) e preencher
  `FIREBASE_PROJECT_ID`/`FIREBASE_CLIENT_EMAIL`/`FIREBASE_PRIVATE_KEY` no `.env`. Depois, registrar
  um token de dispositivo de verdade (via SDK do Firebase no client) e confirmar que a notificação
  chega.
- [ ] **Com isso, a API inteira da Fase 1 está 100% completa.** Resta: telas web/PWA (nenhum módulo
  tem tela ainda) e o painel superadmin (schema/API pendente desde a Session 4).

**Decisões técnicas / desvios do plano original:**
- Nenhuma nova — mesmo padrão de acesso a dados dos módulos anteriores; a única peça nova é o
  serviço de notificação em si, desenhado pra nunca quebrar a operação principal.

**Bugs conhecidos:**
- Nenhum. O envio de push de verdade fica pendente de credenciais reais do Firebase.

### Session 10 (Data: 17/07/2026)
**Completado:**
- [x] **Dashboard admin (API)**: `src/models/Dashboard.ts`, `src/controllers/dashboardController.ts`,
  `src/routes/dashboard.ts`, montado em `app.ts` como `/api/dashboard`.
  - `GET /api/dashboard/summary` (só admin) — um único resumo agregado: solicitações abertas/em
    progresso, encomendas aguardando retirada e que chegaram hoje, últimos 5 comunicados. Três
    queries rodando na mesma transação/contexto de tenant (`Promise.all` sobre o mesmo client —
    seguro porque `pg` enfileira internamente, não executa de verdade em paralelo na mesma conexão).
  - Não criou nenhum model/tabela novo — só agrega dados que os módulos anteriores já expõem.

**Verificação feita nesta sessão (contra o Supabase real, com dado acumulado das sessões anteriores):**
- Números do resumo conferidos manualmente contra o estado real do banco (2 solicitações abertas, 1
  encomenda aguardando + 2 que chegaram hoje, 1 comunicado recente) — bateram exatamente.
- Morador e porteiro tentando acessar `/api/dashboard/summary` → 403 nos dois (só admin).

**Com isso, a API inteira da Fase 1 está completa, exceto notificações push:**
- [x] Auth, [x] Solicitações, [x] Encomendas, [x] Comunicados, [x] Chat básico, [x] Dashboard admin.
- [ ] Notificações push (FCM) — único item funcional que falta pra fechar a Fase 1 (API).

**Próximo passo:**
- [ ] Notificações push (FCM) — encomenda chegou, comunicado novo, resposta no chat.
- [ ] Depois disso, a Fase 1 (API) está 100% — resta construir as telas web/PWA (nenhum módulo tem
  tela ainda) e o painel superadmin.

**Decisões técnicas / desvios do plano original:**
- Nenhuma nova.

**Bugs conhecidos:**
- Nenhum.

### Session 9 (Data: 17/07/2026)
**Completado:**
- [x] **Módulo de Chat básico (API)** — último item funcional que faltava da Fase 1 (com
  Solicitações/Encomendas/Comunicados já prontos, só falta Dashboard admin e notificações FCM).
  - Nova tabela `chats` (migration `1700000000012`) — **desvio do schema original do README**: em vez
    de `admin_id` fixo, uso `autor_id` (quem escreveu — morador ou qualquer admin) + `morador_id`
    (dono da thread). O schema original não deixava claro quem era o remetente de cada mensagem.
  - `src/models/Chat.ts`, `src/controllers/chatController.ts`, `src/routes/chats.ts`, montado em
    `app.ts` como `/api/chats`.
  - `POST /api/chats` — morador escreve na própria thread (sempre); admin escreve especificando
    `moradorId` (valida que existe, é do mesmo condomínio e tem role morador).
  - `GET /api/chats` — morador vê a própria thread; admin precisa passar `?moradorId=` (400 se não
    passar). **Sem endpoint separado de "marcar como lido"** — abrir a thread (`GET`) já marca como
    lidas as mensagens do outro lado automaticamente (padrão comum de chat: ler a conversa = enviar
    confirmação de leitura).
  - Porteiro não tem acesso (chat é só morador-admin, como no README).

**Verificação feita nesta sessão (contra o Supabase real):**
- Morador escreve → admin abre a thread (mensagem do morador vira `lido:true` na próxima leitura) →
  admin responde → morador abre (resposta do admin vira `lido:true` na próxima leitura dele).
- Admin sem `moradorId` no `GET` → 400.
- Porteiro tentando acessar → 403.
- Um morador tentando escrever passando o `moradorId` de outro morador → o valor é ignorado, a
  mensagem sempre vai pra própria thread dele (não dá pra "sequestrar" a conversa de outro morador).

**Próximo passo:**
- [ ] **Dashboard admin** e **notificações push (FCM)** — únicos itens funcionais que faltam pra
  fechar a API inteira da Fase 1.
- [ ] Telas web/PWA — nenhum módulo tem tela ainda, só API (Auth, Solicitações, Encomendas,
  Comunicados, Chat).
- [ ] Painel superadmin (tela) e CRUD de condomínio — segue pendente da Session 4.

**Decisões técnicas / desvios do plano original:**
- Schema de `chats` mudou de `admin_id` fixo pra `autor_id` (ver acima) — mais correto pro modelo de
  "morador escreve, qualquer admin responde".

**Bugs conhecidos:**
- Nenhum.

### Session 8 (Data: 17/07/2026)
**Completado:**
- [x] **Módulo de Comunicados (API)**: `src/models/Comunicado.ts`, `src/controllers/comunicadoController.ts`,
  `src/routes/comunicados.ts`, montado em `app.ts` como `/api/comunicados`.
  - `POST /api/comunicados` (só admin — titulo/conteudo).
  - `GET /api/comunicados` / `GET /api/comunicados/:id` (morador/admin/porteiro veem todos os
    comunicados do condomínio — não é escopado por usuário como Solicitações/Encomendas, é mural
    mesmo). Cada item vem com `lido: boolean`, calculado via `LEFT JOIN` em `comunicado_leituras`
    filtrado pelo usuário da request.
  - `POST /api/comunicados/:id/ler` (marca como lido pro usuário atual — idempotente via
    `ON CONFLICT DO NOTHING` na PK composta `(comunicado_id, user_id)`).
- [x] Usa a tabela `comunicado_leituras` criada lá na Session 1 (join table em vez do `lido_por` como
  array que o README original sugeria) — primeira vez que ela é realmente exercitada em código.

**Verificação feita nesta sessão (contra o Supabase real):**
- Admin posta → morador lista (`lido: false`) → morador marca como lido (`lido: true`) → lista de
  novo confirma.
- **Leitura é por usuário, não global**: um segundo morador do mesmo condomínio, que ainda não leu,
  continua vendo `lido: false` no mesmo comunicado.
- Morador tentando `POST` (postar comunicado) → 403 (só admin).
- Morador de outro condomínio não vê o comunicado na listagem (isolamento por RLS, incluindo o join
  com `comunicado_leituras`).

**Próximo passo:**
- [ ] Chat básico, Dashboard admin, notificações push (FCM) — únicos itens funcionais que faltam da
  Fase 1 (Auth, Solicitações, Encomendas, Comunicados já feitos).
- [ ] Telas web/PWA — nenhum módulo tem tela ainda, só API.
- [ ] Painel superadmin (tela) e CRUD de condomínio — segue pendente da Session 4.
- [ ] Notificação de fato (FCM) quando um comunicado novo é postado — hoje só existe o dado, sem
  push.

**Decisões técnicas / desvios do plano original:**
- Nenhuma nova — mesmo padrão de acesso a dados e autorização por role dos módulos anteriores.

**Bugs conhecidos:**
- Nenhum.

### Session 7 (Data: 17/07/2026)
**Completado:**
- [x] **Módulo de Encomendas (API)**: `src/models/Encomenda.ts`, `src/controllers/encomendaController.ts`,
  `src/routes/encomendas.ts`, montado em `app.ts` como `/api/encomendas`.
  - `POST /api/encomendas` (porteiro cadastra — `moradorId`, `descricao?`, `fotoUrl?`; ainda sem
    upload de arquivo de verdade, `fotoUrl` é só uma string por enquanto — infra de storage não
    existe ainda, ver README seção 2).
  - `GET /api/encomendas` (porteiro/admin veem todas do condomínio; morador vê só as próprias).
  - `GET /api/encomendas/:id` (mesma regra de escopo).
  - `POST /api/encomendas/:id/assinar` (só o morador dono assina digitalmente — seta `assinado`,
    `data_assinatura`, `status: retirada`; a checagem de dono é feita no próprio `WHERE morador_id`
    do UPDATE, não em código separado).
- [x] Novo `findUserByIdForTenant` em `User.ts` — lookup de outro usuário dentro do mesmo tenant
  (diferente de `findUserById`, que é só self-lookup pro bootstrap de auth). Usado pra validar que o
  `moradorId` que o porteiro informa existe, é do mesmo condomínio e tem `role = 'morador'`.

**Verificação feita nesta sessão (tudo contra o Supabase real):**
- Porteiro cadastra → morador lista e vê → morador assina (`assinado: true`, `status: retirada`,
  `dataAssinatura` preenchida).
- Outro morador do mesmo condomínio tentando assinar → 404 (não é dono).
- Morador de outro condomínio não vê a encomenda na listagem (isolamento por RLS).
- Morador tentando `POST` (cadastrar) → 403 (só porteiro).
- `moradorId` de um admin (role errado) ou de outro condomínio → 400 nos dois casos.

**Próximo passo:**
- [ ] Comunicados (mesmo padrão de módulo).
- [ ] Chat básico, Dashboard admin, notificações push (FCM), telas web/PWA, painel superadmin —
  seguem pendentes.
- [ ] Upload de arquivo de verdade (foto da encomenda) quando a infra de storage entrar em pauta —
  hoje `fotoUrl` é só um campo de texto.

**Decisões técnicas / desvios do plano original:**
- Nenhuma nova — mesmo padrão de acesso a dados (`withTenantContext`) e de autorização por role já
  estabelecido nos módulos anteriores.

**Bugs conhecidos:**
- Nenhum.

### Session 6 (Data: 17/07/2026)
**Completado:**
- [x] **Renomeado "Chamados" para "Solicitações"** (pedido do usuário — nome mais formal), de ponta a
  ponta: tabela do banco (`chamados` → `solicitacoes`, via migration `1700000000011` de `RENAME`,
  incluindo índices/constraints/FKs — a tabela já tinha dado real, então foi rename, não
  recriação), model (`Solicitacao.ts`), controller (`solicitacaoController.ts`), rotas
  (`solicitacoes.ts`, montada em `/api/solicitacoes`), pasta placeholder do design system web
  (`components/Solicitacoes/`), README.md e CLAUDE.md (descrição do módulo, estrutura de pastas,
  schema, fases). Migrations antigas (histórico já aplicado) não foram alteradas — só a numeração
  nova documenta a mudança de nome.
- [x] Checkpoint Log: entradas históricas (Sessions 1-5) mantidas com o nome antigo onde descrevem o
  que foi feito na época (não reescrevo história); só os itens de "Próximo passo" ainda em aberto da
  Session 5 foram atualizados pro nome novo.

**Verificação feita nesta sessão:**
- `npx tsc --noEmit` limpo depois do rename.
- Grep confirmando que só as migrations antigas (histórico) ainda mencionam "chamado" — nenhum código
  vivo.
- Migration de rename rodada contra o Supabase real; nomes de constraint/index conferidos direto no
  `pg_catalog` antes de escrever a migration (não adivinhados).

**Próximo passo:**
- [ ] Segue tudo que já estava pendente: Encomendas, Comunicados, Chat, Dashboard, notificações FCM,
  telas web/PWA, painel superadmin.

**Decisões técnicas / desvios do plano original:**
- Nenhuma — só rename, sem mudança de comportamento/schema além do nome.

**Bugs conhecidos:**
- Nenhum.

### Session 5 (Data: 17/07/2026)
**Completado:**
- [x] **Módulo de Chamados (API)** — primeiro módulo funcional da Fase 1 depois do Auth:
  `src/models/Chamado.ts`, `src/controllers/chamadoController.ts`, `src/routes/chamados.ts`, montado
  em `app.ts` como `/api/chamados`.
  - `POST /api/chamados` (morador cria — categoria/titulo/descricao).
  - `GET /api/chamados` (lista — morador vê só os próprios, admin vê todos do condomínio).
  - `GET /api/chamados/:id` (detalhe, mesma regra de escopo por role).
  - `PATCH /api/chamados/:id` (só admin — status/prioridade/assigned_to; `data_resolvimento` é
    setada automaticamente quando o status vira `resolvido`, e limpa se for reaberto).
  - Segue exatamente o padrão de acesso a dados que o Auth já usava (`withTenantContext`), então RLS
    protege esse módulo também sem nenhum código extra de segurança.

**Verificação feita nesta sessão (tudo contra o Supabase real, não mock):**
- Morador cria chamado → admin lista e vê → admin resolve (`status: resolvido`, `dataResolvimento`
  preenchida).
- **Isolamento entre tenants**: criado um segundo condomínio de teste + morador nele — não vê o
  chamado do primeiro condomínio na listagem, e recebe 404 tentando acessar por id direto (RLS
  bloqueando de verdade, não só o filtro da query).
- **Isolamento dentro do mesmo tenant**: um segundo morador do mesmo condomínio não vê nem acessa o
  chamado do primeiro morador (isolamento por role, feito na aplicação — RLS só garante o limite do
  condomínio, não filtra por usuário dentro do tenant).
- Morador tentando `PATCH` recebe 403 (só admin pode alterar status/prioridade/atribuição).

**Próximo passo:**
- [ ] Encomendas e Comunicados (mesmo padrão de módulo: model + controller + rotas + RLS de graça).
- [ ] Chat básico, Dashboard admin, notificações push (FCM) — ainda não iniciados.
- [ ] Telas web/PWA — Solicitações (como Auth) ainda só existe como API, sem nenhuma tela.
- [ ] Painel superadmin (tela) e CRUD de condomínio — segue pendente da Session 4.

**Decisões técnicas / desvios do plano original:**
- Nenhuma nova — só aplicação do padrão já decidido (RLS + `withTenantContext`) a um módulo novo.

**Bugs conhecidos:**
- Nenhum.

### Session 4 (Data: 16/07/2026)
**Completado:**
- [x] Decisão de multi-tenancy registrada: **banco único (um projeto Supabase) + `condominio_id` +
  Row Level Security**, não um banco/projeto por cliente — confirmado com o usuário (motivo: custo e
  complexidade operacional escalando por cliente não fazem sentido pro porte do público-alvo). Detalhes
  e trade-offs documentados no README seção 5 ("Multi-tenancy e isolamento de dados").
- [x] **RLS ativado de verdade** — não só `ENABLE ROW LEVEL SECURITY` decorativo: descobri que a role
  `postgres` (usada até então pela API) é superuser e ignora RLS por padrão, então criei uma role
  Postgres restrita (`app_user`, sem `BYPASSRLS`) e o backend passou a rodar toda query tenant-scoped
  dentro de uma transação com `SET LOCAL`/`set_config` setando `app.user_id`/`app.condominio_id`
  (`src/database/tenantContext.ts`). Verificado empiricamente: sem contexto, zero linhas voltam; com
  o contexto certo, só os dados daquele tenant.
- [x] Migrations novas (additivas, banco já tinha migrations aplicadas — não editei as antigas):
  `1700000000008` (role `superadmin` + `condominio_id` opcional só pra ela),
  `1700000000009` (role `app_user` + RLS + policies em `condominios`/`users`/`chamados`/`encomendas`/
  `comunicados`/`comunicado_leituras`), `1700000000010` (fix de um bug real do `set_config` — ver
  Bugs conhecidos).
- [x] Role `superadmin` no schema — sem `condominio_id` (gerencia a plataforma inteira). Sem
  self-registro público; primeira conta criada via `npm run seed:superadmin` (novo script,
  `src/database/seeds/createSuperadmin.ts`). Painel visual (telas) fica pra quando entrarmos na Fase 1
  do frontend admin — só a fundação (schema + regra de acesso) foi construída agora, por decisão
  explícita do usuário.
- [x] `User.ts`/`authController.ts`/`middleware/auth.ts` atualizados pro novo modelo de acesso a dados
  (via `withTenantContext` em vez de `pool.query` direto); removida a checagem de e-mail duplicado
  pré-registro (virou responsabilidade só do Supabase Auth — fazia uma leitura cross-tenant sem
  contexto, que não tem mais como existir com RLS).

**Verificação feita nesta sessão:**
- Todo o fluxo de Auth reexecutado contra o Supabase real depois da mudança: register → login → me →
  refresh, todos OK com RLS ativo. Também testado o bootstrap do superadmin (seed → login → `/me`
  retornando `role: superadmin`, `condominioId: null`).
- Testes manuais diretos no Postgres confirmando que RLS bloqueia (0 linhas sem contexto) e libera
  (linha certa) com o `SET LOCAL` certo.

**Bug real encontrado e corrigido:** `set_config('app.condominio_id', NULL, true)` grava **string
vazia**, não `NULL` de verdade — então `current_setting(...)::uuid` quebrava com "invalid input syntax
for type uuid" toda vez que o contexto não tinha `condominio_id` (caso do self-lookup de usuário, ex.
`/me`, `authenticate`). Corrigido com `NULLIF(current_setting(...), '')::uuid` em todas as policies
(migration `1700000000010`) e passando `''` em vez de `null` no `tenantContext.ts`.

**Próximo passo:**
- [ ] Segue tudo que já estava pendente: módulos funcionais (Chamados, Encomendas, Comunicados, Chat,
  Dashboard, notificações FCM), telas web/PWA, componentes React do design system.
- [ ] **Painel superadmin (tela):** quando começar o frontend admin de verdade, construir a tela de
  criar/listar/gerenciar condomínios (a API/schema já existe — falta só a UI e os endpoints REST de
  CRUD de condomínio, que também não foram criados ainda, só a permissão de role).
- [ ] Quando os módulos de Chamados/Encomendas/Comunicados forem implementados, seguir o mesmo padrão
  de acesso a dados via `withTenantContext(req.user, ...)` em vez de `pool.query` direto — é o que
  garante que RLS protege esses módulos também.

**Decisões técnicas / desvios do plano original:**
- Confirmado com o usuário: banco único + RLS em vez de banco por cliente (ver acima).
- `condominios` ganhou RLS com policy de leitura por tenant (qualquer usuário pode ler o próprio
  condomínio); escrita em `condominios` fica só pra role privilegiada (superadmin/migrations).
- `app_user` (role restrita) precisa de duas connection strings distintas no `.env`: `DATABASE_URL`
  (privilegiada, só migrations) e `APP_DATABASE_URL` (restrita, runtime da API) — isso é permanente,
  não uma migração temporária.

**Bugs conhecidos:**
- Nenhum em aberto — o bug do `set_config`/`NULLIF` foi encontrado e corrigido na própria sessão.

### Session 3 (Data: 16/07/2026)
**Completado:**
- [x] Projeto Supabase real conectado (`myiopwypyujfwzovkfyh`) e **fluxo de Auth testado ponta a ponta pela primeira vez**: `register` (201, cria usuário no Supabase Auth + perfil em `users`) → `login` (200) → `GET /api/auth/me` (200, resolve role/condominio via JWKS + lookup no banco) → `refresh` (200, rotaciona tokens) → `logout` (204) → `refresh` com o token revogado → 401, como esperado.
- [x] Todas as 6 migrations rodaram com sucesso contra o Postgres do Supabase (`condominios`, `users`, `chamados`, `encomendas`, `comunicados`, `comunicado_leituras`) e o seed criou o condomínio de teste.

**Dois bugs de ambiente encontrados e corrigidos:**
- **Conexão direta do Supabase (`db.<projeto>.supabase.co:5432`) só resolve em IPv6** — nesta rede/ambiente isso dá `ETIMEDOUT`. Corrigido usando a connection string do **Transaction Pooler** (`aws-<n>-<regiao>.pooler.supabase.com:6543`, usuário `postgres.<project-ref>`), que tem host IPv4. Documentado no README seção 8.
- **`node-pg-migrate` não carregava as migrations `.ts`** (`Cannot use import statement outside a module`) porque a flag `-j ts` sozinha não registra nenhum loader de TypeScript — precisa da flag `--tsx` (ou `--ts-node` + `--tsconfig`) explicitamente. Corrigido adicionando `--tsx` nos scripts `migrate`/`migrate:down` do `apps/backend/package.json` (já tínhamos `tsx` como dependência) e removida a dependência `ts-node`, que ficou sem uso.
- Senha do Postgres continha `@` e `+` — precisou de URL-encode (`%40`, `%2B`) na `DATABASE_URL`, senão o parser da connection string quebra o usuário/host no lugar errado.

**Próximo passo:**
- [ ] Segue tudo que já estava pendente: módulos funcionais (Chamados, Encomendas, Comunicados, Chat, Dashboard, notificações FCM), telas web/PWA, implementação real dos componentes React do design system, RLS como hardening futuro se o Postgres vier a ser exposto direto pro frontend.
- [ ] Ficou um usuário de teste (`teste.morador.*@sinndico.dev`) no Supabase Auth do projeto — remover no painel se quiser um ambiente limpo antes de convidar usuários de verdade.

**Decisões técnicas / desvios do plano original:**
- Nenhuma decisão de arquitetura nova — só correções de configuração de ambiente (pooler + `--tsx`) pra fazer o que já tinha sido desenhado na Session 2 funcionar de verdade.

**Bugs conhecidos:**
- Nenhum. O fluxo de Auth foi validado ponta a ponta contra o Supabase real nesta sessão.

### Session 2 (Data: 16/07/2026)
**Completado:**
- [x] Decisão de hospedagem registrada: **Hostinger** (app) + **Supabase** (Postgres gerenciado + Auth), pela integração oficial entre as duas e por Supabase ser Postgres (encaixa no schema relacional já existente, ao contrário do MongoDB Atlas, outra opção oferecida pela Hostinger).
- [x] **Auth migrado de custom (bcrypt + JWT próprio) para Supabase Auth (GoTrue)**: `register`/`login`/`refresh`/`logout`/`me` continuam com o mesmo contrato de rota, mas agora o motor por baixo é o Supabase — `supabaseAdmin.auth.admin.createUser` (registro), `supabaseAuth.auth.signInWithPassword` (login), `supabaseAuth.auth.refreshSession` (refresh), `supabaseAdmin.auth.admin.signOut` (logout, revoga a sessão via access token no header `Authorization`).
- [x] Verificação de token no backend via **JWKS** (`jose` + `createRemoteJWKSet`, sem round-trip pro Supabase a cada request) em `src/services/authTokenService.ts`.
- [x] Migration `users` ajustada: sem `senha_hash`, `id` agora referencia `auth.users(id)` do Supabase (é o mesmo id, cascade on delete). Migration e model `refresh_tokens`/`RefreshToken.ts` removidos — sessão é gerenciada pelo Supabase, não precisamos mais rastrear/revogar isso na nossa base.
- [x] `docker-compose.yml`: removido o serviço `postgres` (dev também usa projeto Supabase real agora, não container local); ficou só `redis`.
- [x] `.env.example` (backend e web) e README/CLAUDE.md atualizados para as novas variáveis (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` agora apontando pro Postgres do Supabase).

**Verificação feita nesta sessão:**
- `npx tsc --noEmit` limpo em `apps/backend` após a reescrita.
- Grep confirmando que nada mais referencia `jwtService`, `RefreshToken`, `bcrypt` ou `refresh_tokens`.
- `npm install` resolvendo `@supabase/supabase-js` e `jose` sem conflito.
- **Não foi possível testar `signUp`/`signIn`/`refresh`/`logout` de verdade** — não existe ainda um projeto Supabase real com credenciais configuradas neste ambiente.

**Próximo passo:**
- [ ] **Ação do usuário:** criar o projeto no supabase.com, colar `DATABASE_URL`/`SUPABASE_URL`/`SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY` no `.env` do backend, rodar `npm run migrate` e `npm run seed`, depois testar o fluxo completo (register morador e admin → login → `GET /api/auth/me` → refresh → logout) contra o Supabase de verdade. Reportar qualquer erro — em especial checar a assinatura exata de `supabaseAdmin.auth.admin.signOut` contra a versão instalada de `@supabase/supabase-js` (a documentação consultada teve sinais conflitantes sobre o parâmetro).
- [ ] Confirmar no painel do Supabase se o projeto novo usa chaves de assinatura assimétricas (JWKS) — é o padrão atual, mas se for um projeto legado com JWT secret simétrico (HS256), `src/services/authTokenService.ts` precisa de ajuste.
- [ ] Avaliar mais pra frente: ativar Row Level Security (RLS) nas tabelas se o Postgres do Supabase vier a ser exposto direto pro frontend — hoje não é o caso (só o backend Express acessa o banco), então RLS não foi implementado, mas fica como hardening recomendado.
- [ ] Segue tudo mais que já estava pendente da Session 1: módulos funcionais (Chamados, Encomendas, Comunicados, Chat, Dashboard, notificações FCM), telas web/PWA, implementação real dos componentes React do design system.

**Decisões técnicas / desvios do plano original:**
- Supabase escolhido em vez de MongoDB Atlas (ambos com integração oficial na Hostinger) — o domínio do Sinndico é relacional (FKs, tabela de junção `comunicado_leituras`, integridade condomínio/usuário/chamado), o que não se beneficiaria de um banco de documentos.
- Auth migrado pra Supabase Auth em vez de manter o módulo custom da Session 1 — decisão explícita do usuário, mesmo custando o retrabalho do que tinha sido construído.
- Identidade do usuário agora vive em duas tabelas: `auth.users` (Supabase, gerencia email/senha/sessão) e `public.users` (nosso perfil de negócio: role, condominio_id, apto, telefone), ligadas pelo mesmo `id`.
- RLS não foi ativado — decisão consciente de manter a autorização centralizada no middleware Express (`authorize`) por enquanto, já que o Postgres não é acessado direto por nenhum client além do nosso backend.

**Bugs conhecidos:**
- Nenhum bug confirmado — mas, como não há projeto Supabase real conectado ainda, o fluxo de Auth (incluindo a chamada de `admin.signOut` no logout) não foi validado ponta a ponta. Tratar como não testado até a verificação do usuário.

### Session 1 (Data: 16/07/2026)
**Completado:**
- [x] `docs/DESIGN_SYSTEM.md`: tokens de cor (claro/escuro), tipografia, espaçamento/raio/elevação, spec dos componentes base (botão, card, input, badge, toggle de tema) e motion — tudo conforme README seção 3.
- [x] Monorepo com npm workspaces (`apps/*`): `apps/backend` funcional (ver abaixo), `apps/web` com scaffold Vite+React+TS+Tailwind (tokens do design system já plugados via CSS variables + `tailwind.config.ts`, tema claro/escuro funcionando via `data-theme` + `prefers-color-scheme`), `apps/mobile` só com placeholder de estrutura de pastas (implementação funcional fica pra quando o PWA entrar em pauta, mais adiante na Fase 1). `docker-compose.yml` na raiz com Postgres 16 + Redis 7.
- [x] Backend: Node + TypeScript + Express, `pg.Pool` de conexão, middlewares (`helmet`, `cors`, `morgan`, `errorHandler`, `asyncHandler`), rota `GET /health` (testada manualmente — retorna 200 com banco up e 503 com banco down).
- [x] Migrations (`node-pg-migrate`, SQL via `pgm`) para as entidades da Fase 1: `condominios`, `users`, `refresh_tokens`, `chamados`, `encomendas`, `comunicados`, `comunicado_leituras`.
- [x] Auth completo: `POST /api/auth/register` (morador/admin), `POST /api/auth/login`, `POST /api/auth/refresh` (com rotação — revoga o token antigo e emite um novo), `POST /api/auth/logout`, `GET /api/auth/me` (protegida). Middleware `authenticate`/`authorize(...roles)`. Senhas com `bcrypt`; refresh tokens são JWT assinados com secret próprio e also armazenados hasheados (SHA-256) em `refresh_tokens` pra permitir revogação.
- [x] Seed script (`npm run seed` no backend) que cria um condomínio de teste, necessário porque o registro de usuário exige um `condominio_id` existente e ainda não há CRUD de condomínio nesta fase.

**Verificação feita nesta sessão:**
- `npx tsc --noEmit` limpo em `apps/backend` e `apps/web`.
- `npx vite build` gerando o bundle de `apps/web` sem warnings (corrigido um warning de ordem de `@import` no CSS).
- Backend subiu com `tsx` e respondeu corretamente: `GET /health` → 503 (banco indisponível, como esperado) e `POST /api/auth/login` → 500 tratado pelo `errorHandler` (também esperado, sem banco).
- **Não foi possível testar o fluxo completo de Auth contra um Postgres real** — o ambiente onde essas mudanças foram feitas não tem Docker nem PostgreSQL instalado. O `docker-compose.yml` está pronto, mas ainda não foi validado de fato subindo os containers.

**Próximo passo:**
- [ ] **Ação do usuário:** com Docker Desktop instalado e rodando, executar `docker compose up -d`, depois `npm install` na raiz, `npm run migrate` (roda as migrations no backend) e `npm run seed --workspace=apps/backend`, e então `npm run dev:backend` — validar o fluxo completo: register (morador e admin) → login → `GET /api/auth/me` com o access token → refresh → logout → confirmar que o refresh revogado não funciona mais. Reportar qualquer erro encontrado.
- [ ] Módulos funcionais restantes da Fase 1 (ainda não iniciados): Chamados, Encomendas, Comunicados, Chat básico, Dashboard admin, Notificações push (FCM).
- [ ] Telas web (React) e mobile (PWA) — hoje só existe o scaffold, sem nenhuma tela funcional além da home placeholder.
- [ ] Implementação real dos componentes React do design system (Botão, Card, Input, Badge, ThemeToggle) em `apps/web/src/components` — hoje `docs/DESIGN_SYSTEM.md` só tem a especificação.

**Decisões técnicas / desvios do plano original:**
- Adicionada a tabela `condominios` (não estava explícita na seção 5 do README) — necessária como FK de `users.condominio_id` e para o modelo de negócio multi-tenant (SaaS por condomínio).
- Adicionada a tabela `refresh_tokens` — necessária pra revogação de refresh tokens (rotação no `/refresh`, invalidação no `/logout`).
- `comunicados.lido_por` (descrito no README como "array de user_ids ou relação separada") foi implementado como tabela de junção `comunicado_leituras (comunicado_id, user_id, lido_em)` em vez de array — normalização mais correta pra um relacional.
- PKs como `uuid` (`gen_random_uuid()`, extensão `pgcrypto`) em vez de serial/int, e enums via `CHECK constraint` em vez de `CREATE TYPE ENUM` do Postgres (mais simples de alterar depois).
- Framework HTTP: Express. Camada de dados: `pg` + `node-pg-migrate` (SQL puro, sem ORM). Confirmado com o usuário no início da sessão.
- `role: porteiro` existe no schema mas não tem rota de auto-registro — contas de porteiro serão criadas pelo admin em uma sessão futura (não fazia parte do pedido "registro e login de morador e admin").
- Registro de usuário exige `condominioId` de um condomínio já existente (não há ainda fluxo de criação de condomínio) — por isso o seed script `npm run seed`.

**Bugs conhecidos:**
- Nenhum bug — mas o fluxo de Auth ainda não foi validado ponta a ponta contra um Postgres real (ver "Próximo passo" acima). Rodar antes de considerar o módulo Auth definitivamente pronto.
