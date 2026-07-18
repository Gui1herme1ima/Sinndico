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

1. **Sobrescrever** (não acrescentar) a seção `## 8. Estado atual` deste arquivo com o estado mais recente: em que fatia/fase o projeto está, o que foi concluído na sessão, o próximo passo, decisões técnicas relevantes e bugs conhecidos em aberto. Este bloco deve ficar **curto o bastante pra ler em menos de 1 minuto** — nada de histórico de sessões anteriores aqui.
2. Adicionar o registro detalhado da sessão (mesmo formato de sempre, ver abaixo) no **topo** de `docs/CHECKPOINT_HISTORY.md`. É aí que mora o histórico completo, sessão a sessão — CLAUDE.md nunca acumula esse detalhe.

Ao **iniciar** uma nova sessão, ler primeiro a seção `## 8. Estado atual` (rápido). Só abrir
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

## 8. Estado atual

> Atualizado em 18/07/2026, fim da Session 30. Histórico completo sessão a sessão em
> `docs/CHECKPOINT_HISTORY.md`.

- **Reformulação de acesso — as 6 fatias do roadmap estão completas** (iniciada Session 25, fechada
  nesta sessão): fim do auto-registro livre, modelo hierárquico (superadmin cria condomínio+primeiro
  admin; admin cadastra tudo o mais; morador só recebe acesso via e-mail de boas-vindas); Residências;
  Moradores e Equipe; barra lateral agrupada; acesso do porteiro configurável por módulo; importação
  em massa (CSV/XLSX) de residências e moradores. Detalhe de cada fatia em
  `docs/CHECKPOINT_HISTORY.md` (Sessions 25-29).
- **Infra real:** Supabase conectado (Postgres + Auth) via Transaction Pooler. Multi-tenancy de verdade
  (banco único + `condominio_id` + RLS, role `app_user` restrita). Hospedagem alvo: Hostinger + Supabase.
- **Módulos operacionais da Fase 1/2/Áreas Comuns completos** (API + tela, testados ponta a ponta):
  Solicitações, Encomendas, Comunicados, Chat, Dashboard admin, Notificações push (FCM), Visitantes,
  Comida/Delivery, Áreas Comuns/Reservas. Brand kit integrado desde a Session 21.
- **Firebase configurado, envio real de push ainda não confirmado ponta a ponta** — falta um device
  token de verdade.
- **`apps/web` ganhou a dependência `xlsx` (SheetJS) instalada direto do CDN oficial deles**
  (`https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`), não do npm registry — a versão publicada no
  npm (`0.18.5`) está travada com 2 vulnerabilidades high (prototype pollution + ReDoS) sem fix ali;
  o próprio SheetJS recomenda instalar builds corrigidas via CDN deles. Decisão confirmada
  explicitamente pelo usuário antes de instalar (URL externa, fora do npm registry).
- **Login fixo de teste** (condomínio "Condominio Teste", slug `teste`): usuário `admin`, senha
  `Admin123!`.
- **Fase 3 antiga completa**: módulo de Assembleia/Votação implementado (`assembleias`/`votos`,
  admin convoca → abre votação → encerra, morador vota uma vez por assembleia, contagem em tempo real
  faz o papel de "ata automática"). Com isso o roadmap funcional inteiro do README está implementado.
- **Diretório real de morador**: `GET /api/users/diretorio` (novo, admin + porteiro, devolve só
  `{id, nome, residencia}`) substituiu os campos de UUID cru em `CreateEncomendaForm` (porteiro) e
  `ChatPage` (admin) por um `<Select>` de verdade.
- **Todos os itens que estavam registrados como pendentes no início desta sessão foram concluídos** —
  não há mais nenhum item de roadmap funcional em aberto. Próximas direções (RBAC mais granular,
  papéis nomeados livremente, integração de push real, etc.) ficam pra quando o usuário priorizar.
- **Verificação pendente do usuário**: Fatias 5 e 6 (Session 29), o módulo de Assembleia e o diretório
  de morador foram testados via API real (todos passaram) mas a verificação de UI (Playwright) não foi
  conferida nesta sessão — usuário pediu pra completar tudo primeiro e testar manualmente no final.
- **Próximo passo:** nenhum item pendente conhecido. Aguardar prioridade do usuário.
