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

<!-- Claude Code: adicione novas entradas abaixo desta linha, sempre no topo (mais recente primeiro) -->

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
