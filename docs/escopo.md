# Escopo do produto

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

Schema de dados e endpoints: ver `docs/arquitetura.md`.

## 3. Identidade Visual — REGRA OBRIGATÓRIA

O visual é um pilar do produto, não um detalhe secundário. Antes de implementar qualquer tela nova, siga esta identidade visual:

- **Cor primária:** verde-petróleo profundo (`#146C5B`, variante `#2ED9A8` no modo escuro). Não substituir por azul corporativo genérico nem pelos clichês de design gerado por IA (creme+terracota, preto+verde ácido).
- **Modo claro e escuro:** obrigatórios desde a primeira tela construída, via CSS variables/design tokens — nunca implementar um modo primeiro e "adicionar" o outro depois.
- **Tipografia:** Space Grotesk/Sora (display) + Inter/Manrope (corpo) + JetBrains Mono (dados/utilitário).
- **Animações:** fluidas e propositais (transições de página, reveal de cards, feedback tátil em botões, skeleton loading), sempre respeitando `prefers-reduced-motion`. Evitar excesso de efeitos decorativos sem função.
- **Antes de codar qualquer módulo funcional:** garantir que o design system básico (`docs/DESIGN_SYSTEM.md`: cores, tipografia, botão, card, input, badge, toggle de tema) já existe. Se não existir, criar primeiro.
- **Todo componente novo deve ser visualmente testado em ambos os modos (claro/escuro) antes de ser considerado concluído.**
- **Arquivos-fonte do brand kit** (logo/símbolo em SVG, ícones de domínio, `tokens.json` machine-readable) vivem em `brand-assets/` na raiz — complementa `docs/DESIGN_SYSTEM.md` (a especificação escrita). Integrado ao código do app (`apps/web`) desde a Session 21.

Se o usuário não especificar identidade visual em uma tarefa nova, use os tokens acima por padrão — não invente nova paleta sem perguntar.

## 4. Detalhes de estado do produto

Estado atual de implementação, decisões técnicas em aberto e bugs conhecidos: `docs/CHECKPOINT_HISTORY.md` (entrada mais recente, no topo).
