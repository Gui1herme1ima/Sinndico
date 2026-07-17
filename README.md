# Sinndico — Plataforma de Gestão Condominial

## 1. Visão Geral

Sistema completo de gestão condominial que centraliza comunicação entre moradores e diretoria/portaria através de:
- **Chamados de manutenção** (categorias: manutenção, segurança, invasão de animais, etc)
- **Recebimento de encomendas** (foto, horário, assinatura digital, notificação)
- **Rastreamento de entrega de comida** (morador avisa plataforma, portaria recebe pré-aviso)
- **Gestão de visitantes** (registro, aprovação, acesso futuro, placa, RG, documentação)
- **Mural de comunicados** (admin posta, moradores recebem notificação)
- **Reserva de áreas comuns** (salão, churrasqueira, piscina, academia)
- **Convocação e votação de assembleia** (digital com rastreabilidade)
- **Chat morador-admin** (suporte direto)

**Público:** Síndicos profissionais, administradoras condominiais, condomínios com 20+ unidades.
**Modelo:** SaaS por condomínio (assinatura mensal escalada por número de unidades).

---

## 2. Stack Técnica

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js ou Fastify
- **Banco:** PostgreSQL gerenciado via **Supabase** (principal) + Redis (cache)
- **Auth:** **Supabase Auth (GoTrue)** — access token JWT verificado no backend via JWKS (lib `jose`), refresh de sessão gerenciado pela plataforma. Perfil de negócio (role, condomínio, apto etc.) fica numa tabela própria (`users`) referenciando `auth.users` do Supabase.
- **File Storage:** AWS S3, Cloudinary ou Supabase Storage (fotos encomenda/vistoria)
- **Notificações:** Firebase Cloud Messaging (FCM) + email (Nodemailer/SendGrid)

### Frontend Web (Admin/Diretoria)
- **Framework:** React 18+ com TypeScript
- **State:** Zustand ou Context API
- **UI:** Tailwind CSS + shadcn/ui ou Material-UI
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts (dashboard de chamados, ocupação áreas)

### Mobile (Moradores)
- **Opção 1 (Recomendado início):** PWA (Progressive Web App) — React + Workbox
- **Opção 2 (Escala):** React Native (Expo ou bare) para iOS + Android nativos
- **Push Notifications:** Firebase Cloud Messaging

### DevOps
- **Hosting Backend:** **Hostinger** (integração oficial com Supabase)
- **Hosting Web:** Vercel, Netlify (ou a própria Hostinger)
- **CI/CD:** GitHub Actions
- **Database:** **Supabase** (Postgres gerenciado + Auth) — decidido por causa da integração oficial com a Hostinger e por ser Postgres (encaixa no modelo relacional do schema, ao contrário de um banco de documentos tipo MongoDB Atlas, também oferecido pela Hostinger)
- **Monitoramento:** Sentry (errors), LogRocket (frontend)

> **Nota de hardening futuro:** hoje o backend Express é o único cliente do Postgres (conecta direto via `DATABASE_URL`), então a autorização é toda feita no middleware (`authorize(...roles)`). Se algum dia o Postgres for exposto direto pro frontend (PostgREST/Supabase client), ativar Row Level Security (RLS) nas tabelas antes disso.

---

## 3. Identidade Visual

A identidade visual é um pilar do produto, não um detalhe — o sistema precisa parecer moderno, robusto e confiável à primeira vista, tanto pro síndico (web) quanto pro morador (mobile). Suporte completo a modo claro e escuro é obrigatório desde o início, não um "extra" adicionado depois.

### Direção de design
Evitar os clichês visuais mais comuns de produtos gerados por IA (fundo creme com sotaque terracota; fundo quase-preto com verde ácido; layout estilo jornal com hairlines). A direção do Sinndico é **verde-petróleo profundo** — remete a segurança, zelo e confiança, sem soar como "mais um SaaS azul corporativo".

### Paleta de cores (tokens)

| Token | Hex | Uso |
|---|---|---|
| `primary` | `#146C5B` | Verde-petróleo profundo — cor de marca, botões primários, links, ícones ativos |
| `primary-dark-mode` | `#2ED9A8` | Verde-menta vibrante — versão da primary otimizada pra contraste em fundo escuro |
| `accent` | `#F0A94E` | Âmbar quente — alertas, notificações, badges de "novo", CTAs secundários |
| `background-light` | `#F7F8F7` | Fundo modo claro — branco levemente esverdeado, não branco puro |
| `background-dark` | `#0E1512` | Fundo modo escuro — verde-carvão profundo, não preto puro |
| `surface-light` / `surface-dark` | `#FFFFFF` / `#161E1A` | Cards, painéis, modais |
| `text-primary-light` / `text-primary-dark` | `#16211D` / `#EAF2EE` | Texto principal |
| `danger` | `#E5484D` | Erros, chamados urgentes, bloqueios |
| `success` | `#3DBE7A` | Confirmações, status resolvido |

### Tipografia
- **Display (títulos, headers de dashboard):** fonte geométrica com personalidade — ex: **Space Grotesk** ou **Sora** — usada com peso pra transmitir robustez sem ser fria.
- **Corpo (texto geral, formulários):** fonte de alta legibilidade em telas pequenas — ex: **Inter** ou **Manrope**.
- **Dados/utilitário (números, timestamps, badges):** fonte monoespaçada leve — ex: **JetBrains Mono** — pra horários de encomenda, placas, códigos.

### Modo claro/escuro
- Implementar via CSS variables / design tokens desde o design system inicial (não como tema "por cima" depois).
- Persistir preferência do usuário (localStorage no PWA/web) + respeitar `prefers-color-scheme` como padrão inicial.
- Toggle acessível no header (web) e no perfil (mobile).
- Todo componente novo deve ser testado nos dois modos antes de considerado "pronto".

### Animações e microinterações
- Motion fluida e proposital, não decorativa: transições de página, reveal de cards no dashboard, feedback tátil em botões (scale/opacity sutil ao toque), skeleton loading em vez de spinners genéricos.
- Priorizar uma "assinatura" de movimento — ex: elementos de status (chamado resolvido, encomenda retirada) têm uma transição de check/confirmação particular do produto, reconhecível e reutilizada em todo o sistema.
- Respeitar `prefers-reduced-motion` sempre.
- Bibliotecas sugeridas: Framer Motion (web/React), Reanimated (se migrar pra React Native no futuro).

### Onde aplicar primeiro
Antes de qualquer módulo funcional da Fase 1, criar um **design system básico** (cores, tipografia, componentes base: botão, card, input, badge, toggle de tema) documentado em `docs/DESIGN_SYSTEM.md`, pra todos os módulos seguintes herdarem consistência automaticamente.

---

## 4. Estrutura de Pastas (Monorepo)

```
sinndico/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── authController.ts
│   │   │   │   ├── chamadoController.ts
│   │   │   │   ├── encomendaController.ts
│   │   │   │   ├── visitanteController.ts
│   │   │   │   ├── comidaController.ts
│   │   │   │   ├── comunicadoController.ts
│   │   │   │   ├── areaComumController.ts
│   │   │   │   ├── assembleiaController.ts
│   │   │   │   └── chatController.ts
│   │   │   ├── models/
│   │   │   │   ├── User.ts
│   │   │   │   ├── Chamado.ts
│   │   │   │   ├── Encomenda.ts
│   │   │   │   ├── Visitante.ts
│   │   │   │   ├── Comida.ts
│   │   │   │   ├── Comunicado.ts
│   │   │   │   ├── AreaComum.ts
│   │   │   │   ├── Assembleia.ts
│   │   │   │   └── Chat.ts
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── chamados.ts
│   │   │   │   ├── encomendas.ts
│   │   │   │   ├── visitantes.ts
│   │   │   │   ├── comida.ts
│   │   │   │   ├── comunicados.ts
│   │   │   │   ├── areasComuns.ts
│   │   │   │   ├── assembleias.ts
│   │   │   │   └── chat.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── errorHandler.ts
│   │   │   │   └── validation.ts
│   │   │   ├── services/
│   │   │   │   ├── notificationService.ts
│   │   │   │   ├── fileUploadService.ts
│   │   │   │   ├── emailService.ts
│   │   │   │   └── jwtService.ts
│   │   │   ├── database/
│   │   │   │   ├── migrations/
│   │   │   │   ├── seeds/
│   │   │   │   └── connection.ts
│   │   │   └── app.ts
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Layout/
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── Chamados/
│   │   │   │   ├── Encomendas/
│   │   │   │   ├── Visitantes/
│   │   │   │   ├── Comunicados/
│   │   │   │   ├── AreasComuns/
│   │   │   │   ├── Assembleias/
│   │   │   │   └── Chat/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── store/ (Zustand)
│   │   │   ├── styles/
│   │   │   └── App.tsx
│   │   ├── public/
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mobile/ (PWA ou React Native)
│       ├── src/
│       │   ├── screens/
│       │   │   ├── HomeScreen.tsx
│       │   │   ├── ChamadosScreen.tsx
│       │   │   ├── EncomendaScreen.tsx
│       │   │   ├── VisitantesScreen.tsx
│       │   │   ├── ComidaScreen.tsx
│       │   │   ├── ComunicadosScreen.tsx
│       │   │   ├── ProfileScreen.tsx
│       │   │   └── ChatScreen.tsx
│       │   ├── components/
│       │   ├── services/
│       │   ├── store/
│       │   └── App.tsx
│       ├── public/ (PWA manifest, icons)
│       ├── service-worker.ts (PWA)
│       ├── .env.example
│       └── package.json
│
├── docs/
│   ├── API.md (endpoints)
│   ├── DATABASE.md (schema)
│   ├── DEPLOYMENT.md (instruções)
│   └── FEATURES.md (detalhe de cada módulo)
│
├── .gitignore
└── README.md (este arquivo)
```

---

## 5. Modelo de Dados (Schema PostgreSQL)

### Entidades Principais

**users** (moradores + admin + porteiro) — perfil de negócio; identidade e senha ficam no Supabase Auth
- id (mesmo id do `auth.users` do Supabase, sem senha própria armazenada aqui), email, nome, apto, telefone, role (morador/admin/porteiro), condominio_id, created_at

**chamados**
- id, morador_id, categoria (manutenção/segurança/animal/outra), titulo, descricao, status (aberto/em-progresso/resolvido), prioridade, data_criacao, data_resolvimento, assigned_to (admin)

**encomendas**
- id, morador_id, porteiro_id, descricao, horario_chegada, foto_url, assinado (boolean), data_assinatura, status (aguardando/retirada)

**comida**
- id, morador_id, restaurante, horario_chegada_estimada, status (pedido-feito/em-caminho/chegou/retirada), notificacao_portaria_enviada

**visitantes**
- id, morador_id, nome_visitante, rg, placa_veiculo, data_visita, hora_entrada, hora_saida, aprovado_por (admin), status (aprovado/bloqueado/ativo)

**comunicados**
- id, admin_id, titulo, conteudo, data_criacao, lido_por (array de user_ids ou relação separada)

**areasComuns**
- id, condominio_id, nome (salão/churrasqueira/piscina), horario_funcionamento, descricao

**reservas**
- id, area_comum_id, morador_id, data_reserva, hora_inicio, hora_fim, status (aprovada/pendente/cancelada)

**assembleias**
- id, condominio_id, titulo, data, descricao, pauta, status (planejada/em-votacao/encerrada)

**votos**
- id, assembleia_id, morador_id, voto (sim/nao/abstencao), timestamp

**chats**
- id, morador_id, admin_id, mensagem, timestamp, lido

---

## 6. Fases de Desenvolvimento

### **FASE 1: MVP (Semanas 1-4)**
Funcionalidades core que entregam valor imediato:

- [ ] **Auth:** Cadastro/login morador + admin, JWT
- [ ] **Chamados:** Morador cria, admin vê/resolve (web e mobile)
- [ ] **Encomendas:** Porteiro cadastra (foto + hora), morador assina digital, notificação
- [ ] **Comunicados:** Admin posta, morador vê + notificação
- [ ] **Chat básico:** Morador escreve, admin responde
- [ ] **Dashboard admin:** Resumo (chamados abertos, encomendas hoje, comunicados recentes)
- [ ] **Notificações:** Push FCM (encomenda chegou, comunicado novo, resposta admin)

**Saídas MVP:**
- Backend API rodando
- Web admin funcional
- PWA mobile funcional (versão 1)

---

### **FASE 2: Visitantes + Comida (Semanas 5-6)**
- [ ] **Visitantes:** Registro morador, aprovação admin, lista de acesso portaria
- [ ] **Comida:** Morador avisa plataforma, pre-aviso pra portaria, status de entrega
- [ ] **Visitantes - Integração portaria:** Porteiro vê lista de visitantes aprovados ao abrir perfil do morador

---

### **FASE 3: Áreas Comuns + Assembleia (Semanas 7-8)**
- [ ] **Reserva de áreas:** Morador reserva, admin aprova, calendário visual
- [ ] **Assembleia:** Admin convoca, morador vota, ata automática

---

### **FASE 4: Polish + Deployment (Semana 9)**
- [ ] Testes automatizados (unit + integration)
- [ ] Otimização de performance
- [ ] Deployment produção (Railway/AWS + Vercel)
- [ ] Documentação completa

---

### **FASE 5+: Melhorias Contínuas**
- Integração com fechadura inteligente (Loqu8, Intelbras)
- Leitura de hidrômetro (OCR)
- App nativo iOS/Android (se PWA não for suficiente)
- Relatórios/BI pro admin
- SMS como fallback pra notificações

---

## 7. Checkpoint de Progresso

A cada mudança de sessão, registre aqui **o que foi concluído** pra retomar sem perder contexto. O checkpoint detalhado fica centralizado no CLAUDE.md (seção 7 — Checkpoint Log).

---

## 8. Como Rodar Local (Setup)

O banco (Postgres) e o Auth rodam no **Supabase** — inclusive em desenvolvimento, não só em produção. Não precisa instalar Postgres localmente.

```bash
# 0. Criar um projeto gratuito em supabase.com
#    Copiar em Project Settings > API: Project URL, anon key (publishable), service_role key (secret)
#    Copiar em Project Settings > Database > Connect: a connection string do "Transaction pooler" (porta 6543)
#    -> NÃO usar a connection string "direta" (db.<projeto>.supabase.co:5432): ela só resolve em IPv6,
#       o que trava com ETIMEDOUT em redes/ambientes sem saída IPv6. O pooler tem host IPv4.
#    -> Se a senha do Postgres tiver caracteres especiais (@, +, etc.), fazer URL-encode antes de colar
#       na DATABASE_URL (@ -> %40, + -> %2B), senão a connection string quebra.

# Clone
git clone <repo-url>
cd sinndico

# Redis (opcional, cache futuro)
docker compose up -d

# Backend
cd apps/backend
npm install
cp .env.example .env
# preencher DATABASE_URL / SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY no .env
npm run migrate
npm run seed
npm run dev

# Em outro terminal: Web
cd apps/web
npm install
cp .env.example .env
npm run dev

# Em outro terminal: Mobile (PWA)
cd apps/mobile
npm install
npm run dev
```

---

## 9. Variáveis de Ambiente (.env)

```
# Backend
DATABASE_URL=postgresql://postgres:sua_senha@db.seu-projeto.supabase.co:5432/postgres
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
REDIS_URL=redis://localhost:6379
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
AWS_S3_BUCKET=sinndico-app
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

---

## 10. Observações Importantes

1. **Sistema sujeito a evoluções:** Este README reflete a implantação inicial. Alterações de escopo, melhorias e correções de bugs serão contínuas conforme direcionado.

2. **Checkpoints de progresso:** Cada sessão de desenvolvimento registra checkpoints no CLAUDE.md. Isso permite retomar de onde parou.

3. **Prioridade:** MVP funcional em 4 semanas, depois expandir com visitantes e comida, depois áreas comuns.

4. **Comunicação:** Qualquer mudança de direção será documentada aqui e discutida antes de implementação.

---

## 11. Links Úteis

- PostgreSQL: https://www.postgresql.org/
- Express.js: https://expressjs.com/
- React: https://react.dev/
- Firebase FCM: https://firebase.google.com/
- PWA Docs: https://web.dev/progressive-web-apps/

---

**Criado:** 16/07/2026
**Última atualização:** 16/07/2026
**Responsável:** Guilherme + Claude Code
