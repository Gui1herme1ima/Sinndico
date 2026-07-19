# Configuração e setup local

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
# gerar uma senha forte pra APP_DB_PASSWORD e montar a APP_DATABASE_URL (ver comentários no .env.example)
npm run migrate
npm run seed
SUPERADMIN_EMAIL=voce@seudominio.com SUPERADMIN_PASSWORD=senha-forte npm run seed:superadmin
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

## Variáveis de Ambiente (.env)

```
# Backend
# Privilegiada (role "postgres", ignora RLS) — só migrations, nunca runtime da API
DATABASE_URL=postgresql://postgres.seu-projeto:sua_senha@aws-0-sua-regiao.pooler.supabase.com:6543/postgres
# Restrita (role "app_user", sem BYPASSRLS) — usada em runtime pela API, RLS aplica de verdade
APP_DATABASE_URL=postgresql://app_user.seu-projeto:sua_senha@aws-0-sua-regiao.pooler.supabase.com:6543/postgres
APP_DB_PASSWORD=...
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
REDIS_URL=redis://localhost:6379
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
AWS_S3_BUCKET=sinndico-app
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

## Login de teste (ambiente de desenvolvimento)

Condomínio "Condominio Teste" (slug `teste`): usuário `admin`, senha `Admin123!`.
