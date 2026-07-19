# UX Spec — Fase 4 (referência visual obrigatória)

> Este documento acompanha `mockup-fase4.html` (abrir no navegador; tem toggle claro/escuro e 3
> telas). O mockup usa EXATAMENTE os tokens de `apps/web/src/styles/tokens.css` e as fontes do
> `docs/DESIGN_SYSTEM.md` — ele é a referência visual das fatias 4.2, 4.5, 4.6, 4.8 e 4.11.
> Onde este spec e o DESIGN_SYSTEM.md conflitarem, o DESIGN_SYSTEM.md vence (não deve haver
> conflito; este spec só ADICIONA padrões de layout, não muda token nenhum).

## 1. Estrutura geral de página (todas as telas)

- Grid da aplicação: header 60px no topo (full-width) + sidebar 240px fixa + conteúdo fluido.
- Header: logo + nome do condomínio ativo (separado por borda vertical) à esquerda; sino de
  notificações com badge âmbar de não-lidas (fatia 4.7), toggle de tema e usuário à direita.
- Sidebar: todo item TEM ícone (outline 2px, 24px grid, currentColor — spec §4 do DESIGN_SYSTEM).
  Itens com pendência mostram contador à direita em JetBrains Mono (ex.: Solicitações "12").
  Bloco "CADASTROS" separado por label uppercase muted. Item ativo: fundo primary a 12% + texto
  primary (pill radius 8px).
- Page header dentro do conteúdo: título em Space Grotesk 22px/600 + subtítulo muted 12.5px
  (contagem ou contexto) à esquerda; ação primária da tela à direita ("+ Nova solicitação",
  "Gerar cobranças"). NUNCA formulário de criação inline no topo da página — criação abre em
  drawer/modal (ver §3). Isso elimina o layout atual "form em cima + lista embaixo".

## 2. Padrão de listagem (fatias 4.2/4.3 — substitui as listas de cards)

- Toolbar acima da tabela: busca (input com ícone, max-width 360px) + botões de filtro em pill
  (Status, Categoria, Período, Ordenar). Filtro ativo mostra o valor em negrito e, quando houver
  mais de um selecionado, sufixo "+N".
- Tabela densa dentro de um card (radius 12px, overflow hidden):
  - th: uppercase 11.5px/600, letter-spacing .04em, cor muted, borda inferior.
  - td: 13.5px, padding 13px 16px, borda inferior 1px (última linha sem borda).
  - Nº/ID: JetBrains Mono 12px muted. Datas/horas: JetBrains Mono 12px secondary.
  - Coluna "Morador": nome + segunda linha mono 11px com residência (Ap. 302 · Bloco A2).
  - Status e prioridade: badges pill do DESIGN_SYSTEM §6.4.
  - Linha inteira clicável (hover com fundo 5% neutro); linha selecionada: fundo primary 7% +
    barra interna 3px primary à esquerda.
- Rodapé de paginação dentro do mesmo card: "Mostrando X–Y de Z" à esquerda, botões de página
  30x30 à direita (atual: fundo primary). Paginação é SERVER-SIDE (parâmetros page/limit/search/
  filtros nos endpoints de listagem).
- Empty state (lista sem resultado): ícone do módulo (48px, muted), frase curta, e ação — se não
  há dado nenhum, CTA de criação; se filtros ativos zeraram o resultado, botão "Limpar filtros".
- Loading: skeleton de linhas de tabela (não spinner), conforme DESIGN_SYSTEM §8.

## 3. Drawer lateral de detalhe (fatia 4.6 — substitui expandir inline)

- Painel de 400px à direita da lista (mesma grid: `1fr 400px`), card com sticky top; em
  < 1100px vira painel empilhado/overlay full-width.
- Estrutura de cima pra baixo: badges de status/prioridade + botão fechar → título Space
  Grotesk 17px → linha meta em mono (nº · categoria · data) → seções com heading uppercase
  11.5px muted: Descrição, Morador (avatar com iniciais + nome + residência), campos editáveis
  (selects de Status/Prioridade lado a lado), Histórico (timeline vertical: ponto verde=feito,
  ponto primary=atual, ponto vazio=pendente; timestamps em mono), Comentários.
- Rodapé fixo do drawer: input de comentário + botão Enviar.
- Selecionar outra linha da tabela troca o conteúdo do drawer (não abre outro).
- O MESMO padrão de drawer vale para Encomendas, Visitantes, Comida, Reservas, Financeiro —
  muda só o conteúdo das seções.

## 4. Dashboard admin (fatia 4.8)

Grid de 12 colunas, gap 16px:
- Linha 1 — 4 stat tiles (3 col cada): label 12.5px secondary, valor Space Grotesk 30px,
  linha delta em mono 11px (verde=positivo, âmbar=atenção, vermelho=negativo). O tile de
  inadimplência fica com placeholder "—" até a fatia 4.12.
- Linha 2 — gráfico de linhas "Solicitações por semana" (8 col, Recharts LineChart, séries
  Abertas=primary e Resolvidas=success, grid horizontal na cor border, eixos em mono 10px
  muted) + donut "Por categoria" (4 col, total no centro em Space Grotesk, legenda à direita
  com contagens em mono).
- Linha 3 — feed "Atividade recente" (5 col: ícone do módulo em quadrado 32px com fundo da cor
  do evento a ~13%, texto 13px com negritos, timestamp mono muted) + card "Atalhos" (3 col,
  botões outline full-width com ícone; hover = borda e texto primary) + "Ocupação — áreas
  comuns" (4 col, barras de progresso 6px primary com % em mono).
- Cores nos gráficos: SOMENTE tokens (primary, success, accent, danger) — nunca paleta default
  do Recharts. Texto de valor/label sempre em tokens neutros (regra dataviz da Session 19).

## 5. Financeiro admin (fatia 4.11)

- Page header com duas ações: "Exportar ▾" (ghost) e "Gerar cobranças de <mês>" (primary).
- Linha de 3 stat tiles (4 col cada): A receber / Recebido (valor em success) / Em atraso
  (valor em danger). Valores monetários SEMPRE em JetBrains Mono.
- Abaixo: toolbar de busca+filtros (Status, Competência) e split `1fr 340px`:
  - Tabela de cobranças (padrão §2): Residência, Morador, Vencimento, Valor (mono), Status
    (Paga=success / Em aberto=accent / Atrasada·Nd=danger), ação contextual "Registrar
    pagamento" só nas não-pagas.
  - Painel lateral "Inadimplência": resumo (N unidades · total em danger mono) + lista por
    residência com sublinha mono (quantas competências, desde quando) e valor à direita.

## 6. Regras transversais

- Ambos os temas obrigatórios (o mockup tem toggle — conferir os dois antes de dar por pronto).
- Nenhum hex fora de tokens.css; usar var()/tokens Tailwind (DESIGN_SYSTEM §1).
- Tipografia: Space Grotesk só em títulos/valores de destaque; Inter no corpo; JetBrains Mono em
  TODO dado tabular (nº, data/hora, dinheiro, contadores, unidade/apartamento).
- Motion: transições 150–200ms ease-out, skeleton em toda lista, prefers-reduced-motion
  respeitado (DESIGN_SYSTEM §8).
- Acessibilidade: linha de tabela e itens de drawer navegáveis por teclado, foco visível
  (anel primary 20%), aria-label no sino/badge.
