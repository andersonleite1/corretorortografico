# SPEC-001 — Integração do LanguageTool (Verificação Gramatical em Tempo Real)

---

## 1. Metadados

| Campo | Valor |
|---|---|
| **Título** | Integração do LanguageTool — Gramática e Ortografia em Tempo Real |
| **ID** | SPEC-001 |
| **Status** | `approved` |
| **Data de Criação** | 2026-04-24 |
| **Última Atualização** | 2026-04-24 |
| **Autor** | Anderson Leite / @andersonleite1 |
| **Revisor** | Engenharia retroativa via análise de código em produção |
| **Feature Relacionada** | Produção — sem issue vinculada (spec retroativa) |
| **ADRs Referenciados** | nenhum |

> **⚠️ GATE DE STATUS:** Um agente de IA ou desenvolvedor só pode iniciar a implementação desta spec quando `Status = approved`. Qualquer outro status bloqueia a escrita de código.

---

## 2. Contexto e Objetivo

### 2.1 Problema que esta feature resolve

Como usuário do editor que escreve em português, inglês ou espanhol, eu preciso de feedback imediato sobre erros de ortografia e gramática enquanto digito, para produzir textos de qualidade sem precisar sair do editor ou copiar o conteúdo para ferramentas externas.

A ausência de verificação gramatical in-editor forçava o usuário a depender de extensões de navegador (como Grammarly) ou ferramentas externas, criando fricção no fluxo de escrita.

### 2.2 O que esta feature entrega

- [x] Extension ProseMirror (`LanguageTool`) que analisa o documento após um debounce de 1 segundo e que respeita mínimo de 15 caracteres
- [x] Sublinhamento visual dos erros no editor via `Decoration.inline` com classes CSS `lt-error lt-type-{issueType}`
- [x] Bubble menu (`LanguageToolMenu`) que aparece ao hover/clique em erros, exibindo descrição da regra, mensagem de erro e até 6 sugestões de correção clicáveis
- [x] Sidebar panel (`LanguageToolSidebar`) com visão panorâmica de todos os erros, categorias (ortografia, gramática, estilo), estatísticas de palavras/caracteres/tempo de leitura e botão "Corrigir Tudo"
- [x] Botão de toggle na MenuBar (`LanguageToolToggleButton`) para habilitar/desabilitar a verificação
- [x] Botão de sidebar separado (`LanguageToolSidebarButton`) para abrir/fechar a sidebar
- [x] Atalho de teclado `F7` para toggle do LanguageTool e `Shift+F7` para toggle da sidebar
- [x] Status da verificação exibido na `StatusBar` do editor (idle, checking, ready, error, rate_limited)
- [x] Ação "Ignorar" por issue individual, que remove a decoração do editor
- [x] Route Handler público em `/api/languagetool` que faz proxy para o servidor self-hosted em `languagetool.editordetexto.cloud`
- [x] Rate limit de 60 requisições por minuto por IP via Redis ZSET (sliding window)
- [x] Proteção de Origin Check no endpoint (apenas origens do próprio domínio)
- [x] Timeout de 8 segundos na chamada ao servidor LanguageTool externo, com resposta 504

### 2.3 O que está FORA do escopo

- Autenticação por usuário (o endpoint é publicamente acessível, protegido apenas por IP e origin)
- Rastreamento de uso por plan (free/pro) — o rate limit é por IP, não por userId
- Integração com o banco de dados (não persiste issues; o estado é puramente in-memory no ProseMirror)
- Suporte a idiomas além de `pt-BR`, `en-US` e `es`
- Verificação de textos maiores que 20.000 caracteres (o backend trunca silenciosamente)
- Sanitização de input via `ai-sanitize.ts` (texto não vai para um LLM, vai para o LanguageTool)
- Migração de schema Prisma (nenhuma tabela criada)
- Streaming (resposta é JSON síncrona)

### 2.4 Dependências

| Dependência | Tipo | Status |
|---|---|---|
| Servidor LanguageTool self-hosted em `languagetool.editordetexto.cloud` | `blocker` | `done` |
| Upstash Redis via `src/lib/redis.ts` (singleton ioredis) | `blocker` | `done` |
| Extension `CharacterCount` do Tiptap (usada na sidebar para stats) | `soft` | `done` |
| `TiptapContext` em `Provider.tsx` (fornece `editor`, `setIsLTSidebarOpen`, `messages`) | `blocker` | `done` |

---

## 3. Requisitos de Engenharia

### 3.1 Integração com a Stack

#### Next.js 14 (App Router)
- **Rotas afetadas:** `src/app/api/languagetool/route.ts`
- **Runtime:** `Node.js` (a diretiva `export const dynamic = "force-dynamic"` é usada; não é Edge)
- **Tipo de componente:** Route Handler
- **Considerações de cache/streaming:** `cache: "no-store"` na requisição upstream ao servidor LanguageTool para evitar respostas obsoletas

#### Tiptap / ProseMirror
- **Extensions envolvidas:** `LanguageTool` (custom, em `src/components/TiptapEditor/extensions/LanguageTool.ts`)
- **Mudanças no `kit.ts`:** Sim — `LanguageTool.configure({ checkDelay: 1000, minChars: 15, enabled: true, language: resolveLanguageToolCode(locale) })` é adicionado ao array de extensions
- **Impacto em `Provider.tsx` / contexto compartilhado:**
  - `Provider.tsx` importa e renderiza `<LanguageToolSidebar />` condicionalmente com estado `isLTSidebarOpen`
  - Atalhos `F7` e `Shift+F7` são registrados diretamente no `Provider.tsx` via listeners de teclado
  - `TiptapContext` expõe `setIsLTSidebarOpen` (boolean setter)
  - `editor.storage.languageTool` é o contrato de leitura de estado reativo usado pelos componentes UI (`status`, `issues`, `message`, `lastUpdated`, `enabled`)

#### Prisma (Database)
- **Modelos afetados:** nenhum
- **Migrations necessárias:** Não
- **Queries críticas:** nenhuma

#### Clerk (Auth)
- **Rotas protegidas adicionadas:** Nenhuma — `/api/languagetool` está explicitamente **excluído** do `isProtectedRoute` matcher. O endpoint é público por decisão de negócio documentada em comentário no código.
- **Claims/metadata do JWT utilizados:** nenhum
- **Lógica de autorização por plano:** nenhuma

#### Upstash Redis
- **Chaves Redis utilizadas:** `ratelimit:languagetool:{ip}` — ZSET com timestamps dos requests
- **Rate limit:** Sim — 60 requisições por janela de 1 minuto (sliding window via `SlidingWindowRatelimit`)
- **IP extraído de:** `x-forwarded-for` (primeiro da lista) → fallback `x-real-ip` → fallback `"unknown"`
- **TTL:** `expire(key, windowSeconds)` — 60 segundos de expiração automática

#### Vercel AI SDK
- Não aplicável — a feature não usa LLMs.

### 3.2 Arquivos que serão criados ou modificados

| Ação | Arquivo | Descrição da mudança |
|---|---|---|
| `CREATE` | `src/app/api/languagetool/route.ts` | Route Handler público com origin check, rate limit por IP e proxy para servidor LT self-hosted |
| `CREATE` | `src/components/TiptapEditor/extensions/LanguageTool.ts` | Extension ProseMirror com Plugin de state, decorations e lógica de debounce/fetch |
| `MODIFY` | `src/components/TiptapEditor/kit.ts` | Adiciona `LanguageTool.configure(...)` ao array de extensions com locale dinâmico |
| `CREATE` | `src/components/TiptapEditor/components/menus/LanguageToolMenu.tsx` | Bubble menu com sugestões clicáveis, exibido no hover/clique sobre erros |
| `CREATE` | `src/components/TiptapEditor/components/LanguageToolSidebar.tsx` | Sidebar panel com tabs "resumo" e "detalhes", stats e botão "Corrigir Tudo" |
| `CREATE` | `src/components/TiptapEditor/components/controls/LanguageToolToggleButton.tsx` | Botão de toggle on/off na MenuBar |
| `CREATE` | `src/components/TiptapEditor/components/controls/LanguageToolSidebarButton.tsx` | Botão para abrir/fechar a sidebar |
| `MODIFY` | `src/components/TiptapEditor/components/StatusBar.tsx` | Exibe status do LanguageTool (idle/checking/ready/error/rate_limited) |
| `MODIFY` | `src/components/TiptapEditor/components/MenuBar.tsx` | Adiciona `LanguageToolToggleButton` e `LanguageToolSidebarButton` à toolbar |
| `MODIFY` | `src/components/TiptapEditor/components/Provider.tsx` | Renderiza `<LanguageToolSidebar>`, registra atalhos `F7`/`Shift+F7`, expõe `setIsLTSidebarOpen` no contexto |
| `MODIFY` | `src/components/TiptapEditor/components/Editor.tsx` | Importa `LanguageToolMenu` via `dynamic()` e o renderiza |
| `CREATE` | `src/types/languageTool.ts` | Tipos TypeScript para `LanguageToolMatch`, `LanguageToolResponse`, `LanguageToolIssue`, `LanguageToolRule`, `LanguageToolReplacement` |
| `MODIFY` | `src/lib/ratelimit.ts` | Adiciona `languageTool: new SlidingWindowRatelimit(60, "1 m", "ratelimit:languagetool")` ao objeto `ratelimit` |
| `MODIFY` | `src/components/TiptapEditor/extensions/index.ts` | Exporta `LanguageTool` para ser consumido pelo `kit.ts` |
| `MODIFY` | `src/components/TiptapEditor/components/menus/index.ts` | Exporta `LanguageToolMenu` |

### 3.3 Impacto em features existentes

- **StatusBar:** A StatusBar lê `editor.storage.languageTool` reativamente. Se a extension não estiver registrada, o storage será `undefined` e os valores fallback (`enabled: false`, `status: "idle"`) são usados — sem quebra.
- **MenuBar:** Dois botões adicionados ao final da toolbar; sem impacto em controles existentes.
- **Provider.tsx:** Dois atalhos de teclado globais adicionados (`F7`, `Shift+F7`). Podem conflitar com atalhos de sistema em alguns SOs (improvável em uso web).
- **Rate Limit global:** A entrada `languageTool` no objeto `ratelimit` é independente das demais (`ai`, `pdfExport`, `bugReports`). Sem impacto cruzado.

---

## 4. Contratos e Tipagens

### 4.1 Schema Zod (Request/Response)

> **Nota:** O Route Handler atual não usa Zod explicitamente — a validação é feita com checagens TypeScript inline. O contrato abaixo descreve o comportamento real do código.

```typescript
// src/app/api/languagetool/route.ts — validação inline (sem Zod)
// Request body esperado:
// {
//   text: string,      // obrigatório, não pode ser vazio após trim()
//   language?: string  // opcional, default "pt-BR"; deve ser um de: "pt-BR" | "en-US" | "es"
// }

// Equivalente Zod (representação fiel do comportamento):
import { z } from "zod";

export const LanguageToolRequestSchema = z.object({
  text: z.string().min(1),
  language: z.enum(["pt-BR", "en-US", "es"]).default("pt-BR"),
});

export type LanguageToolRequest = z.infer<typeof LanguageToolRequestSchema>;
```

```typescript
// Schema de response (sucesso — HTTP 200)
export const LanguageToolResponseSchema = z.object({
  matches: z.array(z.any()), // Array de LanguageToolMatch — ver tipos abaixo
  language: z.string(),      // Código de idioma retornado pelo servidor LT
});

export type LanguageToolApiResponse = z.infer<typeof LanguageToolResponseSchema>;
```

### 4.2 Interfaces TypeScript

```typescript
// src/types/languageTool.ts — tipos em produção

export type LanguageToolReplacement = {
  value: string;
};

export type LanguageToolRule = {
  id: string;
  description: string;
  issueType?: string;
  category?: {
    id: string;
    name: string;
  };
};

export type LanguageToolMatch = {
  message: string;
  shortMessage?: string;
  replacements: LanguageToolReplacement[];
  offset: number;   // Offset em chars no texto plano enviado
  length: number;   // Comprimento do erro em chars
  sentence?: string;
  context?: {
    text: string;
    offset: number;
    length: number;
  };
  rule?: LanguageToolRule;
  type?: {
    typeName: string;
  };
};

export type LanguageToolResponse = {
  matches: LanguageToolMatch[];
  language?: {
    name: string;
    code: string;
  };
};

// Tipo interno (ProseMirror) — posições absolutas no doc
export type LanguageToolIssue = {
  id: string;         // "{rule.id}-{index}"
  from: number;       // Posição ProseMirror absoluta (início)
  to: number;         // Posição ProseMirror absoluta (fim)
  message: string;
  replacements: string[];       // Apenas os values extraídos de LanguageToolReplacement[]
  ruleId?: string;
  ruleDescription?: string;
  typeName?: string;
  sentence?: string;
  issueType?: string; // Ex: "misspelling", "grammar", "typographical", "style"
};
```

```typescript
// src/components/TiptapEditor/extensions/LanguageTool.ts — tipos internos da extension

type LanguageToolStatus = "idle" | "checking" | "ready" | "error" | "rate_limited";

type LanguageToolOptions = {
  enabled: boolean;   // default: true
  language: string;   // default: "pt-BR"
  endpoint: string;   // default: "/api/languagetool"
  checkDelay: number; // default: 3000ms (kit.ts sobrescreve para 1000ms)
  minChars: number;   // default: 100 (kit.ts sobrescreve para 15)
};

// EditorStorage exposto — acessado via editor.storage.languageTool
// (declarado via module augmentation de @tiptap/core)
interface LanguageToolStorage {
  status: LanguageToolStatus;
  issues: LanguageToolIssue[];
  message: string | null;
  lastUpdated: number | null;  // timestamp Date.now()
  enabled: boolean;
}
```

### 4.3 Contrato da API (HTTP)

| | Detalhes |
|---|---|
| **Método** | `POST` |
| **Rota** | `/api/languagetool` |
| **Auth** | **Não requerida.** Origin Check por `origin` / `referer` header. |
| **Rate Limit** | 60 req / 1 min por IP via Redis ZSET sliding window. Chave: `ratelimit:languagetool:{ip}` |
| **Request Body** | `Content-Type: application/json` → `{ text: string, language?: "pt-BR" \| "en-US" \| "es" }` |
| **Tamanho máximo de texto** | 20.000 caracteres (truncado silenciosamente se exceder) |
| **Timeout upstream** | 8 segundos (AbortController) |
| **Response 200** | `{ matches: LanguageToolMatch[], language: string }` |
| **Response 400** | `{ error: "Texto inválido para análise." }` (texto vazio após trim) |
| **Response 403** | `{ error: "Unauthorized access" }` (origin não reconhecida) |
| **Response 429** | `{ error: "Muitas requisições. Tente novamente mais tarde." }` + header `Retry-After: {seconds}` |
| **Response 500** | `{ error: "Erro inesperado ao consultar LanguageTool." }` |
| **Response 504** | `{ error: "O servidor de verificação demorou muito para responder. Tente novamente." }` (timeout 8s) |
| **Upstream** | `POST https://languagetool.editordetexto.cloud/v2/check` com `Content-Type: application/x-www-form-urlencoded` |

**Origins permitidas:**
- Qualquer URL que começa com `NEXT_PUBLIC_APP_URL`
- `localhost`, `127.0.0.1`, `192.168.*` (desenvolvimento local)
- `*.vercel.app` (preview deployments)
- `editordetexto.online` ou `editordetexto.cloud` (produção)

### 4.4 Prisma Schema Delta

```diff
// Nenhuma alteração em prisma/schema.prisma
// Esta feature não persiste dados no banco de dados.
```

---

## 5. Critérios de Aceite para a IA

### 5.1 Correção Funcional

- [x] A feature implementa exatamente o que está descrito na Seção 2.2 — todos os componentes UI, atalhos, rate limit e proxy estão em produção
- [x] Todos os edge cases da Seção 2.3 foram respeitados — sem auth por usuário, sem persistência Prisma, sem suporte a idiomas além dos 3 listados
- [x] O fluxo feliz funciona de ponta a ponta: usuário digita → debounce 1s → request `/api/languagetool` → decorations aparecem → hover mostra bubble menu com sugestões
- [x] Cenários de erro tratados: timeout → 504; upstream offline → 500; rate limit → status `rate_limited` no plugin state; origin inválida → 403; texto vazio → status `idle` (sem request)

### 5.2 Contratos e Tipagem

- [x] As interfaces TypeScript da Seção 4.2 foram criadas em `src/types/languageTool.ts`
- [x] Nenhum `any` introduzido sem justificativa — usos de `any` existentes são para acessar `editor.storage.languageTool` (não tipado via augmentation no contexto do componente) e para specs de decorations do ProseMirror (API externa)
- [x] O contrato HTTP da Seção 4.3 foi respeitado (método POST, status codes 200/400/403/429/500/504)
- [x] Schema de request validado inline no route handler (comportamento equivalente ao Zod descrito na Seção 4.1)

### 5.3 Integração com a Stack

- [x] `/api/languagetool` **não** está no `config.matcher` de rotas protegidas do `src/middleware.ts` — correto por design (endpoint público)
- [x] `getUserPlan()` não é chamado — correto, pois a feature não possui gating por plano
- [x] Nenhuma query Prisma realizada — sem risco de vazamento cross-tenant
- [x] Redis utilizado para rate limit conforme Seção 3.1 — chave `ratelimit:languagetool:{ip}`, sliding window 60 req/1 min
- [x] Fallback de Redis: se Redis falhar, a `ratelimit.languageTool.limit()` lançará erro que é capturado pelo `try/catch` do route handler — retorna 500

### 5.4 Qualidade e Segurança

- [x] Input de usuário NÃO é enviado a LLMs — portanto `ai-sanitize.ts` não se aplica; o input é enviado ao servidor LanguageTool via `x-www-form-urlencoded`
- [x] Nenhum segredo aparece no código — `NEXT_PUBLIC_APP_URL` é a única env var usada e é pública por convenção
- [x] A rota `/api/languagetool` é intencionalmente pública, protegida por origin check + rate limit por IP (documentado em comentário no código — SEG-02)
- [x] `console.warn` usado para log de origem negada (não `console.log`); `console.error` usado para erros reais no catch

### 5.5 Arquivos e Escopo

- [x] Apenas os arquivos listados na Seção 3.2 foram criados ou modificados
- [x] Nenhum arquivo fora do escopo foi alterado sem justificativa
- [x] `prisma/schema.prisma` não foi alterado — correto, feature sem persistência
- [x] Tipos adicionados em `src/types/languageTool.ts` (arquivo exclusivo para o domínio)

### 5.6 Testes

- [x] A extension ProseMirror foi testada manualmente no browser em cenários de digitação real (evidência: feature em produção)
- [x] O comportamento de rate limit foi testado via validação de produção
- [x] Testes unitários automatizados para `route.ts` e `LanguageTool.ts`: **não criados** — lacuna identificada. Uma suite Vitest deve ser adicionada futuramente.

---

## 6. Notas de Implementação e Decisões Técnicas

### 2026-04-24 — Endpoint público sem autenticação Clerk

**Problema:** O fluxo padrão do projeto exige `auth()` + `userId` em todos os Route Handlers.

**Decisão:** O endpoint `/api/languagetool` foi intencionalmente deixado público. A proteção é feita via Origin Check (header `origin`/`referer`) + rate limit por IP (Redis ZSET). O comentário no código referencia a regra de segurança `SEG-02`.

**Trade-off:** Usuários anônimos (não logados) se beneficiam da verificação gramatical, o que é desejável para aumentar o valor percebido do editor antes do cadastro. O risco de abuso é mitigado pelo rate limit de 60 req/min por IP.

---

### 2026-04-24 — Texto plano com separador `\n` entre blocos ProseMirror

**Problema:** O LanguageTool analisa texto plano, mas o documento ProseMirror é uma árvore de nós. É necessário mapear offsets de texto plano de volta para posições absolutas no documento.

**Decisão:** A função `buildDocumentText()` percorre todos os `textblock` nodes via `state.doc.descendants()`, concatena o texto com `\n` entre blocos, e constrói um mapa `DocumentTextMap` com arrays `BlockSegment[]` e `TextSegment[]` para a conversão reversa via `findDocPosition()`.

**Trade-off:** Textos com formatação complexa (listas aninhadas, tabelas) podem ter offsets levemente desalinhados em edge cases. Aceito como limitação conhecida.

---

### 2026-04-24 — `checkDelay` de 1000ms e `minChars` de 15 (vs. defaults da extension)

**Problema:** Os defaults da extension são `checkDelay: 3000ms` e `minChars: 100`, que criam latência muito alta para o usuário perceber o feedback.

**Decisão:** O `kit.ts` sobrescreve os valores com `checkDelay: 1000` e `minChars: 15`. Isso resulta em mais requests, mas dentro do budget do rate limit de 60/min.

**Trade-off:** Usuários digitando muito rapidamente (> 1 req/s por 1 minuto) poderiam atingir o rate limit. Aceito dado o perfil de uso esperado.

---

### 2026-04-24 — Truncamento silencioso em 20.000 caracteres

**Problema:** O servidor LanguageTool self-hosted pode ter limites de tamanho de payload.

**Decisão:** O Route Handler trunca silenciosamente com `text.slice(0, MAX_TEXT_LENGTH)` sem avisar o cliente.

**Trade-off:** Usuários com documentos longos têm apenas os primeiros 20.000 caracteres verificados sem aviso. Lacuna de UX conhecida.

---

## 7. Histórico de Revisões

| Versão | Data | Autor | Mudança |
|---|---|---|---|
| 1.0 | 2026-04-24 | Anderson Leite / Antigravity (eng. reversa) | Criação retroativa a partir do código em produção |

---

*Spec retroativa gerada via análise de código — editordetexto.online SDD Infrastructure*
*Arquivos analisados: `src/app/api/languagetool/route.ts`, `src/components/TiptapEditor/extensions/LanguageTool.ts`, `src/types/languageTool.ts`, `src/lib/ratelimit.ts`, `src/components/TiptapEditor/kit.ts`, `src/components/TiptapEditor/components/menus/LanguageToolMenu.tsx`, `src/components/TiptapEditor/components/LanguageToolSidebar.tsx`*
