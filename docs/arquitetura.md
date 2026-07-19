# Arquitetura

## Stack Técnica

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
- **Charts:** Recharts (dashboard de solicitações, ocupação áreas)

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

## Estrutura de Pastas (Monorepo)

```
sinndico/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── authController.ts
│   │   │   │   ├── solicitacaoController.ts
│   │   │   │   ├── encomendaController.ts
│   │   │   │   ├── visitanteController.ts
│   │   │   │   ├── comidaController.ts
│   │   │   │   ├── comunicadoController.ts
│   │   │   │   ├── areaComumController.ts
│   │   │   │   ├── assembleiaController.ts
│   │   │   │   └── chatController.ts
│   │   │   ├── models/
│   │   │   │   ├── User.ts
│   │   │   │   ├── Solicitacao.ts
│   │   │   │   ├── Encomenda.ts
│   │   │   │   ├── Visitante.ts
│   │   │   │   ├── Comida.ts
│   │   │   │   ├── Comunicado.ts
│   │   │   │   ├── AreaComum.ts
│   │   │   │   ├── Assembleia.ts
│   │   │   │   └── Chat.ts
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── solicitacoes.ts
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
│   │   │   │   ├── Solicitacoes/
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
│       │   │   ├── SolicitacoesScreen.tsx
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
│   ├── escopo.md (visão geral, módulos, identidade visual)
│   ├── roadmap.md (fases e fatias)
│   ├── arquitetura.md (este arquivo)
│   ├── configuracao.md (setup local, env vars)
│   ├── DESIGN_SYSTEM.md (cores, tipografia, componentes base)
│   └── CHECKPOINT_HISTORY.md (histórico de sessões)
│
├── .gitignore
├── CLAUDE.md (instruções operacionais)
└── README.md (visão geral rápida)
```

## Modelo de Dados (Schema PostgreSQL)

### Entidades Principais

**users** (moradores + admin + porteiro + superadmin) — perfil de negócio; identidade e senha ficam no Supabase Auth
- id (mesmo id do `auth.users` do Supabase, sem senha própria armazenada aqui), email, nome, apto, telefone, role (morador/admin/porteiro/superadmin), condominio_id (NULL só pra superadmin — não pertence a um condomínio específico, gerencia a plataforma inteira), created_at

**solicitacoes** (chamado de manutenção/segurança/animal)
- id, morador_id, categoria (manutenção/segurança/animal/outra), titulo, descricao, status (aberto/em-progresso/resolvido), prioridade, data_criacao, data_resolvimento, assigned_to (admin)

**encomendas**
- id, morador_id, porteiro_id, descricao, horario_chegada, foto_url, assinado (boolean), data_assinatura, status (aguardando/retirada)

**comida**
- id, morador_id, restaurante, horario_chegada_estimada, status (pedido-feito/em-caminho/chegou/retirada), notificacao_portaria_enviada

**visitantes**
- id, condominio_id, morador_id, nome_visitante, rg, placa_veiculo, data_visita, hora_entrada, hora_saida, aprovado_por, status (aprovado/bloqueado/ativo)
- `aprovado_por`: sempre o próprio morador na criação (auto-aprovação — é o convidado dele; não há
  gate de admin separado). `status` não tem um valor "concluído" — depois da saída o status
  continua `ativo`, só `hora_saida` é preenchida; a UI distingue "na portaria" de "visita concluída"
  combinando os dois campos.

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
- id, condominio_id, morador_id (dono da thread), autor_id (quem escreveu — morador ou o admin que respondeu), mensagem, created_at, lido (se o outro lado já leu)

### Multi-tenancy e isolamento de dados

Sinndico é vendido por condomínio (um cliente = um condomínio), então isolamento entre tenants é
requisito desde o início, não um "depois eu penso nisso".

**Estratégia escolhida: banco único (um projeto Supabase) + `condominio_id` em cada tabela + Row
Level Security no Postgres** — não um banco/projeto separado por cliente. Motivo: o custo de um
projeto Supabase por cliente escala linearmente com o número de condomínios (cada projeto acima do
free tier tem custo próprio), e cada mudança de schema precisaria rodar em N bancos em vez de um só.
Pro público-alvo (condomínios de porte pequeno/médio, dezenas a poucas centenas de clientes), banco
único é o padrão de mercado — Slack, Linear, Notion e a maioria dos SaaS B2B desse porte funcionam
assim. Banco por cliente só se justificaria com poucos clientes muito grandes ou exigência
contratual/regulatória de separação física.

**Como o isolamento é garantido de verdade (não só "por convenção" no código):**
- Toda tabela com dado de um condomínio específico tem `condominio_id`.
- **Row Level Security ativado** nas tabelas (`condominios`, `users`, `solicitacoes`, `encomendas`,
  `comunicados`, `comunicado_leituras`) — o Postgres bloqueia a leitura/escrita de linhas fora do
  tenant atual mesmo que o código do backend esqueça um filtro `WHERE condominio_id = ...`.
- A API **não** se conecta ao Postgres com a role `postgres` (superuser do Supabase, que ignora RLS
  por padrão) pra servir requests normais — existe uma role dedicada, restrita (`app_user`, sem
  `BYPASSRLS`), e cada request roda dentro de uma transação que seta o tenant atual via
  `SET LOCAL`/`set_config` antes de qualquer query. `DATABASE_URL` (privilegiada) fica só pra rodar
  migrations e pra operações de superadmin; `APP_DATABASE_URL` (restrita) é o que a API usa em
  runtime pra tudo que é tenant-scoped.

**Superadmin:** role própria (`role = 'superadmin'`), sem `condominio_id` (gerencia todos os
condomínios, não pertence a nenhum). Sem tela própria ainda — a fundação (schema + regra de acesso)
já existe; o painel visual pra criar/gerenciar condomínios fica pra quando entrarmos nessa fatia do
roadmap. Enquanto isso, a primeira conta de superadmin é criada via `npm run seed:superadmin` (ver
`docs/configuracao.md`).
