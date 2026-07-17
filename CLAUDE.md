# CLAUDE.md — Sinndico (Plataforma de Gestão Condominial)

> Este arquivo orienta o Claude Code sobre o projeto. Leia por completo antes de qualquer alteração de código.

## 1. O que é o Sinndico

Sinndico é um SaaS de gestão condominial que centraliza a comunicação entre morador, diretoria/síndico e portaria. Substitui WhatsApp, caderno de portaria e planilhas soltas por um sistema único, rastreável e auditável.

**Público-alvo:** síndicos profissionais, administradoras condominiais, condomínios com 20+ unidades.
**Modelo de negócio:** assinatura mensal por condomínio, escalada pelo número de unidades.

## 2. Módulos do sistema (visão funcional)

1. **Chamados** — morador abre chamado (manutenção, segurança, animal invasor, outros), admin gerencia status e prioridade.
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

- Backend: Node.js + Express/Fastify + TypeScript, PostgreSQL + Redis
- Web admin: React + TypeScript + Tailwind
- Mobile morador: PWA (prioridade) — React Native como evolução futura
- Notificações: Firebase Cloud Messaging
- Auth: JWT + refresh token

## 5. Ordem de desenvolvimento (fases)

Sempre seguir a ordem abaixo. Não pular fase nem implementar módulo de fase futura antes da atual estar funcional e testada.

- **Fase 1 (MVP):** Auth, Chamados, Encomendas, Comunicados, Chat básico, Dashboard admin, Notificações push.
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

### Session 1 (Data: a definir)
**Completado:**
- (aguardando início do desenvolvimento)

**Próximo passo:**
- [ ] Setup inicial do monorepo (apps/backend, apps/web, apps/mobile)
- [ ] Criar design system básico em `docs/DESIGN_SYSTEM.md` (cores, tipografia, componentes base — ver seção 3 deste arquivo) antes de qualquer tela funcional
- [ ] Configurar PostgreSQL + migrations iniciais (schema do README)
- [ ] Implementar Auth (login/registro morador e admin, JWT)

**Decisões técnicas / desvios do plano original:**
- Nenhuma ainda.

**Bugs conhecidos:**
- Nenhum ainda.
