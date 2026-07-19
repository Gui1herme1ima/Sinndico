# CLAUDE.md — Sinndico (Plataforma de Gestão Condominial)

Sinndico é um SaaS de gestão condominial (Solicitações, Encomendas, Comida, Visitantes,
Comunicados, Áreas comuns, Assembleia/votação, Chat) que centraliza morador, diretoria/síndico e
portaria num sistema único.

**Escopo, roadmap de fatias e documentação técnica não vivem aqui — leia sob demanda conforme a
tarefa:**
- `docs/escopo.md` — visão do produto, módulos, identidade visual (regra obrigatória de design).
- `docs/roadmap.md` — fases e fatias de desenvolvimento, o que já foi feito e o que vem a seguir.
- `docs/arquitetura.md` — stack, estrutura de pastas do monorepo, schema de banco, multi-tenancy/RLS.
- `docs/configuracao.md` — setup local, variáveis de ambiente, login de teste.
- `docs/DESIGN_SYSTEM.md` — tokens de cor/tipografia e componentes base.

## Comandos úteis

```bash
# Backend (apps/backend)
npm run dev          # servidor local
npm run migrate      # rodar migrations
npm run seed         # seed de dados
npm test             # testes

# Web (apps/web)
npm run dev          # dev server
npm run build        # build produção
npm run typecheck    # tsc -b
npm test             # testes
```

Setup completo (env vars, Supabase, etc.): `docs/configuracao.md`.

## Regras de trabalho

- **Sempre pergunte o escopo da sessão** se não estiver claro qual módulo/fatia está em andamento,
  antes de escrever código. Siga a ordem do `docs/roadmap.md` — não pule fatia nem antecipe módulo
  futuro sem confirmação explícita do usuário.
- **Nunca implemente funcionalidade fora da fatia/fase atual** sem confirmação explícita.
- **Código novo consistente com a estrutura de pastas** em `docs/arquitetura.md`.
- **Identidade visual obrigatória** em toda tela nova — ver `docs/escopo.md` seção 3 antes de codar.
- **Documentação, commits e comunicação em português** (comentários de código podem ser em inglês).
- **Mudanças de escopo, bugs e melhorias são esperadas e normais** — não trate como desvio do plano.

## Commit obrigatório por fatia

Ao concluir cada fatia do roadmap (`docs/roadmap.md`), faça um commit atômico antes de prosseguir
para a próxima. A mensagem de commit é o registro histórico da fatia — não escreva log manual em
nenhum `.md`. Mensagem clara (Conventional Commits), descrevendo exatamente o que foi feito; use o
corpo do commit para detalhes técnicos relevantes (decisões, métricas, desvios do plano). Para
retomar o contexto de uma sessão anterior (somente se necessário), use `git log`.
