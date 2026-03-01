# QA Report #4 — Editor de Texto
**Data:** 2026-03-01  
**Analista:** Antigravity (Agente de IA — Papel: QA Analyst)  
**Versão do Sistema:** 0.1.0 (MVP)  
**Stack:** Next.js 14, TypeScript, Prisma/PostgreSQL, Clerk Auth, Stripe, OpenAI, Cloudinary, Tiptap, Sentry

---

## Índice

1. [Resumo Executivo](#resumo-executivo)
2. [Vulnerabilidades de Segurança](#vulnerabilidades-de-segurança)
3. [Bugs e Defeitos Funcionais](#bugs-e-defeitos-funcionais)
4. [Escalabilidade](#escalabilidade)
5. [Avaliação de Prontidão para Produção (MVP)](#avaliação-de-prontidão-para-produção-mvp)
6. [Recomendações Prioritárias](#recomendações-prioritárias)

---

## Resumo Executivo

| Categoria | Qtd. | Severidade Máx. |
|---|---|---|
| Vulnerabilidades de Segurança | 7 | 🔴 Crítica |
| Bugs / Defeitos Funcionais | 5 | 🟠 Alta |
| Riscos de Escalabilidade | 4 | 🟠 Alta |
| **Total de Problemas** | **16** | |

**Veredito MVP:** ⚠️ **CONDICIONAL** — O sistema possui fundações sólidas, mas 3 vulnerabilidades de segurança devem ser corrigidas obrigatoriamente antes do lançamento público.

---

## Vulnerabilidades de Segurança

### 🔴 [FIXED] [SEG-01] Endpoint `/api/bug-reports` Não Requer Autenticação (Crítica)

**Arquivo:** `src/app/api/bug-reports/route.ts`  
**Descrição:** O endpoint `POST /api/bug-reports` é acessível sem autenticação e sem qualquer rate limiting. Um atacante pode automatizar o envio de milhares de relatórios falsos, saturando o banco de dados e o serviço de notificações.

```typescript
// Linha 18: auth() é chamado mas o clerkId nunca é verificado como obrigatório
const { userId: clerkId } = await auth();
// Fluxo continua mesmo com clerkId = null
```

**Impacto:** Saturação do banco de dados, custos inesperados, spam de notificações.  
**Recomendação:** Adicionar rate limiting por IP (ex: máx. 5 reports/hora/IP). Considerar CAPTCHA para usuários não autenticados. Adicione um limite de tamanho para `additionalInfo` validado no servidor.

---

### 🔴 [FIXED] [SEG-02] Autenticação Frágil na Rota `/api/languagetool` — Spoofável via Header `Origin` (Crítica)

**Arquivo:** `src/app/api/languagetool/route.ts`  
**Descrição:** A proteção deste endpoint baseia-se exclusivamente na verificação do header `Origin` ou `Referer`, que pode ser trivialmente forjado em requisições server-to-server (curl, Postman, scripts automatizados). O header `Origin` não é enviado em requisições de servidor, mas qualquer script pode defini-lo manualmente.

```typescript
// Linhas 12-19: verificação spoofável
const origin = request.headers.get("origin") || request.headers.get("referer");
if (!origin || !origin.startsWith(appUrl)) { ... }
```

**Impacto:** Uso não autorizado do serviço LanguageTool hospedado em `languagetool.editordetexto.cloud`, gerando custos e sobrecarga no servidor externo.  
**Recomendação:** Adicionar exigência de autenticação Clerk (mesmo que o usuário seja free). Implementar rate limiting por IP no nível do servidor de hosting, ou exigir um API token interno rotacionado.

---

### 🔴 [FIXED] [SEG-03] Prompt Injection via `customInstructions` na IA (Crítica)

**Arquivo:** `src/app/api/ai/rewrite/route.ts`  
**Descrição:** O campo `customInstructions` fornecido pelo usuário é injetado diretamente no prompt enviado à OpenAI sem sanitização ou restrição semântica. Um usuário mal-intencionado pode utilizar este campo para realizar ataques de "prompt injection", contornando o system prompt e forçando a IA a produzir conteúdo indesejado ou vazar informações de contexto.

```typescript
// Linha 103-105: injeção direta sem sanitização
const extraPrompt = customInstructions
  ? `\nInstruções específicas do usuário a seguir: ${customInstructions}`
  : `\nEstilo solicitado: ${stylePrompt}`;
```

**Impacto:** Abuso da API da OpenAI (custo), geração de conteúdo inapropriado, potencial extração do system prompt.  
**Recomendação:** Aplicar sanitização básica: remover sequências como `"Ignore as instruções anteriores"`, `"system:"`, `"INSTRUÇÃO:"`. Usar o campo `customInstructions` como metadado separado em vez de concatená-lo ao prompt principal. Explorar o parâmetro `user` da API da OpenAI para rastreamento de abuso.

---

### 🟠 [SEG-04] Rate Limiting In-Memory no `/api/pdf/export` — Não Persistente (Alta)

**Arquivo:** `src/app/api/pdf/export/route.ts`  
**Descrição:** O rate limiting é implementado usando um `Map` em memória (`ipRateLimitMap`). Em ambientes com múltiplas instâncias (Vercel Serverless Functions, Docker com múltiplas réplicas), cada instância mantém seu próprio contador isolado, tornando o limite completamente ineficaz. Além disso, o mapa não tem mecanismo de limpeza (memory leak progressivo).

```typescript
const ipRateLimitMap = new Map<string, { count: number; resetTime: number }>();
// Este Map vive apenas na memória desta instância do servidor
```

**Impacto:** Abuso do serviço de geração de PDF e custos inesperados.  
**Recomendação:** Migrar o rate limiting para Redis (ex: Upstash Redis + `@upstash/ratelimit`) ou para uma tabela no banco de dados.

---

### 🟠 [SEG-05] Ausência de Rate Limiting na Rota `/api/ai/translate` e `/api/ai/seo` (Alta)

**Arquivo:** `src/app/api/ai/translate/route.ts`, `src/app/api/ai/seo/route.ts`  
**Descrição:** Não foi possível verificar se as outras rotas de IA implementam o mesmo `checkAiRateLimit` da rota de rewrite. Se não o fizerem, um usuário free pode chamar os endpoints de tradução e SEO sem limitação de uso.  
**Recomendação:** Confirmar e garantir que `checkAiRateLimit` é aplicado uniformemente em **todas** as rotas de IA.

---

### 🟡 [SEG-06] Content Security Policy com `'unsafe-inline'` e `'unsafe-eval'` (Média)

**Arquivo:** `next.config.mjs`  
**Descrição:** A CSP (Content Security Policy) configurada inclui `'unsafe-inline'` e `'unsafe-eval'` na diretiva `script-src`. Isso enfraquece significativamente a proteção contra ataques de Cross-Site Scripting (XSS), que são especialmente relevantes neste contexto pois a aplicação é um editor de HTML rico.

**Recomendação:** Explorar a migração para nonces ou hashes de CSP. Remover `'unsafe-eval'` especialmente se não for obrigatório por alguma dependência específica. Avaliar quais bibliotecas exigem `unsafe-eval` e buscar alternativas.

---

### 🟡 [SEG-07] `public_id` do Cloudinary Derivado do Nome do Arquivo do Usuário (Média)

**Arquivo:** `src/app/api/images/route.ts`  
**Descrição:** O `public_id` da imagem no Cloudinary é derivado diretamente do nome do arquivo original do usuário (sem o ramal).

```typescript
// Linha 91
public_id: file.name.split(/\.\w+$/)[0],
```

Isso pode causar colisões de `public_id` entre diferentes usuários que enviem arquivos com o mesmo nome (ex: `foto.jpg`), sobrescrevendo imagens de outros usuários no Cloudinary (se o mesmo `public_id` for usado em uma conta compartilhada) ou resultando em comportamento inesperado.  
**Recomendação:** Incluir o `userId` no `public_id` para garantir unicidade e isolamento: `public_id: \`${userId}/${uuidv4()}\``.

---

## Bugs e Defeitos Funcionais

### 🟠 [FIXED] [BUG-01] Middleware Falha Silenciosamente e Prossegue com i18n em Erros de Auth (Alta)

**Arquivo:** `src/middleware.ts`  
**Descrição:** No bloco `catch` do middleware, a função `i18nMiddleware` é chamada mesmo quando ocorre um erro de autenticação. Isso significa que um erro no Clerk não causará um retorno 401 — a requisição será simplesmente redirecionada/reescrita normalmente, podendo acessar rotas protegidas sem autenticação em caso de falha do serviço de auth.

```typescript
// Linhas 108-112
} catch (error) {
  console.error("[Middleware Error]:", error);
  return i18nMiddleware(request); // ← continua mesmo em erro de auth!
}
```

**Impacto:** Em caso de indisponibilidade temporária do Clerk, rotas protegidas como `/editor` ficam acessíveis sem autenticação.  
**Recomendação:** Diferenciar erros de autenticação de outros erros de infraestrutura. Em erros de auth em rotas protegidas, retornar 401 ou redirecionar para o login.

---

### 🟠 [FIXED] [BUG-02] Ausência de Resposta de Erro quando `result` é `undefined` no Upload de Imagem (Alta)

**Arquivo:** `src/app/api/images/route.ts`  
**Descrição:** Se o upload ao Cloudinary retornar `undefined` (sem lançar exceção), a função `POST` retorna `undefined` implicitamente, o que em Next.js resulta em um erro de runtime pois um `Response` object é esperado.

```typescript
// Linha 105-116: bloco "if (result)" sem "else"
if (result) {
  return NextResponse.json({ ... });
}
// FALTA: return de erro caso result seja undefined
```

**Recomendação:** Adicionar um `else` com retorno de erro `500`.

---

### 🟠 [FIXED] [BUG-03] Webhook do Clerk Não Valida o Campo `id` Antes de Deletar Usuário (Alta)

**Arquivo:** `src/app/api/webhooks/clerk/route.ts`  
**Descrição:** No evento `user.deleted`, o campo `id` é utilizado com um cast forçado para `string` (`id as string`) sem verificação se o valor é realmente uma string válida.

```typescript
// Linha 90
await db.user.delete({ where: { clerkId: id as string } });
```

Se `id` for `undefined` (o que pode ocorrer em edge cases do Clerk), a query Prisma falhará com um erro não tratado especificamente, e o webhook retornará 500, causando retentativas em loop.  
**Recomendação:** Validar `if (!id || typeof id !== 'string')` e retornar 400 se inválido.

---

### 🟡 [FIXED] [BUG-04] `getUserPlan` em `lib/auth.ts` Não Considera Plano `"canceled"` (Média)

**Arquivo:** `src/lib/auth.ts`  
**Descrição:** A função `getUserPlan` verifica `status !== "active"` corretamente para retornar `"free"`, mas se o webhook do Stripe atualizar o status para `"past_due"` (pagamento atrasado), o usuário **ainda terá acesso** ao plano pago até que o `stripeCurrentPeriodEnd` expire.

```typescript
// Linha 32
if (!sub || sub.status !== "active") return "free";
```

O status `"past_due"` retorna o plano pago ao invés de "free".  
**Recomendação:** Tratar explicitamente os status: `const validStatuses = ['active', 'trialing']; if (!validStatuses.includes(sub.status)) return "free";`.

---

### 🟡 [BUG-05] Salvamento em localStorage Não Limpa Rascunhos Antigos (Média)

**Arquivo:** `MVP.md` menciona: _"Salvamento Automático: Persistência inteligente de rascunhos no localStorage"_  
**Descrição:** O localStorage tem limite de ~5-10 MB. Documentos muito longos ou muitos rascunhos acumulados podem causar um `QuotaExceededError`, resultando em falha silenciosa na persistência do documento.  
**Recomendação:** Implementar política de limpeza (ex: manter apenas os últimos N rascunhos) e tratar `try/catch` ao escrever no localStorage. Exibir alerta ao usuário em caso de falha.

---

## Escalabilidade

### 🟠 [ESC-01] Rate Limiting em Memória é Incompatível com Deploy Serverless

**Afeta:** `/api/pdf/export` (ipRateLimitMap) e potencialmente outros limitadores implementados da mesma forma.  
**Problema:** Em ambiente serverless (Vercel), cada invocação pode ser uma instância separada; o Map em memória não é compartilhado. O rate limit é completamente ineficaz nesse cenário.  
**Solução:** Upstash Redis com `@upstash/ratelimit`, ou tabela de controle no PostgreSQL.

---

### 🟠 [ESC-02] Banco de Dados Sem Pool de Conexões Configurado Explicitamente

**Arquivo:** `src/lib/db.ts`, `prisma/schema.prisma`  
**Descrição:** O `PrismaClient` é instanciado sem configuração explícita de pool de conexões. Em ambiente serverless com alta concorrência, isso pode esgotar o limite de conexões do PostgreSQL, resultando em erros `P2024` (connection pool timeout).

**Recomendação:** 
- Configurar `connection_limit` nas variáveis de ambiente (`DATABASE_URL?connection_limit=5`)
- Considerar o uso de um pooler de conexões externo como **PgBouncer** ou **Prisma Accelerate**.

---

### 🟡 [ESC-03] Ausência de Cache para Leituras Frequentes (Média)

**Descrição:** Dados como `editorSettings`, `subscription` e `user` são consultados no banco a cada requisição. Em alta escala, essas leituras frequentes gerarão pressão desnecessária no banco de dados.  
**Recomendação:** Implementar cache de curta duração (TTL: 60-300s) usando Redis para dados imutáveis por curtos períodos (ex: plano de assinatura, configurações do editor).

---

### 🟡 [ESC-04] Modelo `AiUsage` Pode Crescer Indefinidamente (Média)

**Arquivo:** `prisma/schema.prisma`  
**Descrição:** Cada uso de IA gera um registro em `ai_usage`. Sem política de archiving ou purge de dados históricos, a tabela crescerá indefinidamente. Com alto volume de usuários, isso impactará o desempenho das queries de rate limiting.

```sql
-- Query executada a cada chamada de IA:
SELECT COUNT(*) FROM ai_usage WHERE userId = ? AND createdAt >= ?
```

**Recomendação:** Implementar job periódico para arquivar ou deletar registros mais antigos que X meses. Manter apenas dados do período de faturamento atual.

---

## Avaliação de Prontidão para Produção (MVP)

### ✅ Pontos Positivos (Prontos para Produção)

|# | Recurso | Status |
|---|---|---|
| ✅ | **Autenticação** via Clerk com suporte a webhook | Pronto |
| ✅ | **Isolamento de dados** por usuário (tenant isolation) em todos os modelos | Pronto |
| ✅ | **Validação de input** com Zod em todas as rotas principais | Pronto |
| ✅ | **Assinatura Stripe** com webhook verificado via assinatura criptográfica | Pronto |
| ✅ | **Webhook Clerk** verificado via Svix com headers obrigatórios | Pronto |
| ✅ | **Cabeçalhos HTTP de segurança** configurados (HSTS, X-Frame-Options, CSP, nosniff) | Pronto |
| ✅ | **Source Maps** desabilitados em produção | Pronto |
| ✅ | **DOMPurify** aplicado no export de PDF (proteção contra XSS no HTML exportado) | Pronto |
| ✅ | **Paginação** implementada na listagem de documentos | Pronto |
| ✅ | **Sentry** integrado para monitoramento de erros | Pronto |
| ✅ | **i18n** funcional (PT, EN, ES) | Pronto |
| ✅ | **Rate Limiting de IA** por usuário e por plano implementado via banco de dados | Pronto |
| ✅ | **Índices de banco de dados** adequados para as queries principais | Pronto |

---

### ⚠️ Itens que Requerem Atenção Antes do Lançamento

| # | Item | Prioridade |
|---|---|---|
| � | Corrigir SEG-01: Rate limit no `/api/bug-reports` | **FIXED** |
| � | Corrigir SEG-03: Sanitização de `customInstructions` (prompt injection) | **FIXED** |
| � | Corrigir BUG-01: Falha silenciosa no middleware em erros de auth | **FIXED** |
| 🟠 | Corrigir SEG-04: Rate limiting in-memory → Redis | Alta |
| � | Corrigir BUG-04: Status `past_due` ainda concede acesso ao plano pago | **FIXED** |
| � | Corrigir BUG-02: Resposta de erro faltando no upload de imagem | **FIXED** |
| 🟡 | Corrigir SEG-07: Unicidade do `public_id` no Cloudinary | Média |
| 🟡 | Configurar pool de conexões do Prisma para produção (ESC-02) | Média |
| 🟢 | Corrigir SEG-02: Adicionar IP Rate Limit rigído para `/api/languagetool` (rota pública) | **FIXED** |
| 🟢 | Corrigir BUG-03: Validation `typeof id === string` em clerk webhook | **FIXED** |

---

## Recomendações Prioritárias

### Antes do lançamento (obrigatório):

1. **Adicionar rate limiting por IP** no endpoint `/api/bug-reports` utilizando Upstash Redis.
2. **Sanitizar `customInstructions`** antes de injetar no prompt da OpenAI. Bloquear padrões conhecidos de jailbreak e considerar um limite mais restritivo de caracteres (ex: máx. 200).
3. **Corrigir o middleware** para retornar 401 ou redirecionar para login quando ocorre um erro de autenticação em rotas protegidas, ao invés de prosseguir silenciosamente.
4. **Adicionar autenticação** no endpoint `/api/languagetool` (exigir sessão Clerk válida).

### Antes de escalar (alta prioridade):

5. **Migrar rate limiting para Redis** (Upstash) especialmente para os endpoints `/api/pdf/export` e IA.
6. **Configurar connection pooling** do PostgreSQL via variável de ambiente ou PgBouncer.
7. **Implementar política de limpeza** da tabela `ai_usage` para registros históricos.
8. **Incluir `userId` no `public_id`** do Cloudinary para evitar colisões.

---

*Relatório gerado em 2026-03-01 por análise estática do código-fonte. Não substitui testes de penetração (pentest) profissionais em ambiente de produção.*
