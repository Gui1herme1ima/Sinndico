# Roadmap

**Regra de fatiamento (Fase 4 em diante):** uma fatia = uma sessão de desenvolvimento; seguir a
ordem numérica; não pular fatia nem antecipar fatia futura sem confirmação explícita do usuário.
Ao concluir uma fatia, ver a regra de commit obrigatório em CLAUDE.md.

## Fases 1-3 (concluídas)

Roadmap funcional completo já implementado:

- **Fase 1 (MVP):** Auth, Solicitações, Encomendas, Comunicados, Chat básico, Dashboard admin, Notificações push.
- **Fase 2:** Visitantes, Comida/Delivery.
- **Fase 3:** Áreas comuns, Assembleia/votação.

Detalhe de cada módulo: `docs/escopo.md`. Schema/arquitetura: `docs/arquitetura.md`.

## Fase 4 — Robustez e Expansão (em andamento)

Evolui o Sinndico de MVP para produto robusto. A fundação de UX (Bloco A) vem **antes** de
qualquer módulo novo — não começar módulo do Bloco C sem o Bloco A estar pronto.

> Nota de numeração: esta "Fase 4 — Robustez e Expansão" substitui, na prática, a antiga "Fase 4:
> Polish + Deployment" original do projeto. Testes/otimização/deploy continuam válidos e aparecem
> diluídos nas fatias abaixo (ex.: 4.1 é auditoria de performance).

### Bloco A — Fundação de UX (base pra todo o resto)

- **Fatia 4.1 — Auditoria e correção de performance.** Lazy loading de rotas (code splitting),
  cache/prefetch com a lib de data-fetching atual, eliminar re-renders desnecessários. Medir com
  Lighthouse + React Profiler antes e depois. ✅ Concluída.
- **Fatia 4.2 — Componente de listagem padrão (base + 2 telas).** Tabela/lista reutilizável com
  busca, filtros (status/categoria/data), ordenação e paginação. Construir o componente e aplicar em
  Solicitações e Encomendas.
- **Fatia 4.3 — Rollout da listagem padrão.** Aplicar o componente da 4.2 em Visitantes, Comida,
  Reservas e Moradores. ✅ Concluída.
- **Fatia 4.4 — Seletor de moradores com busca.** Substituir todo campo de UUID cru por seletor com
  busca (nome/apto). Em Encomendas e Chat já existe (`GET /api/users/diretorio`); estender pra
  Comida e Visitantes e padronizar o componente entre as quatro telas. ✅ Concluída.
- **Fatia 4.4.1 — Alinhar listagem existente ao spec visual.** `docs/UX_SPEC_FASE4.md` §2 (referência:
  `docs/mockup-fase4.html`) chegou depois das fatias 4.2/4.3 — reconstruído `ListToolbar` (pill de
  filtro via `FilterPill` em vez de `Select` nativo), trocado card-list empilhado por `DataTable`
  densa dentro de um card único (coluna Morador com residência em mono resolvida client-side via
  diretório, coluna Ações compacta reproduzindo as mutations que antes viviam nos cards — linha
  clicável/selecionada fica pronta no componente mas não é ativada nesta fatia, sem drawer ainda),
  `Pagination` em pills numeradas "Mostrando X–Y de Z", `EmptyState` com ícone do módulo + CTA
  "Limpar filtros". Aplicado nas 6 telas: Solicitações, Encomendas, Visitantes, Comida, Reservas,
  Moradores (com `EditarMoradorModal` extraído do antigo card de edição inline). ✅ Concluída.
- **Fatia 4.5 — Polimento visual.** Ícones faltantes na nav (Comida, Dashboard, Cadastros), empty
  states ilustrados com call-to-action, skeleton loading em todas as listas, revisão de
  espaçamento/grid (hoje sobra espaço vazio). Testar nos dois modos (claro/escuro). ✅ Concluída.
- **Fatia 4.6 — Drawer de detalhe.** Detalhe de item em drawer lateral em vez de expandir inline,
  como padrão reutilizável nas listas do Bloco A. ✅ Concluída.
- **Fatia 4.7 — Central de notificações in-app.** Sino no header com badge de não lidas, alimentado
  pelos mesmos eventos que já disparam push. ✅ Concluída.
- **Fatia 4.7.1 — Protótipo de direção visual (redesign).** Usuário considera o frontend atual
  simples demais (layout genérico, pouco acabamento, dashboard/dados pouco expressivos — feedback
  de 2026-07-19). Antes de aplicar qualquer redesign em código, produzir 3 páginas HTML estáticas
  (sem wiring com o app) comparando direções, cada uma aplicando Dashboard + uma tela de listagem
  (ex.: Solicitações) com dados de exemplo:
  - **A — Elevação em camadas + acentos decorativos** (recomendada na sessão): escala real de
    sombra/elevação com hover, halo de cor atrás de números de destaque (reaproveita o ponto âmbar
    da logo), gradiente sutil de fundo, animação de entrada (contagem animada nos StatTiles,
    fade+slide), hover mais expressivo em cards/linhas de tabela. Usa só os tokens já existentes em
    `docs/DESIGN_SYSTEM.md` — risco de implementação baixo.
  - **B — Bento-grid + glass**: grid assimétrico tipo bento-box, superfícies com leve blur/glass.
    Mais tendência visual do momento, mas tensiona com a diretriz do próprio design system
    ("fugindo dos clichês de SaaS gerado por IA") e blur arrisca contraste em claro/escuro.
  - **C — Editorial tipográfico**: menos caixas/cards, hierarquia via tipografia grande (Space
    Grotesk) e divisores finos, dados em destaque com JetBrains Mono, sparklines inline nos
    StatTiles. Visual distinto e sóbrio, mudança estrutural maior que A.

  Usar a skill `frontend-design` na produção dos 3 protótipos. Usuário escolhe uma direção (ou
  pede ajustes) comparando as 3 páginas lado a lado antes de qualquer fatia aplicar a direção
  escolhida no app de verdade. ✅ Concluída — protótipos em
  `docs/prototipos/fatia-4.7.1-direcoes.html`, direção **A (elevação em camadas + acentos
  decorativos)** escolhida em 2026-07-19.

  Depois da escolha, usuário achou o resultado ainda "muito tech" (mono/dados crus, ícones/paleta
  frias, falta de calor humano, densidade de informação) e pediu variações mantendo a direção A.
  Duas rodadas de refinamento no mesmo protótipo:
  - **Ajuste** (tentativa 1, descartada por sutil demais): mono só em dado técnico, ícone com traço
    mais grosso, mais respiro.
  - **Reformulação moderada** (tentativa 2, **✅ aprovada** em 2026-07-19 — é a versão atual do
    protótipo): dashboard vira resumo narrativo do dia em vez de grid frio de números; StatTile com
    fundo tintado por tema em vez de card branco uniforme.
  - **D — repaginação grande** (só comparação, pedida pelo usuário "pra ver como ficaria"):
    Solicitações vira feed de cards com avatar colorido por morador em vez de tabela. **Descartada**
    — trocaria a `DataTable`/`ListToolbar`/`Pagination` já reaproveitada em 6 telas (fatia
    4.2-4.4.1), custo alto sem ganho proporcional. Fica no protótipo só como referência histórica.

- **Fatia 4.7.2 — Aplicar a direção A reformulada no app de verdade.** Levar pro código React o que
  está validado em `docs/prototipos/fatia-4.7.1-direcoes.html` (cena "A", versão atual — abrir e
  clicar em "A · Elevação" no toolbar do protótipo pra ver exatamente o resultado esperado).
  Escopo obrigatório:
  - **Dashboard (`DashboardPage.tsx`):**
    - Faixa "hero" no topo substituindo o cabeçalho atual: saudação (“Bom dia, {nome}”) + frase
      narrativa resumindo o dia a partir dos dados já retornados por `dashboardApi.getSummary()`
      (ex.: "Hoje você tem X encomendas te esperando e Y solicitações em aberto") + ícone/ilustração
      grande em círculo à direita. Fundo em gradiente diagonal sutil usando `color-mix()` sobre
      `--color-primary`/`--color-accent` (nada de hex novo).
    - `StatTile`: fundo tintado por tema (`color-mix(--color-accent/--color-primary, ~8%, surface)`,
      borda tintada ~24%), ícone de domínio existente (`icons.tsx`) em badge circular 44px (tint
      ~20%), número, label em minúsculo, nova linha de contexto ("foot": ex. "aguardando resposta",
      "já sendo resolvidas"). Alternar tint accent/primary por tile como no protótipo.
    - Comunicados recentes: ícone circular tintado (`ComunicadoIcon`) antes do texto de cada item;
      trocar a data absoluta por `formatRelativeTime` (já existe, `apps/web/src/lib/formatRelativeTime.ts`,
      construído na fatia 4.7) em vez de `formatDate` puro — pode manter a data absoluta em `title`
      pra quem passar o mouse.
  - **Telas de listagem que usam `DataTable`/`ListToolbar`/`Pagination`** (Solicitações, Encomendas,
    Visitantes, Comida, Reservas, Moradores — o padrão da fatia 4.2-4.4.1): manter a estrutura de
    tabela como está (não virar feed/cards — isso foi avaliado e descartado, ver acima). Aplicar só:
    - Coluna de identificador vira "Protocolo" com número simples (sem `#`, sem fonte mono) no lugar
      do UUID truncado cru.
    - Coluna de data usa `formatRelativeTime` em vez de `formatDate` mono.
    - Ajuste de tipografia/espaçamento geral: `font-size` base um pouco maior nessas telas, mais
      padding em card/linha de tabela, botões `md` com 44px de altura, ícones com `stroke-width`
      mais grosso (era 2, protótipo usa 2.3) — decidir se isso vira o novo padrão global do design
      system ou fica só nessas telas (ver sugestão opcional 3 abaixo).
  - **Modo claro e escuro obrigatórios** — os tints usam `color-mix()` sobre tokens que já trocam
    por tema, então testar os dois antes de considerar a fatia concluída (regra do `CLAUDE.md`).
  - Não mexer no Bloco B/C nem em nenhum outro módulo — escopo é só a camada visual (Bloco A) que
    já estava em andamento.

  **Sugestões opcionais pra essa fatia (fora do escopo obrigatório acima — só entram com aprovação
  explícita do usuário antes de codar cada uma):**
  - [ ] Contagem animada nos números do `StatTile` (o protótipo já tem isso via
    `requestAnimationFrame`, `docs/DESIGN_SYSTEM.md` seção 8 já prevê motion assim) — dá vida ao
    dashboard sem custo de acessibilidade se respeitar `prefers-reduced-motion`.
  - [ ] Promover `stroke-width` mais grosso (2.3) e ícone de domínio maior a padrão **global** do
    design system, não só nas telas do Bloco A — implica atualizar `docs/DESIGN_SYSTEM.md` seção 4
    e revisar todo lugar que já usa `icons.tsx` (nav, headers, badges) pra manter consistência.
  - [ ] Aplicar o hero narrativo também nos dashboards do porteiro e do morador quando forem
    construídos (fatias 4.9/4.10) — deixar como padrão do template de dashboard, não só do admin.
  - [ ] Renomear "Nº"/ID pra "Protocolo" de forma consistente em Encomendas/Visitantes/Comida
    também (não só Solicitações), já que a ideia de humanizar o identificador vale pro produto
    inteiro, não só pra uma tela.
  - [ ] Passar um pente fino de microcopy nos empty states/loading states das outras telas pra bater
    com o tom mais caloroso da frase narrativa do hero (hoje cada tela tem o texto que foi escrito
    na fatia em que nasceu, sem revisão de tom unificada).

### Bloco B — Dashboard rico

- **Fatia 4.8 — Dashboard admin.** Gráficos com Recharts: solicitações por status e por categoria
  ao longo do tempo, ocupação de áreas comuns, encomendas por dia. Feed de atividade recente +
  atalhos rápidos. Inadimplência fica placeholder até o Financeiro existir (Bloco C).
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

## Fase 5+ — Melhorias contínuas (sem fatiamento definido ainda)

Integração com fechadura inteligente, leitura de hidrômetro (OCR), app nativo iOS/Android, BI/relatórios avançados, SMS como fallback de notificação.

## Estado atual e histórico

Estado atual do projeto (fatia em andamento, decisões técnicas, bugs conhecidos): ver a entrada
mais recente (topo) de `docs/CHECKPOINT_HISTORY.md`. Não há mais um bloco "Estado atual" em texto
livre no CLAUDE.md — o histórico vive nos commits (`git log`) e no CHECKPOINT_HISTORY.md.
