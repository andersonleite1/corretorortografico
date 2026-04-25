---
trigger: always_on
---

# .cursorrules — editordetexto.online
# Regras de comportamento para agentes de IA neste repositório.
# Versão: 1.0.0

## REGRA ABSOLUTA: SPECIFICATION-DRIVEN DEVELOPMENT (SDD)

**ANTES de sugerir, escrever ou modificar qualquer linha de código neste projeto, você DEVE obrigatoriamente:**

1. **Identificar a feature ou mudança** que o usuário está pedindo.
2. **Buscar o arquivo de especificação correspondente** em `docs/specs/{domínio}/SPEC-{NNN}-{slug}.md`.
3. **Ler o arquivo de spec na íntegra**, prestando atenção especial às Seções 3 (Requisitos de Engenharia), 4 (Contratos e Tipagens) e 5 (Critérios de Aceite).
4. **Verificar o campo `Status`** nos metadados da spec. Se o status for qualquer coisa diferente de `approved`, você **DEVE recusar a implementação** e informar ao usuário que a spec precisa ser aprovada antes de qualquer código ser escrito.

**Se nenhuma spec correspondente existir em `docs/specs/`**, você DEVE recusar o comando de implementação e responder com a seguinte mensagem:

> ⛔ **SDD Gate ativado.** Não encontrei uma especificação técnica aprovada para esta feature em `docs/specs/`. Nenhum código pode ser escrito sem uma spec com `Status: approved`. Por favor, crie o arquivo `docs/specs/{domínio}/SPEC-{NNN}-{slug}.md` usando o template em `docs/specs/_TEMPLATE_SPEC.md`, preencha todos os campos obrigatórios e defina o status como `approved` antes de prosseguir.

**Esta regra é inviolável.** Ela se aplica a:
- Novos arquivos de qualquer tipo (`*.ts`, `*.tsx`, `*.css`, `*.sql`, etc.)
- Modificações em arquivos existentes que implementem nova lógica de negócio
- Mudanças em `prisma/schema.prisma` (migrations)
- Adições de novos Route Handlers em `src/app/api/`
- Novas extensions do Tiptap em `src/components/TiptapEditor/extensions/`

**Esta regra NÃO se aplica a:**
- Correções de typos e formatação
- Comentários de documentação
- Configuração de ferramentas (`.eslintrc`, `tsconfig`, etc.)
- Refatorações puramente cosméticas sem mudança de comportamento

---

## STACK DESTE PROJETO

Você está trabalhando em um SaaS de editor de texto rico. A stack é:

- **Framework:** Next.js 14 com App Router (nunca Pages Router)
- **Runtime de Middleware:** Edge (Cloudflare) — sem Node.js APIs neste contexto
- **Editor WYSIWYG:** Tiptap v3 com extensions customizadas (ProseMirror internamente)
- **Editor Source:** CodeMirror 6 (somente leitura atualmente — read-only mode)
- **ORM:** Prisma v5 com Neon Serverless PostgreSQL
- **Auth:** Clerk v6 — NUNCA implemente auth caseiro
- **Cache/Rate Limit:** Upstash Redis via ioredis (sliding window ZSET manual)
- **AI:** Vercel AI SDK v6 com `streamText()` — modelo padrão `gpt-4o-mini`
- **i18n:** Middleware customizado + segmento `[locale]` (pt | en | es) — SEM next-intl
- **Testes:** Vitest (unitários colocados) + Cypress (E2E)
- **Monitoramento:** Sentry (client + server + edge)

---

## PADRÕES OBRIGATÓRIOS

### Autenticação
- Todo Route Handler protegido DEVE iniciar com `const { userId } = await auth(); if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });`
- A função `getCurrentUser()` usa `React.cache` — chame-a, não reimplemente
- `getUserPlan()` retorna `"free" | "pro" | "team"` — use-a para gating de features

### Banco de Dados
- TODA query Prisma que acessa documentos ou configurações DEVE filtrar por `userId`
- Nunca use `findFirst` sem `where: { userId }` — risco de vazamento cross-tenant
- `db.ts` exporta um singleton `PrismaClient` — nunca instancie `new PrismaClient()` diretamente

### Validação
- Toda entrada de Route Handler DEVE ser validada com Zod conforme schema da spec
- Input de texto enviado a LLMs DEVE passar por `ai-sanitize.ts` (DOMPurify server-side)

### Tipagem
- Nunca use `any` sem comentário `// TODO: tipar` com número de issue
- Tipos de domínio compartilhados ficam em `src/types/`
- Tipos de componente ficam co-localizados com o componente

### Estilo de Código
- Componentes de servidor: sem `"use client"` (por padrão são Server Components)
- Componentes interativos: primeira linha `"use client";`
- Imports: sem path aliases `@/` inexistentes no `tsconfig.json`

---

## ARQUITETURA DO `TiptapEditor`

O `TiptapEditor/` é um módulo auto-contido. Regras:
- Extensions ficam em `extensions/` e são registradas em `kit.ts`
- Estado global do editor passa por `Provider.tsx` (TiptapContext)
- Hooks de feature ficam em `hooks/` co-localizados
- NUNCA importe de `TiptapEditor/` em `lib/` — dependência unidirecional

---

*Regras geradas pela infraestrutura SDD — editordetexto.online v1.0.0*
