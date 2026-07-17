# Design System — Sinndico

Fonte de verdade visual do produto. Todo componente novo (web ou mobile/PWA) deve nascer a partir destes tokens — não inventar cor, fonte ou espaçamento fora daqui. Ver `README.md` seção 3 para a justificativa da direção de design (verde-petróleo profundo, fugindo dos clichês de "SaaS gerado por IA").

Modo claro e escuro são obrigatórios desde a primeira tela. Nenhum componente é considerado "pronto" sem ser testado nos dois modos.

Os arquivos-fonte do brand kit (logo/símbolo em SVG, ícones de domínio, `tokens.json` machine-readable) vivem em `brand-assets/` na raiz do repositório — este documento é a especificação escrita, `brand-assets/` é onde estão os arquivos de verdade. Nada em `brand-assets/` foi ainda integrado ao código do app (`apps/web`) — ver seção 9.

---

## 1. Tokens de cor

Implementados como CSS custom properties. O tema escuro é ativado por `[data-theme="dark"]` na raiz do documento; o padrão inicial deve respeitar `prefers-color-scheme` e depois persistir a escolha do usuário (localStorage).

```css
:root {
  /* modo claro (default) */
  --color-primary: #146C5B;
  --color-primary-contrast: #FFFFFF;
  --color-accent: #F0A94E;
  --color-background: #F7F8F7;
  --color-surface: #FFFFFF;
  --color-text-primary: #16211D;
  --color-text-secondary: #4B5A54;
  --color-border: #DCE3DF;
  --color-danger: #E5484D;
  --color-success: #3DBE7A;
}

[data-theme="dark"] {
  --color-primary: #2ED9A8;
  --color-primary-contrast: #0E1512;
  --color-accent: #F0A94E;
  --color-background: #0E1512;
  --color-surface: #161E1A;
  --color-text-primary: #EAF2EE;
  --color-text-secondary: #9FB0A9;
  --color-border: #253128;
  --color-danger: #E5484D;
  --color-success: #3DBE7A;
}
```

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--color-primary` | `#146C5B` | `#2ED9A8` | Cor de marca — botões primários, links, ícones ativos, foco |
| `--color-accent` | `#F0A94E` | `#F0A94E` | Alertas, badges "novo", CTAs secundários |
| `--color-background` | `#F7F8F7` | `#0E1512` | Fundo da página |
| `--color-surface` | `#FFFFFF` | `#161E1A` | Cards, painéis, modais |
| `--color-text-primary` | `#16211D` | `#EAF2EE` | Texto principal |
| `--color-text-secondary` | `#4B5A54` | `#9FB0A9` | Texto de apoio, labels, timestamps |
| `--color-border` | `#DCE3DF` | `#253128` | Bordas de input/card, divisores |
| `--color-danger` | `#E5484D` | `#E5484D` | Erros, chamados urgentes, bloqueios |
| `--color-success` | `#3DBE7A` | `#3DBE7A` | Confirmações, status resolvido |

**Regra:** nunca usar hex direto em componentes — sempre referenciar a variable (`var(--color-primary)` ou o token Tailwind equivalente, ver seção 9).

### 1.1 Tokens candidatos (do brand kit, ainda não aplicados)

`brand-assets/tokens.json` (v1.0.0, anexado em 17/07/2026) traz um token novo e três valores
ligeiramente diferentes dos acima. Nenhum deles foi aplicado em `apps/web/src/styles/tokens.css` —
ficam registrados aqui como referência até haver uma decisão de adotar (ou não):

| Token | Claro (atual → candidato) | Escuro (atual → candidato) |
|---|---|---|
| `--color-text-secondary` | `#4B5A54` → `#4B5A54` (sem mudança) | `#9FB0A9` → `#9FD3C7` |
| `--color-border` | `#DCE3DF` → `#E1E6E3` | `#253128` → `#1E2A25` |
| `--color-text-muted` *(novo)* | — → `#7A857F` | — → `#5C7168` |

`primary`/`accent`/`background`/`surface`/`text-primary`/`danger`/`success` são idênticos em ambas
as fontes — só os tokens acima divergem.

---

## 2. Logo e símbolo

Arquivos-fonte em `brand-assets/assets/brand/`. Ainda não substituem o placeholder atual do app
(`apps/web/public/favicon.svg` e `apps/web/public/icons/icon.svg` — mesmo monograma "S", sem o ponto
de destaque âmbar descrito abaixo).

- **Símbolo:** monograma "S" (Space Grotesk, bold) branco sobre quadrado arredondado `--color-primary`, raio proporcional (~28% do lado — `radii.logo-mark` em `tokens.json`).
- **Assinatura:** ponto `--color-accent` (`#F0A94E`) no canto superior direito do símbolo — pensado pra ser reaproveitado como indicador de notificação/novidade no resto da UI.
- **Redução:** abaixo de ~24px, omitir o ponto âmbar — só o "S" no quadrado, pra preservar legibilidade em favicon/app icon a 16px (`favicon-16.svg` já vem sem o ponto; `favicon-32.svg`/`favicon-48.svg` vêm com).
- **Versões disponíveis:** `symbol.svg` (símbolo isolado), `wordmark.svg` ("Sinndico" só texto), `logo-lockup-light.svg`/`logo-lockup-dark.svg` (símbolo + wordmark horizontal, uma variante por tema), `logo-reverse-mono.svg` (símbolo sólido `--color-primary` + wordmark branco, monocromático).
- **Área de proteção:** espaço livre ao redor equivalente à altura do quadrado do símbolo.
- **Tamanho mínimo:** 16px digital / 10mm impresso.

---

## 3. Tipografia

| Papel | Fonte | Uso |
|---|---|---|
| Display | **Space Grotesk** (fallback Sora) | Títulos, headers de dashboard, números de destaque |
| Corpo | **Inter** (fallback Manrope) | Texto geral, formulários, listas |
| Dados/utilitário | **JetBrains Mono** | Horários, placas de veículo, códigos, timestamps |

### Escala

| Nível | rem | px (base 16) | Peso | Uso |
|---|---|---|---|---|
| `text-xs` | 0.75rem | 12px | 500 | Legendas, badges |
| `text-sm` | 0.875rem | 14px | 400/500 | Texto de apoio, helper text |
| `text-base` | 1rem | 16px | 400 | Corpo padrão |
| `text-lg` | 1.125rem | 18px | 500 | Subtítulos, texto de destaque |
| `text-xl` | 1.5rem | 24px | 600 (display) | Título de card/seção |
| `text-2xl` | 2rem | 32px | 700 (display) | Título de página |
| `text-3xl` | 2.5rem | 40px | 700 (display) | Números de destaque no dashboard |

Line-height: `1.2` para display, `1.5` para corpo, `1.4` para dados/mono.

---

## 4. Ícones

Outline · stroke 2px · grid 24px · `linecap`/`linejoin` round · `currentColor` (herda a cor do
contexto, funciona em claro/escuro sem código extra) — o mesmo spec já usado em
`apps/web/src/components/ui/icons.tsx` (ícones de UI: sol/lua, menu, fechar, sair, usuário etc.).

`brand-assets/assets/icons/` traz um segundo conjunto — ícones **de domínio**, um por módulo
funcional, no mesmo estilo (drop-in natural quando forem integrados, sem precisar reconciliar
spec): `solicitacao-manutencao`, `encomenda`, `visitante`, `comunicado`, `area-comum`, `assembleia`,
`chat`, `notificacao`. Estado ativo no modo escuro usa `--color-primary` (`#2ED9A8`).

---

## 5. Espaçamento, raio e elevação

- **Escala de espaçamento base:** múltiplos de 4px (`4, 8, 12, 16, 24, 32, 48, 64`).
- **Raio padrão:**
  - Botões e inputs: `8px`
  - Cards e modais: `12px`
  - Badges (pill): `9999px`
- **Elevação:** sombras leves e discretas — o tom do produto é "confiável", não "flutuante". Evitar sombras pesadas/dramáticas.
  ```css
  --shadow-sm: 0 1px 2px rgba(14, 21, 18, 0.06);
  --shadow-md: 0 4px 12px rgba(14, 21, 18, 0.08);
  ```
  Em modo escuro, preferir uma borda sutil (`--color-border`) a sombra, já que sombra escura sobre fundo escuro não lê bem.

---

## 6. Componentes base

Especificação funcional de cada componente — implementação em React acontece quando o módulo funcional correspondente for construído.

### 6.1 Botão

Variantes: `primary`, `secondary`, `danger`, `ghost`.
Estados: `default`, `hover`, `active`, `disabled`, `loading`.

- `primary`: fundo `--color-primary`, texto `--color-primary-contrast`. Hover escurece ~8%, active ~12%.
- `secondary`: fundo transparente, borda `--color-primary`, texto `--color-primary`.
- `danger`: fundo `--color-danger`, texto branco — usado em ações destrutivas (excluir, bloquear visitante).
- `ghost`: sem fundo/borda, usado em ações terciárias (ex.: "cancelar" ao lado de um botão primário).
- `disabled`: opacidade 40%, `cursor: not-allowed`, sem hover.
- `loading`: substitui o label por um spinner de 16px, mantém a largura do botão (evita layout shift).

Tamanhos: `sm` (32px altura), `md` (40px, default), `lg` (48px).

### 6.2 Card

- Fundo `--color-surface`, raio `12px`, `--shadow-sm` (claro) ou borda `--color-border` (escuro).
- Padding interno padrão `24px` (desktop) / `16px` (mobile).
- Header opcional: título (`text-xl`, display) + ação alinhada à direita (ex.: botão ghost "ver todos").
- Uso: cards de resumo do dashboard, item de lista (chamado, encomenda, comunicado).

### 6.3 Input

Estados: `default`, `focus`, `error`, `disabled`.

- `default`: borda `--color-border`, fundo `--color-surface`.
- `focus`: borda `--color-primary` + anel de foco (`box-shadow` 2px na cor primária com opacidade 20%) — acessibilidade de teclado é obrigatória.
- `error`: borda `--color-danger` + helper text abaixo em `--color-danger`.
- `disabled`: opacidade 50%, fundo levemente diferenciado.
- Sempre com `label` acima (não usar placeholder como único label) e `helper text` opcional abaixo.

### 6.4 Badge

Uso principal: status de chamado/encomenda/comunicado.

| Status | Cor de fundo | Cor de texto |
|---|---|---|
| Aberto / Aguardando | `--color-accent` (10% opacidade no fundo) | `--color-accent` |
| Em progresso | `--color-primary` (10% opacidade no fundo) | `--color-primary` |
| Resolvido / Retirada | `--color-success` (10% opacidade no fundo) | `--color-success` |
| Urgente / Bloqueado | `--color-danger` (10% opacidade no fundo) | `--color-danger` |

Formato pill (`border-radius: 9999px`), padding `4px 12px`, `text-xs` peso 500, tipografia mono para valores numéricos/código dentro do badge (ex.: nº do chamado).

### 6.5 Toggle de tema (claro/escuro)

- Ícone sol/lua com transição suave (rotação + fade, ~200ms).
- Estado inicial: `prefers-color-scheme` do sistema.
- Persistência: `localStorage` (chave `sinndico:theme`), sobrescreve a preferência do sistema após a primeira escolha manual.
- Posição: header (web) e tela de perfil (mobile/PWA).
- Acessível via teclado, com `aria-label` dinâmico ("Ativar modo escuro" / "Ativar modo claro").

---

## 7. Imagery

Tratamento duotone verde-petróleo: sombras `#0E1512 → #146C5B`, altas-luzes em menta (`#2ED9A8`) ou
âmbar como destaque pontual (`#F0A94E`), vinheta sutil, contraste médio. Assunto sempre real —
portaria, fachadas, áreas comuns, assinatura/entrega — nunca stock genérico de "time corporativo".
Ainda sem nenhuma imagem de verdade no produto; esta seção é guia pra quando a primeira entrar.

---

## 8. Motion

- Transições padrão: `150–200ms`, easing `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out).
- Feedback tátil em botões: `scale(0.97)` no `:active`, retorno suave.
- Skeleton loading (não spinner genérico) para listas e cards em carregamento — blocos com leve pulsação (`opacity` 0.6 ↔ 1, 1.5s loop).
- "Assinatura" de confirmação: quando um chamado é resolvido ou uma encomenda é retirada, usar uma transição de check único e reconhecível (ex.: ícone de círculo que preenche + check que desenha via `stroke-dashoffset`) — reutilizada em todo o sistema como o "momento de resolução".
- Sempre envolver animações não essenciais em `@media (prefers-reduced-motion: no-preference)`; sem essa media query, tudo deve reduzir a um fade simples ou instantâneo.
- Biblioteca sugerida: Framer Motion (web/React), Reanimated (se/quando migrar pra React Native) — ainda não instalada em `apps/web` (ver Session 13 do Checkpoint Log: transições desta fase foram resolvidas só com utilitários do Tailwind, sem precisar da lib ainda).

---

## 9. Aplicação em Tailwind (referência para `apps/web`)

Os tokens acima mapeiam para o `tailwind.config.ts` do app web assim:

```ts
colors: {
  primary: 'var(--color-primary)',
  accent: 'var(--color-accent)',
  background: 'var(--color-background)',
  surface: 'var(--color-surface)',
  'text-primary': 'var(--color-text-primary)',
  'text-secondary': 'var(--color-text-secondary)',
  border: 'var(--color-border)',
  danger: 'var(--color-danger)',
  success: 'var(--color-success)',
},
fontFamily: {
  display: ['"Space Grotesk"', 'sans-serif'],
  body: ['Inter', 'sans-serif'],
  mono: ['"JetBrains Mono"', 'monospace'],
},
```

Isso permite escrever `bg-primary text-text-primary font-display` no JSX sem nunca tocar em hex.

(Na implementação real, `tailwind.config.ts` usa uma função de opacidade sobre variáveis RGB
irmãs — `--color-primary-rgb` etc. — em vez de `var(--color-primary)` puro, pra suportar sintaxe
como `bg-primary/10`. Ver `apps/web/src/styles/tokens.css` e `apps/web/tailwind.config.ts` pro
código-fonte exato; o snippet acima é a referência conceitual.)
