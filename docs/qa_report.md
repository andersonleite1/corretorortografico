# Relatório de Qualidade (QA) — Editor de Texto
**Data:** 2026-02-22  
**Analista:** Antigravity (Agente QA)  
**Versão do sistema:** `0.1.0` (pré-produção)  
**Stack:** Next.js 14, Clerk, Prisma/PostgreSQL, Stripe, OpenAI, Cloudinary, Tiptap

---

## Resumo Executivo

O sistema foi analisado de forma estática (revisão de código), cobrindo rotas de API, middleware, autenticação, esquema de banco de dados, webhooks e dependências. Foram identificados **15 problemas** classificados em 4 níveis de severidade. O sistema **não está pronto para produção** como MVP sem que os itens `CRÍTICO` e `ALTO` sejam resolvidos.

---

## Índice

1. [Vulnerabilidades de Segurança](#1-vulnerabilidades-de-segurança)
2. [Bugs Confirmados / Riscos de Comportamento Incorreto](#2-bugs-confirmados--riscos-de-comportamento-incorreto)
3. [Escalabilidade](#3-escalabilidade)
4. [Prontidão para MVP (Produção)](#4-prontidão-para-mvp-produção)
5. [Checklist de MVP](#5-checklist-de-mvp)

---

## 1. Vulnerabilidades de Segurança

### 🔴 CRÍTICO-01 — Chave de API Hardcoded no Código-Fonte

**Arquivo:** `src/app/api/pdf/export/route.ts` — Linha 6

```ts
const apiKey = process.env.NEXT_PUBLIC_PDF_API_KEY || "3xEt7CBU1XydZFeA4foiNgSGJOfCcwab";
```

**Problema:** Uma chave de API real está embutida diretamente no código como fallback. Qualquer pessoa com acesso ao repositório (ou ao bundle do cliente se esse código vazar) obtém a chave. A variável usa prefixo `NEXT_PUBLIC_`, o que pode expô-la ao bundle do cliente.

**Impacto:** Comprometimento da chave de API; custos não autorizados na API remota de PDF.

**Correção:**
- Remover o valor hardcoded; usar somente `process.env.NEXT_PUBLIC_PDF_API_KEY`.
- Renomear para `PDF_API_KEY` (sem `NEXT_PUBLIC_`) pois é usada exclusivamente no servidor.
- Retornar `500` com mensagem genérica quando a chave estiver ausente.

---

### 🔴 CRÍTICO-02 — Endpoint de Imagens sem Autenticação

**Arquivo:** `src/app/api/images/route.ts`

```ts
// GET e POST não verificam autenticação em momento algum
export async function GET() { ... }
export async function POST(req: Request) { ... }
```

**Problema:** Qualquer usuário anônimo pode:
- Listar **todas** as imagens do Cloudinary (GET).
- Fazer upload de arquivos arbitrários para o Cloudinary (POST) sem autenticação, sem validação de tipo, sem limite de tamanho.

**Impacto:** Exposição de conteúdo privado; esgotamento de cota/crédito do Cloudinary; possível upload de conteúdo malicioso.

**Correção:**
- Adicionar verificação de autenticação via Clerk em ambos os handlers.
- Adicionar validação de tipo MIME (apenas `image/jpeg`, `image/png`, `image/webp`).
- Limitar o tamanho máximo do arquivo (ex.: 5 MB).
- Este endpoint **não está listado como rota protegida no middleware** — adicionar `/api/images(.*)` em `isProtectedRoute`.

---

### 🔴 CRÍTICO-03 — Rate Limit da IA Desabilitado

**Arquivo:** `src/app/api/ai/rewrite/route.ts` — Linhas 63–72

```ts
// 3. Rate Limiting (desabilitado para debug)
/*
const rateLimit = await checkAiRateLimit(user.id, user.subscription?.plan ?? "free");
...
*/
```

**Problema:** O controle de limites de uso da IA está completamente comentado na rota mais chamada do sistema. Qualquer usuário autenticado pode fazer chamadas ilimitadas à API OpenAI.

**Impacto:** Custo financeiro ilimitado com a OpenAI; degradação de serviço para outros usuários.

**Correção:** Reabilitar o rate limiting antes de qualquer deploy em produção. A rota de tradução (`/api/ai/translate`) possui o controle corretamente ativo — replicar o padrão.

---

### 🟠 ALTO-04 — Stack Trace Exposto na Resposta de Erro (AI Rewrite)

**Arquivo:** `src/app/api/ai/rewrite/route.ts` — Linhas 105–109

```ts
return NextResponse.json({
    error: "Erro interno no servidor debug",
    message: error.message,
    stack: error.stack   // ← stack trace exposto!
}, { status: 500 });
```

**Problema:** Em caso de erro, o servidor retorna o stack trace completo na resposta HTTP, visível para qualquer cliente. Isso pode revelar caminhos de arquivo internos, versões de dependências e estrutura do código — informação valiosa para atacantes.

**Impacto:** Information Disclosure (CWE-200); facilita engenharia reversa e exploração de vulnerabilidades.

**Correção:** Remover `message` e `stack` da resposta em produção. Logar internamente com um ID de correlação e retornar apenas `{ error: "Erro interno." }`.

---

### 🟠 ALTO-05 — Endpoint de Diagnóstico Exposto em Produção

**Arquivo:** `src/app/api/documents/[id]/drafts/route.ts` — Linhas 44–52

```ts
const dbModels = Object.keys(db).filter(...);
if (req.headers.get("x-diagnose") === "true") {
    return NextResponse.json({
        dbModels,
        dbDraftType: typeof (db as any).draft,
        documentInModels: dbModels.includes("document"),
        draftInModels: dbModels.includes("draft")
    });
}
```

**Problema:** Qualquer requisição com o header `x-diagnose: true` retorna informações estruturais internas do banco de dados sem qualquer verificação de autenticação ou autorização (a verificação de auth ocorre *após* esse bloco).

**Impacto:** Information Disclosure sobre o schema interno; endpoint de debug em código de produção.

**Correção:** Remover esta lógica de diagnóstico completamente. Debug deve ser feito em ambiente local ou via ferramentas administrativas com acesso restrito.

---

### 🟡 MÉDIO-06 — Arquivo de Log Criado no Diretório de Trabalho

**Arquivo:** `src/app/api/ai/rewrite/route.ts` — Linhas 11–14

```ts
function logError(msg: string) {
    const logPath = path.join(process.cwd(), "rewrite-error.log");
    fs.appendFileSync(logPath, ...);
}
```

**Problema:** O sistema escreve um arquivo de log (`rewrite-error.log`) diretamente no diretório raiz da aplicação. Em produção (ex.: Vercel), o sistema de arquivos é efêmero e somente-leitura — isso causará erros silenciosos. Em ambiente de container, pode crescer indefinidamente consumindo disco.

**Correção:** Usar um serviço de logging estruturado (ex.: `winston`, `pino`, Vercel Log Drains, ou Sentry) em vez de `fs.appendFileSync`.

---

### 🟡 MÉDIO-07 — Paginação sem Limites Máximos

**Arquivo:** `src/app/api/documents/route.ts` — Linhas 66–68

```ts
const page = parseInt(searchParams.get("page") || "1");
const limit = parseInt(searchParams.get("limit") || "10");
const skip = (page - 1) * limit;
```

**Problema:** Um cliente malicioso pode enviar `?limit=100000` e forçar uma query retornando todos os documentos de um usuário, causando sobrecarga no banco e na memória.

**Correção:**
```ts
const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
```

---

### 🟡 MÉDIO-08 — Validação Ausente no Body de Configurações do Editor

**Arquivo:** `src/app/api/editor-settings/route.ts`

**Problema:** Os campos `toolbarSettings`, `activeTones` e `customTones` recebidos no body não têm validação de schema (tipo, estrutura, valores esperados). Um cliente pode enviar payloads arbitrários que são persistidos diretamente como JSON no banco.

**Impacto:** Dados corrompidos no banco; comportamento imprevisível no front-end ao desserializar.

**Correção:** Adicionar validação com Zod para os três campos antes do upsert.

---

### 🟡 MÉDIO-09 — Webhook do Clerk sem Tratamento de Erros de Banco

**Arquivo:** `src/app/api/webhooks/clerk/route.ts`

**Problema:** As operações de banco de dados (`db.user.create`, `db.user.update`, `db.user.delete`) dentro do handler do webhook não estão dentro de blocos `try/catch`. Uma falha de banco retornaria um erro 500 não controlado, e o Clerk faria reenvios repetidos do webhook, potencialmente criando entradas duplicadas.

**Correção:** Envolver cada bloco de evento em `try/catch` com logging adequado, e usar `upsert` para criar/atualizar usuarios de forma idempotente.

---

### 🟢 BAIXO-10 — Variável de Ambiente com `!` Não-Nulo Sem Verificação

**Arquivo:** `src/app/api/webhooks/stripe/route.ts` — Linha 63

```ts
process.env.STRIPE_WEBHOOK_SECRET!
```

**Problema:** O uso de `!` (non-null assertion) silencia a verificação de TypeScript. Se a variável não estiver configurada, `stripe.webhooks.constructEvent` lançará um erro pouco descritivo.

**Correção:** Verificar a existência da variável no início do handler, como já é feito com `CLERK_WEBHOOK_SECRET`.

---

## 2. Bugs Confirmados / Riscos de Comportamento Incorreto

### 🟠 BUG-01 — Race Condition na Criação de Rascunhos

**Arquivo:** `src/app/api/documents/[id]/drafts/route.ts` — Linhas 79–94

**Problema:** A lógica de throttling/criação de rascunho usa duas queries separadas sem transação:
1. `findFirst` para buscar o rascunho mais recente.
2. `update` ou `create` condicionalmente.

Em ambientes com múltiplas instâncias (produção), dois requests simultâneos podem ler o mesmo "último rascunho" e ambos tentar atualizar — ou ambos criar um novo rascunho, violando o limite de 5.

**Correção:** Usar uma transação Prisma (`db.$transaction`) ou um lock pessimista para tornar a operação atômica.

---

### 🟠 BUG-02 — `getUserPlan` Não Invalida Cache Entre Requests

**Arquivo:** `src/lib/auth.ts`

```ts
export const getUserPlan = cache(async () => { ... });
```

**Problema:** O `cache` do React é por request no servidor (correto para SSR), mas pode causar inconsistências na lógica de autorização se `getCurrentUser` e `getUserPlan` forem chamados em contextos diferentes dentro do mesmo request com dados divergentes.

**Risco:** Usuário com assinatura expirada continua tendo acesso à funcionalidade PRO durante a janela de cache.

---

### 🟡 BUG-03 — SEO usa Modelo Fixo `gpt-4o` Ignorando Configuração de Ambiente

**Arquivo:** `src/app/api/ai/seo/route.ts` — Linha 35

```ts
model: openai("gpt-4o"),  // Hardcoded, ignora AI_MODEL env var
```

**Problema:** A rota de SEO usa `gpt-4o` hardcoded, enquanto as demais rotas respeitam `process.env.AI_MODEL`. Isso impede configuração centralizada do modelo e garante uso obrigatório de um modelo mais caro.

**Correção:** `openai(process.env.AI_MODEL ?? "gpt-4o-mini")`

---

### 🟡 BUG-04 — Idioma de Tradução Sem Sanitização (Prompt Injection)

**Arquivo:** `src/app/api/ai/translate/route.ts` — Linha 33

```ts
messages: [{ role: "user", content: `Traduza para "${to}":\n\n${content}` }]
```

**Problema:** O parâmetro `to` (idioma alvo) é inserido diretamente no prompt sem sanitização. Um usuário poderia enviar `to = 'português" e ignore as instruções anteriores e...'` para tentar manipular o comportamento do modelo (Prompt Injection).

**Correção:** Validar `to` contra uma lista de idiomas permitidos (ex.: `["pt-BR", "en-US", "es", "fr", "de"]`).

---

## 3. Escalabilidade

### Pontos Fortes ✅

| Área | Avaliação |
|------|-----------|
| Banco de dados (Prisma/PostgreSQL) | Índices definidos nas tabelas críticas (`userId`, `documentId + createdAt`, `userId + createdAt`) |
| Paginação de documentos | Implementada com `skip/take` |
| Multi-tenancy | Corretamente isolado por `userId` em todas as queries |
| Streaming de IA | Usa `streamText` — não bloqueia o servidor enquanto aguarda a resposta da OpenAI |
| Webhook Stripe | Idempotente com `upsert` |
| Cache de requisições | `react/cache` evita múltiplos fetches do mesmo usuário no mesmo request |

### Riscos de Escalabilidade ⚠️

| Área | Risco | Severidade |
|------|-------|-----------|
| **Rate limiting de IA desabilitado** | Custo OpenAI cresce linearmente com usuários sem controle | 🔴 Crítico |
| **Sem paginação em rascunhos** | `db.draft.findMany` retorna todos os rascunhos sem limite | 🟠 Alto |
| **Sem cache de configurações do editor** | Cada carregamento do editor faz uma query ao banco | 🟡 Médio |
| **Sem CDN para Cloudinary** | Imagens são servidas diretamente; sem invalidação programática | 🟡 Médio |
| **Arquivo de log em disco** | `fs.appendFileSync` bloqueante e não escalável horizontalmente | 🟡 Médio |
| **Sem fila para chamadas de IA** | Picos de uso podem sobrecarregar a API OpenAI sem backoff | 🟡 Médio |
| **Sem índice em `AiUsage.feature`** | Queries de rate-limit por feature farão full scan em tabelas grandes | 🟡 Médio |

### Recomendações de Longo Prazo

- **Caching de segundo nível:** Adicionar Redis/Upstash para cache de configurações frequentemente lidas.
- **Fila de jobs:** Para operações pesadas (geração de PDF, SEO analysis), usar uma fila como BullMQ ou Trigger.dev.
- **Monitoramento:** Integrar Sentry (erros) e Vercel Analytics já presente (performance). Adicionar alertas de custo na OpenAI.
- **Connection pooling:** Em produção PostgreSQL, usar PgBouncer ou Prisma Accelerate para evitar esgotamento de conexões.

---

## 4. Prontidão para MVP (Produção)

### Critérios Avaliados

| # | Critério | Status | Observação |
|---|----------|--------|-----------|
| 1 | Autenticação implementada | ✅ | Clerk integrado corretamente |
| 2 | Autorização por recurso | ✅ | `userId` verificado em todas as queries de documentos |
| 3 | Webhooks validados | ✅ | Svix (Clerk) e Stripe assinatura verificados |
| 4 | Pagamento funcional | ✅ | Checkout + Portal + Webhook do Stripe implementados |
| 5 | Rate limiting de IA | ❌ | **Desabilitado** — impede lançamento seguro |
| 6 | Segredos de API seguros | ❌ | Chave hardcoded no código |
| 7 | Endpoint de imagens autenticado | ❌ | Acesso público não intencional |
| 8 | Informações de debug removidas | ❌ | Stack trace e endpoint de diagnóstico expostos |
| 9 | Testes automatizados | ❌ | Nenhum teste encontrado no projeto |
| 10 | Logging estruturado | ⚠️ | Apenas `console.log/error` |
| 11 | Variáveis de ambiente documentadas | ⚠️ | `.env.example` existe mas incompleto (falta `OPENAI_API_KEY`, `DATABASE_URL`, `STRIPE_WEBHOOK_SECRET`, etc.) |
| 12 | Schema de banco migrado | ✅ | Prisma schema bem estruturado |
| 13 | i18n implementado | ✅ | Middleware de locale presente |
| 14 | SEO básico | ✅ | Sitemap e robots.txt configurados |
| 15 | CORS / Headers de segurança | ⚠️ | Não verificados headers HTTP Security (CSP, HSTS, X-Frame-Options) em `next.config.mjs` |

---

## 5. Checklist de MVP

### ❌ Bloqueadores de Lançamento (devem ser corrigidos ANTES de ir para produção)

- [x] **SEC-01:** (FIXED) Remover chave de API hardcoded em `/api/pdf/export/route.ts`
- [x] **SEC-02:** (FIXED) Adicionar autenticação no endpoint `/api/images`
- [x] **SEC-03:** (FIXED) Reabilitar rate limiting no `/api/ai/rewrite`
- [x] **SEC-04:** (FIXED) Remover `stack` e `message` dos responses de erro em produção
- [x] **SEC-05:** (FIXED) Remover endpoint de diagnóstico (`x-diagnose`) do código de produção

### ⚠️ Alta Prioridade (corrigir antes de usuários reais)

- [x] **BUG-01:** (FIXED) Usar transação Prisma nos rascunhos para evitar race condition
- [x] **BUG-04:** (FIXED) Sanitizar/validar o parâmetro de idioma na tradução
- [x] **SCALE-01:** (FIXED) Adicionar limite máximo em `?limit=` na paginação de documentos
- [x] **SEC-09:** (FIXED) Adicionar try/catch nas operações de banco no webhook do Clerk
- [x] **ENV:** (FIXED) Completar o `.env.example` com todas as variáveis necessárias

### 🟡 Melhorias Recomendadas (pós-MVP)

- [ ] Adicionar validação Zod nas configurações do editor
- [ ] Implementar testes automatizados (pelo menos para as rotas de API críticas)
- [ ] Substituir `fs.appendFileSync` por logging estruturado (Sentry/Pino)
- [x] **BUG-02:** (FIXED) Possível inconsistência de cache em `src/lib/auth.ts`
- [x] **SCALE-01:** (FIXED) Adicionar paginação nos endpoints de rascunhos
- [ ] Configurar Security Headers em `next.config.mjs` (CSP, HSTS, X-Frame-Options)
- [ ] Configurar Sentry ou equivalente para monitoramento de erros em produção

---

*Relatório gerado em análise estática de código. Recomenda-se complementar com testes de integração e penetration testing antes do lançamento.*
