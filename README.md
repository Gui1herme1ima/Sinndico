# Sinndico — Plataforma de Gestão Condominial

SaaS de gestão condominial que centraliza a comunicação entre moradores e diretoria/portaria,
substituindo WhatsApp, caderno de portaria e planilhas soltas.

**Público:** síndicos profissionais, administradoras condominiais, condomínios com 20+ unidades.
**Modelo:** assinatura mensal por condomínio, escalada por número de unidades.

## Módulos

Solicitações · Encomendas · Comida/Delivery · Visitantes · Comunicados · Áreas comuns ·
Assembleia/votação · Chat morador-admin

Detalhe de cada módulo e identidade visual: `docs/escopo.md`.

## Stack

Node.js/Express + TypeScript, PostgreSQL via Supabase + Redis, React + TypeScript + Tailwind,
Supabase Auth, Firebase Cloud Messaging. Detalhe completo: `docs/arquitetura.md`.

## Setup rápido

```bash
git clone <repo-url>
cd sinndico

# Backend
cd apps/backend && npm install && cp .env.example .env
npm run migrate && npm run seed && npm run dev

# Web (outro terminal)
cd apps/web && npm install && cp .env.example .env && npm run dev

# Mobile (outro terminal)
cd apps/mobile && npm install && npm run dev
```

Guia completo (Supabase, variáveis de ambiente, seed de superadmin, login de teste):
`docs/configuracao.md`.

## Documentação

- `docs/escopo.md` — visão do produto, módulos, identidade visual
- `docs/roadmap.md` — fases e fatias de desenvolvimento
- `docs/arquitetura.md` — stack, estrutura de pastas, schema de banco, multi-tenancy
- `docs/configuracao.md` — setup local e variáveis de ambiente
- `docs/DESIGN_SYSTEM.md` — design system (cores, tipografia, componentes)
- `docs/CHECKPOINT_HISTORY.md` — histórico de sessões de desenvolvimento
