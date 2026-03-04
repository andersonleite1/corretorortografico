# Relatório de Qualidade (QA) — Editor de Texto — v3

**Data:** 2026-02-22  
**Analista:** Antigravity (Agente QA)  
**Versão do sistema:** `0.1.0` (pré-produção — branch `feat/v2`)  
**Stack:** Next.js 14, Clerk, Prisma/PostgreSQL, Stripe, OpenAI, Cloudinary, Tiptap, Sentry  
**Base:** Análise complementar ao `qa_report_2.md`. Foca exclusivamente em issues **novas** ainda não documentadas, após a confirmação de todas as correções aplicadas.

---

## Resumo Executivo

A análise estática nesta terceira rodada confirmou que **todas as 14 correções da v2 foram aplicadas corretamente**. Foram identificados **9 novos problemas**, sendo 1 bloqueador, 3 de alta prioridade e 5 de média/baixa prioridade.

**Veredito de prontidão MVP:** ⚠️ **Quase Pronto** — Existem issues de alta prioridade que representam riscos de abuso e integridade de dados que devem ser resolvidas (como rate limit no PDF e validação em drafts).

---

## Índice

1. [Confirmação de Correções do Relatório Anterior (v2)](#1-confirmação-de-correções-do-relatório-anterior-v2)
2. [Novas Vulnerabilidades de Segurança](#2-novas-vulnerabilidades-de-segurança)
3. [Novos Bugs / Riscos de Comportamento Incorreto](#3-novos-bugs--riscos-de-comportamento-incorreto)
4. [Escalabilidade — Estado Atual](#4-escalabilidade--estado-atual)
5. [Cobertura de Testes](#5-cobertura-de-testes)
6. [Prontidão para MVP — Checklist](#6-prontidão-para-mvp--checklist)

---

## 1. Confirmação de Correções do Relatório Anterior (v2)

| ID v2     | Descrição                                                           | Status                                                     |
| --------- | ------------------------------------------------------------------- | ---------------------------------------------------------- |
| ALTO-N01  | `productionBrowserSourceMaps: true`                                 | ✅ CORRIGIDO → `false`                                     |
| MÉDIO-N02 | LanguageTool sem proteção contra abuso (Origin Check)               | ✅ CORRIGIDO → validação de Origin                         |
| ALTO-N03  | SSRF potencial no proxy de PDF (sem sanitização HTML)               | ✅ CORRIGIDO → `isomorphic-dompurify`                      |
| MÉDIO-N04 | Rate limit não segmentado por feature                               | ✅ CORRIGIDO → limite global por mês validado com negócio  |
| MÉDIO-N05 | Endpoint de SEO sem rate limiting                                   | ✅ CORRIGIDO → `checkAiRateLimit` adicionado               |
| MÉDIO-N06 | CSP incompleta (OpenAI, LanguageTool, Cloudinary ausentes)          | ✅ CORRIGIDO → domínios adicionados ao `connect-src`       |
| MÉDIO-N07 | Imagens Cloudinary sem isolamento por usuário                       | ✅ CORRIGIDO → filtro por tag `userId`                     |
| BAIXO-N08 | `stripe-signature` com non-null assertion `!`                       | ✅ CORRIGIDO → verificação explícita com `if (!signature)` |
| BUG-N01   | `content` sem limite de tamanho no POST de documentos               | ✅ CORRIGIDO → Zod `max(500_000)`                          |
| BUG-N02   | Deleção de usuário no Clerk retorna 200 em erro                     | ✅ CORRIGIDO → retorna status 500                          |
| BUG-N03   | `reactStrictMode: false`                                            | ✅ CORRIGIDO → `true`                                      |
| BUG-N04   | Cloudinary sem validação de MIME e tamanho                          | ✅ CORRIGIDO → `ALLOWED_TYPES` e `MAX_SIZE` validados      |
| SCALE     | Índice `@@index([userId, feature, createdAt])` ausente em `AiUsage` | ✅ CORRIGIDO → índice adicionado ao schema                 |
| TEST      | Mock incorreto em `ai-rewrite.test.ts` (`success` → `allowed`)      | ✅ CORRIGIDO → estrutura do mock atualizada                |

---

## 2. Novas Vulnerabilidades de Segurança

### 🟠 ALTO-T01 — Proxy de PDF Aberto Sem Limite de Abuso (Rate Limiting)

**Arquivo:** `src/app/api/pdf/export/route.ts`

**Contexto:** O recurso será disponibilizado de forma **gratuita e sem autenticação**.

**Problema:** Sendo um endpoint público não protegido (`POST /api/pdf/export`), sem uma defesa nativa de limite, qualquer IP pode fazer solicitações sucessivas sem restrição, esgotando recursos ou onerando a infraestrutura de proxy de PDF remota.

**Impacto:** Alto — Risco de DoS (Negação de Serviço) e uso automatizado predatório ao sistema.

**Correção:**

- Adicionar controle de Rate Limit de no máximo 10 exportações por minuto, aplicando o bloqueio via IP de quem faz o request.

---

### 🟢 BAIXO-T02 — Recurso Depreciado Exposto (Mercado Livre)

**Arquivo:** `src/app/api/mercado-livre/products/route.ts`

**Problema:** O endpoint de listagem de produtos do Mercado Livre ainda consta na base de código ativa, apresentando uma rota sem controle ou utilidade real no ecossistema atual do editor (recurso depreciado).

**Correção:** Remover completamente o diretório `src/app/api/mercado-livre/`.

---

### 🟠 ALTO-T03 — `headers()` No Clerk Webhook Não Está Sendo `await`-ado

**Arquivo:** `src/app/api/webhooks/clerk/route.ts` — Linha 16

```ts
// Atual (potencialmente problemático no Next.js 15+):
const headerPayload = headers(); // ← sem await
const svixId = headerPayload.get("svix-id");
```

**Problema:** Em Next.js 15, a função `headers()` foi convertida para assíncrona e **requer `await`**. O projeto usa Next.js 14 atualmente, onde ainda funciona de forma síncrona, mas esta linha causará uma **quebra silenciosa** quando o projeto for atualizado para Next.js 15+. Compare com o webhook do Stripe (mesmo projeto), onde `headers()` **já é corretamente `await`-ado** na linha 62:

```ts
// stripe/route.ts (CORRETO):
const signature = (await headers()).get("stripe-signature");
```

**Impacto:** Inconsistência entre dois webhooks do mesmo projeto; potencial quebra ao atualizar Next.js.

**Correção:**

```ts
const headerPayload = await headers();
```

---

### 🟡 MÉDIO-T04 — `customTones` Schema Zod Sem Campo `id` — Perda de Dados no Upsert

**Arquivo:** `src/app/api/editor-settings/route.ts` — Linhas 13–18

```ts
customTones: z.array(z.object({
    name: z.string().min(1).max(50),
    description: z.string().min(1).max(200),
    priority: z.number().optional().default(0),
    instructions: z.string().min(1).max(1000).optional(),
    // ← CAMPO `id` AUSENTE
})).max(5).optional(),
```

**Problema:** O schema Zod que valida a atualização de `customTones` não inclui o campo `id`. Quando o cliente envia a lista de tons customizados (incluindo os tons existentes com seus `id`s), o campo `id` é stripado pelo Zod antes de ser persistido. Isso impede que o sistema identifique qual tom foi editado vs. criado, levando a problemas de sincronização e potencial perda de referências a tons existentes no cliente.

**Correção:**

```ts
customTones: z.array(z.object({
    id: z.string().optional(),  // ← id do tom para edições
    name: z.string().min(1).max(50),
    description: z.string().min(1).max(200),
    priority: z.number().optional().default(0),
    instructions: z.string().min(1).max(1000).optional(),
})).max(5).optional(),
```

---

### 🟡 MÉDIO-T05 — `priceId` Não Validado Contra Lista de Preços Autorizados (Stripe Checkout)

**Arquivo:** `src/app/api/stripe/checkout/route.ts` — Linha 20

```ts
const { priceId } = schema.parse(body);
// priceId é validado como `z.string()` apenas — qualquer string passa
const session = await stripe.checkout.sessions.create({
    line_items: [{ price: priceId, quantity: 1 }], // ← priceId não verificado contra lista autorizda
    ...
});
```

**Problema:** O `priceId` é validado apenas como `string` arbitrária. Um usuário mal-intencionado ou erro de cliente pode enviar um `priceId` inválido ou corresponder a um produto diferente do esperado, resultando em:

1. Erro genérico do Stripe (que pode vazar informações do tenant ID do Stripe).
2. Criação de sessões para produtos não intencionados se o `priceId` corresponder a algum outro produto na conta Stripe.

**Correção:**

```ts
import { PLAN_BY_PRICE_ID } from "@/lib/stripe";

const VALID_PRICE_IDS = Object.keys(PLAN_BY_PRICE_ID);

const schema = z.object({
  priceId: z.string().refine((id) => VALID_PRICE_IDS.includes(id), {
    message: "Plano inválido.",
  }),
});
```

---

## 3. Novos Bugs / Riscos de Comportamento Incorreto

### 🟡 BUG-T01 — Parâmetro `page` Sem Validação — Possível Query com `skip` Negativo

**Arquivo:** `src/app/api/documents/route.ts` — Linhas 75–77 e  
**Arquivo:** `src/app/api/documents/[id]/drafts/route.ts` — Linhas 21–23

```ts
const page = parseInt(searchParams.get("page") || "1"); // ← sem validade mínima
const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
const skip = (page - 1) * limit; // ← se page=0, skip=-10 → erro no Prisma
```

**Problema:** Se `page=0` ou `page=-1` for enviado na query string, o valor `skip` resultante será **negativo** (`-10`). O Prisma lança uma exceção para valores negativos em `skip`, retornando HTTP 500 ao cliente com uma mensagem genérica "Erro Interno". Embora seja difícil de explorar maliciosamente, representa um vetor de erro simples e uma UX ruim.

**Correção:**

```ts
const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
```

---

### 🟡 BUG-T02 — `drafts/route.ts` POST Sem Validação de Tamanho de `content` e `title`

**Arquivo:** `src/app/api/documents/[id]/drafts/route.ts` — Linha 71

```ts
const { title, content, isExplicitSave } = body;
// ← Sem validação Zod
// ← Sem limite de tamanho para `content`
// ← Sem verificação de tipo para `isExplicitSave`
```

**Problema:** Ao contrário do endpoint `POST /api/documents` (que usa Zod com `max(500_000)`), a rota de rascunhos não valida os dados de entrada. Um cliente pode enviar:

- `content` ilimitado → sobrecarga de memória e linhas gigantes no PostgreSQL (mesma vulnerabilidade que existia em BUG-N01, agora corrigida em documentos mas ainda presente em rascunhos).
- `isExplicitSave` não-booleano → comportamento imprevisível na lógica de throttle.
- `title` sem limite de tamanho.

**Impacto:** DoS potencial por payloads grandes; comportamento incorreto da lógica de throttle.

**Correção:**

```ts
import { z } from "zod";

const draftSchema = z.object({
  title: z.string().max(500).optional(),
  content: z.string().min(1).max(500_000),
  isExplicitSave: z.boolean().optional().default(false),
});

const { title, content, isExplicitSave } = draftSchema.parse(body);
```

---

### 🟢 BAIXO-T03 — `images.domains` Depreciado no `next.config.mjs`

**Arquivo:** `next.config.mjs` — Linha 38

```js
images: {
    domains: ["res.cloudinary.com", "images.unsplash.com", "http2.mlstatic.com"],
    // remotePatterns está comentado
},
```

**Problema:** A opção `domains` para configuração de imagens remotas está **depreciada desde Next.js 13** e recomenda-se usar `remotePatterns` em seu lugar. A configuração atual usa `domains` (menos seguro, não permite especificar caminhos) e deixa `remotePatterns` comentado. Em versões futuras do Next.js, `domains` pode ser removida.

**Correção:** Descomentar e completar `remotePatterns`:

```js
images: {
    remotePatterns: [
        { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
        { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
        { protocol: "http", hostname: "http2.mlstatic.com", pathname: "/**" },
    ],
},
```

---

### 🟢 BAIXO-T04 — `error.message` Exposto no Proxy de PDF em Erros de Rede

**Arquivo:** `src/app/api/pdf/export/route.ts` — Linha 46

```ts
} catch (error: any) {
    console.error("Erro no proxy de PDF:", error);
    return new NextResponse(error.message || "Erro interno no servidor de proxy", { status: 500 });
}
```

**Problema:** Em caso de erro de rede (ex.: timeout de conexão com `api.editordetexto.cloud`), o `error.message` do Node.js pode conter informações de infraestrutura como: `"connect ECONNREFUSED 10.0.0.5:443"` ou `"getaddrinfo ENOTFOUND api.editordetexto.cloud"`, revelando endereços IP internos ou detalhes da topologia de rede.

**Correção:**

```ts
} catch (error: any) {
    console.error("Erro no proxy de PDF:", error);
    return new NextResponse("Erro interno no servidor de proxy.", { status: 500 });
}
```

---

## 4. Escalabilidade — Estado Atual

### Pontos Fortes ✅ (estado atual confirmado)

| Área                                | Avaliação                                          |
| ----------------------------------- | -------------------------------------------------- |
| Rate Limiting de IA                 | Ativo em `rewrite`, `translate` e `seo`            |
| Paginação de documentos e rascunhos | `Math.min(..., 100)` em ambos                      |
| Transação em rascunhos              | `db.$transaction` previne race conditions          |
| Streaming de IA                     | `streamText` não bloqueia o processo               |
| Webhook Stripe                      | Idempotente com `upsert`                           |
| CSP atualizada                      | Domínios de terceiros incluídos                    |
| Índice em `AiUsage`                 | `@@index([userId, feature, createdAt])` adicionado |
| Sanitize HTML PDF                   | `isomorphic-dompurify` implementado                |
| Isolamento de imagens               | Tag `userId` no Cloudinary                         |
| Source maps desabilitados           | `productionBrowserSourceMaps: false`               |
| Sentry integrado                    | Monitoramento de erros ativo                       |

### Riscos de Escalabilidade Restantes ⚠️

| Área                                     | Risco                                                                   | Severidade |
| ---------------------------------------- | ----------------------------------------------------------------------- | ---------- |
| **PDF sem Rate Limit**                   | Custo explosivo de chamadas por bots devido à gratuidade                | 🟠 Alto    |
| **Sem connection pooling**               | Risco de esgotamento de conexões PostgreSQL em produção multi-instance  | 🟠 Alto    |
| **Sem cache de configurações**           | Query ao banco em cada carregamento da página do editor                 | 🟡 Médio   |
| **Sem fila para chamadas pesadas**       | PDF e SEO podem sobrecarregar em pico de uso                            | 🟡 Médio   |
| **Rate limiting de IA sem persistência** | `checkAiRateLimit` faz query ao banco em cada chamada de IA (sem Redis) | 🟡 Médio   |
| **Rascunhos sem validação de tamanho**   | Payloads ilimitados no POST de drafts                                   | 🟠 Alto    |
| **`page=0` em paginação**                | Retorna HTTP 500 ao invés de 400                                        | 🟢 Baixo   |

### Recomendações de Longo Prazo

- **Prisma Accelerate ou PgBouncer:** Connection pooling para PostgreSQL em produção.
- **Redis/Upstash:** Cache de rate limits de IA para evitar queries ao banco a cada request.
- **Fila de jobs (BullMQ ou Trigger.dev):** Geração de PDF e análise SEO como operações assíncronas.
- **Alertas de custo OpenAI:** Configurar limites de custo diário/mensal na dashboard da OpenAI.

---

## 5. Cobertura de Testes

### Estado Atual

```
Test Files: 2 passed
Tests:      3 passed
Coverage:   ~2% (estimado) — apenas 2 de 12+ endpoints testados
```

| Área                          | Cobertura                      |
| ----------------------------- | ------------------------------ |
| `/api/ai/rewrite`             | ✅ 1 teste (rate limit)        |
| `/api/documents` GET          | ✅ 2 testes (auth + paginação) |
| `/api/documents` POST         | ❌ Sem testes                  |
| `/api/documents/[id]` DELETE  | ❌ Sem testes                  |
| `/api/documents/[id]/drafts`  | ❌ Sem testes                  |
| `/api/ai/translate`           | ❌ Sem testes                  |
| `/api/ai/seo`                 | ❌ Sem testes                  |
| `/api/images`                 | ❌ Sem testes                  |
| `/api/editor-settings`        | ❌ Sem testes                  |
| `/api/webhooks/clerk`         | ❌ Sem testes                  |
| `/api/webhooks/stripe`        | ❌ Sem testes                  |
| `/api/pdf/export`             | ❌ Sem testes                  |
| `/api/languagetool`           | ❌ Sem testes                  |
| `/api/stripe/checkout`        | ❌ Sem testes                  |
| `/api/mercado-livre/products` | ❌ Sem testes                  |
| Middleware de autenticação    | ❌ Sem testes                  |

**Prioridade de novos testes:**

1. Webhooks (Clerk + Stripe) — lógica crítica de negócio e financeira
2. Rate limiting de IA — impacto financeiro direto
3. Endpoint de PDF — bloqueador de segurança identificado neste relatório
4. Autenticação e autorização — segurança

---

## 6. Prontidão para MVP — Checklist

### 🟠 Issues de Alta Prioridade

- [x] **SEC-T01:** Adicionar rate limit de max 10 exportações/minuto por IP no endpoint de PDF gratuito (`POST /api/pdf/export`).
- [x] **BUG-T02:** Adicionar validação Zod (incluindo limite de tamanho de `content`) no `POST /api/documents/[id]/drafts`.
- [x] **SEC-T05:** Validar `priceId` contra a lista de `PLAN_BY_PRICE_ID` antes de criar sessão no Stripe Checkout.

---

### 🟡 Melhorias Recomendadas

- [x] **SEC-T03:** Adicionar `await` ao `headers()` no webhook do Clerk (`/api/webhooks/clerk/route.ts`, linha 16).
- [x] **SEC-T04:** Adicionar campo `id` ao schema Zod de `customTones` em `/api/editor-settings/route.ts`.
- [x] **BUG-T01:** Adicionar `Math.max(1, ...)` na validação do parâmetro `page` nas rotas de documentos e rascunhos.
- [x] **SEC-T02:** Remover pasta depreciada `src/app/api/mercado-livre`.
- [x] **BAIXO-T03:** Migrar `images.domains` para `images.remotePatterns` no `next.config.mjs`.
- [x] **BAIXO-T04:** Remover `error.message` da resposta de erro no proxy de PDF.
- [ ] **TEST:** Expandir cobertura de testes para webhooks, PDF, rate limiting e autenticação.
- [ ] **SCALE:** Implementar Redis/Upstash para cache de rate limits de IA.
- [ ] **SCALE:** Configurar connection pooling (Prisma Accelerate ou PgBouncer).

---

### Quadro Geral de Prontidão para MVP

| #   | Critério                            | Status | Observação                                                              |
| --- | ----------------------------------- | ------ | ----------------------------------------------------------------------- |
| 1   | Autenticação implementada           | ✅     | Clerk integrado corretamente                                            |
| 2   | Autorização por recurso             | ✅     | `userId` verificado nas queries de documentos                           |
| 3   | Webhooks validados                  | ✅     | Svix (Clerk) e Stripe assinatura verificados                            |
| 4   | Pagamento funcional                 | ✅     | Checkout + Portal + Webhook do Stripe                                   |
| 5   | Rate limiting de IA                 | ✅     | Ativo em `rewrite`, `translate` e `seo`                                 |
| 6   | Segredos de API seguros             | ✅     | Nenhuma chave hardcoded encontrada                                      |
| 7   | Endpoints de API protegidos         | ✅     | `/api/pdf/export` com limitador de IP; API mercado-livre morta removida |
| 8   | Informações de debug removidas      | ✅     | Stack trace e diagnóstico removidos                                     |
| 9   | Testes automatizados                | ⚠️     | 3 testes passando, cobertura ~2%                                        |
| 10  | Logging estruturado                 | ⚠️     | `console.error` — adequado para Vercel/serverless                       |
| 11  | Variáveis de ambiente documentadas  | ✅     | `.env.example` completo                                                 |
| 12  | Schema de banco migrado             | ✅     | Prisma schema bem estruturado com índices                               |
| 13  | i18n implementado                   | ✅     | Middleware de locale presente                                           |
| 14  | SEO básico                          | ✅     | Sitemap e robots.txt configurados                                       |
| 15  | Security Headers                    | ✅     | HSTS, CSP, X-Frame-Options configurados                                 |
| 16  | Monitoramento de erros              | ✅     | Sentry integrado                                                        |
| 17  | Source Maps em produção             | ✅     | `productionBrowserSourceMaps: false`                                    |
| 18  | Isolamento de dados multi-tenant    | ✅     | Imagens filtradas por `userId` no Cloudinary                            |
| 19  | Validação de tamanho de payloads    | ✅     | Correto em documentos; **agora também validado em rascunhos via Zod**   |
| 20  | `priceId` validado contra allowlist | ✅     | Zod schema validando contra Object.keys(PLAN_BY_PRICE_ID)               |

---

### Resumo de Prioridades por Impacto

```
ALTO     (3): SEC-T01, BUG-T02, SEC-T05
MÉDIO    (2): SEC-T03, SEC-T04
BAIXO    (4): BUG-T01, SEC-T02, BAIXO-T03, BAIXO-T04
ESCALA   (2): Redis, Connection Pooling
TESTES   (∞): Cobertura geral insuficiente
```

---

_Relatório gerado em análise estática de código — 2026-02-22. Total de issues anteriores confirmadas: 14 de 14 corrigidas. Novas issues identificadas: 9 (3 alto, 2 médio, 4 baixo). _
