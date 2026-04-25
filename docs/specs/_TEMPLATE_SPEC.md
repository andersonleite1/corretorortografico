# SPEC-{NNN} — {Título da Feature}

<!-- ================================================================
  TEMPLATE OFICIAL — editordetexto.online
  Versão: 1.0.0
  
  INSTRUÇÕES:
  1. Copie este arquivo para docs/specs/{domínio}/SPEC-{NNN}-{slug}.md
  2. Preencha TODOS os campos. Campos vazios === spec inválida.
  3. Mude o status para "approved" SOMENTE após revisão de um peer.
  4. Nenhum código pode ser escrito enquanto status != "approved".
================================================================ -->

---

## 1. Metadados

| Campo | Valor |
|---|---|
| **Título** | {Título descritivo da feature} |
| **ID** | SPEC-{NNN} |
| **Status** | `draft` \| `in-review` \| `approved` \| `deprecated` |
| **Data de Criação** | YYYY-MM-DD |
| **Última Atualização** | YYYY-MM-DD |
| **Autor** | {Nome} / {Handle} |
| **Revisor** | {Nome do revisor que aprovou} |
| **Feature Relacionada** | {Link para issue/ticket, ex: GitHub #123} |
| **ADRs Referenciados** | {ex: ADR-002, ADR-004 — ou "nenhum"} |

> **⚠️ GATE DE STATUS:** Um agente de IA ou desenvolvedor só pode iniciar a implementação desta spec quando `Status = approved`. Qualquer outro status bloqueia a escrita de código.

---

## 2. Contexto e Objetivo

### 2.1 Problema que esta feature resolve

<!--
  Descreva o problema do ponto de vista do usuário final.
  Use o formato "Como [persona], eu preciso de [capacidade] para [benefício]".
  
  Exemplo:
  Como usuário do plano Free que escreve offline, eu preciso que meus documentos
  sejam automaticamente promovidos para o banco de dados quando eu fizer login,
  para não perder trabalho feito sem conexão.
-->

{Descreva o problema aqui}

### 2.2 O que esta feature entrega

<!--
  Liste os entregáveis concretos e observáveis desta feature.
  Seja específico: "Um botão X que faz Y" é melhor que "melhora a UX".
-->

- [ ] {Entregável 1}
- [ ] {Entregável 2}
- [ ] {Entregável 3}

### 2.3 O que está FORA do escopo

<!--
  Liste explicitamente o que NÃO será implementado nesta spec.
  Isso evita scope creep durante a implementação.
-->

- {Item fora do escopo 1}
- {Item fora do escopo 2}

### 2.4 Dependências

<!--
  Liste specs que DEVEM estar implementadas antes desta.
  Ex: "SPEC-020 (local-cloud-sync) deve estar em produção".
-->

| Dependência | Tipo | Status |
|---|---|---|
| {SPEC-NNN ou sistema externo} | `blocker` \| `soft` | `done` \| `pending` |

---

## 3. Requisitos de Engenharia

### 3.1 Integração com a Stack

<!--
  Descreva como esta feature se encaixa em cada camada da stack.
  Preencha apenas as camadas relevantes; remova as que não se aplicam.
-->

#### Next.js 14 (App Router)
- **Rotas afetadas:** {ex: `src/app/api/documents/route.ts`, `src/app/[locale]/dashboard/page.tsx`}
- **Runtime:** {`Node.js` | `Edge` | `Client`}
- **Tipo de componente:** {Server Component | Client Component | Route Handler | Middleware}
- **Considerações de cache/streaming:** {ex: "Usa `React.cache` para deduplicar a query de usuário"}

#### Tiptap / ProseMirror
- **Extensions envolvidas:** {ex: `LanguageTool`, `SearchAndReplace`, ou "nenhuma"}
- **Mudanças no `kit.ts`:** {Sim/Não. Se sim, descreva}
- **Impacto em `Provider.tsx` / contexto compartilhado:** {ex: "Adiciona `isFeatureX: boolean` ao TiptapContext"}

#### Prisma (Database)
- **Modelos afetados:** {ex: `Document`, `AiUsage`, ou "nenhum"}
- **Migrations necessárias:** {Sim/Não. Se sim, descreva o DDL esperado}
- **Queries críticas (com índice esperado):** {ex: `findMany({ where: { userId, createdAt: { gte: startOfDay } } })`}

#### Clerk (Auth)
- **Rotas protegidas adicionadas:** {ex: `/api/nova-feature` → adicionar ao matcher do middleware}
- **Claims/metadata do JWT utilizados:** {ex: `userId`, `orgId`, ou "nenhum"}
- **Lógica de autorização por plano:** {ex: "Apenas plano `pro` pode acessar. Verificar via `getUserPlan()`"}

#### Upstash Redis
- **Chaves Redis utilizadas:** {ex: `feature_x:{userId}`, TTL, estratégia de invalidação}
- **Rate limit necessário:** {Sim/Não. Se sim, qual janela e limite?}

#### Vercel AI SDK (se aplicável)
- **Modelo LLM:** {ex: `gpt-4o-mini`}
- **Protocolo de streaming:** {`text` | `data`}
- **System prompt:** {Referência ao arquivo em `src/data/` ou inline aqui}

### 3.2 Arquivos que serão criados ou modificados

<!--
  Lista exaustiva. Nenhum arquivo fora desta lista deve ser tocado
  sem atualizar a spec primeiro.
-->

| Ação | Arquivo | Descrição da mudança |
|---|---|---|
| `CREATE` | `src/app/api/{rota}/route.ts` | {Descrição} |
| `MODIFY` | `src/components/TiptapEditor/kit.ts` | {Descrição} |
| `CREATE` | `src/lib/{util}.ts` | {Descrição} |
| `MODIFY` | `prisma/schema.prisma` | {Adiciona campo X ao model Y} |
| `CREATE` | `prisma/migrations/{timestamp}_descricao/migration.sql` | {DDL} |

### 3.3 Impacto em features existentes

<!--
  Descreva qualquer efeito colateral esperado em outras features.
  Se não houver impacto, escreva "Nenhum impacto identificado."
-->

{Descreva impactos aqui}

---

## 4. Contratos e Tipagens

### 4.1 Schema Zod (Request/Response)

<!--
  Defina os schemas Zod para validação de entrada e saída.
  Estes schemas DEVEM ser implementados exatamente como especificados.
  Qualquer desvio deve ser documentado e justificado.
-->

```typescript
// src/app/api/{rota}/route.ts — schema de request
import { z } from "zod";

export const {FeatureName}RequestSchema = z.object({
  // {campo}: z.{tipo}().{validações},
  // Exemplo:
  documentId: z.string().cuid(),
  content: z.string().min(1).max(500_000),
  locale: z.enum(["pt", "en", "es"]).default("pt"),
});

export type {FeatureName}Request = z.infer<typeof {FeatureName}RequestSchema>;
```

```typescript
// Schema de response (sucesso)
export const {FeatureName}ResponseSchema = z.object({
  // {campo}: z.{tipo}(),
});

export type {FeatureName}Response = z.infer<typeof {FeatureName}ResponseSchema>;
```

### 4.2 Interfaces TypeScript

<!--
  Defina as interfaces/types que serão adicionados ou modificados
  em src/types/ ou inline nos módulos relevantes.
-->

```typescript
// src/types/{domain}.d.ts

export interface {EntityName} {
  id: string;       // CUID do Prisma
  userId: string;   // FK para User.id
  // {campo}: {tipo}; // {descrição}
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.3 Contrato da API (HTTP)

| | Detalhes |
|---|---|
| **Método** | `GET` \| `POST` \| `PATCH` \| `DELETE` |
| **Rota** | `/api/{caminho}` |
| **Auth** | Clerk JWT obrigatório (`auth()` no Route Handler) |
| **Rate Limit** | {ex: 10 req / 1 min via Redis ZSET, ou "não aplicável"} |
| **Request Body** | Ver `{FeatureName}RequestSchema` acima |
| **Response 200** | Ver `{FeatureName}ResponseSchema` acima |
| **Response 400** | `{ error: "validation_error", details: ZodError.issues }` |
| **Response 401** | `{ error: "unauthorized" }` |
| **Response 429** | `{ error: "rate_limit_exceeded", retryAfter: number }` |
| **Response 500** | `{ error: "internal_server_error" }` (Sentry captura automaticamente) |

### 4.4 Prisma Schema Delta

<!--
  Se houver mudança no schema.prisma, cole aqui o delta exato
  que será adicionado. Use sintaxe diff para clareza.
-->

```diff
// prisma/schema.prisma

+ model {NewModel} {
+   id        String   @id @default(cuid())
+   userId    String
+   user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
+   // {campo}  {tipo}   {modificadores}
+   createdAt DateTime @default(now())
+   updatedAt DateTime @updatedAt
+
+   @@index([userId])
+   @@map("{new_model_snake_case}")
+ }
```

---

## 5. Critérios de Aceite para a IA

<!--
  Este checklist é OBRIGATÓRIO. O agente de IA deve verificar cada item
  antes de declarar a tarefa como concluída. Itens não verificados === tarefa incompleta.
  
  INSTRUÇÃO PARA O AGENTE: Ao finalizar a implementação, responda com este
  checklist completamente preenchido (substituindo [ ] por [x] onde aplicável)
  e justifique brevemente cada item marcado como [x].
-->

### 5.1 Correção Funcional

- [ ] A feature implementa exatamente o que está descrito na Seção 2.2 (e nada além)
- [ ] Todos os edge cases da Seção 2.3 (fora do escopo) foram respeitados
- [ ] O fluxo feliz (happy path) funciona de ponta a ponta sem erros no console
- [ ] Cenários de erro (ex: rede offline, rate limit, auth expirado) são tratados gracefully

### 5.2 Contratos e Tipagem

- [ ] O schema Zod da Seção 4.1 foi implementado identicamente (sem campos removidos ou tipos alterados)
- [ ] As interfaces TypeScript da Seção 4.2 foram criadas nos arquivos especificados
- [ ] Nenhum `any` foi introduzido sem comentário `// TODO: tipar após` com issue linkada
- [ ] O contrato HTTP da Seção 4.3 foi respeitado (métodos, rotas, status codes)

### 5.3 Integração com a Stack

- [ ] Route Handlers adicionados ao `config.matcher` do `src/middleware.ts` se forem protegidos
- [ ] `getUserPlan()` é chamado antes de qualquer lógica que depende do plano do usuário
- [ ] Queries Prisma sempre incluem filtro `userId` (sem vazamento cross-tenant)
- [ ] Redis utilizado para cache/rate-limit conforme especificado na Seção 3.1
- [ ] Erros de DB/Redis têm fallback documentado (ex: Redis MISS → query no DB)

### 5.4 Qualidade e Segurança

- [ ] Input de usuário sanitizado via `ai-sanitize.ts` antes de enviar a LLMs
- [ ] Nenhum segredo (API key, Clerk secret, DB URL) aparece no código — apenas via `process.env`
- [ ] Nenhuma rota de API foi deixada sem autenticação Clerk (a menos que explicitamente especificado)
- [ ] `console.log` de debug foram removidos (apenas `console.error` para erros reais)

### 5.5 Arquivos e Escopo

- [ ] Apenas os arquivos listados na Seção 3.2 foram criados ou modificados
- [ ] Nenhum arquivo fora do escopo desta spec foi alterado sem justificativa documentada
- [ ] `prisma/schema.prisma` alterado conforme Seção 4.4 e migration gerada via `prisma migrate dev`
- [ ] Tipos novos adicionados ao arquivo correto em `src/types/`

### 5.6 Testes

- [ ] Teste unitário criado para a função de lógica core em `src/lib/*.test.ts`
- [ ] Cenários de erro testados (ex: schema Zod inválido, usuário sem plano, DB offline)
- [ ] Se houver mudança no `TiptapEditor/`, o comportamento foi testado manualmente no browser

---

## 6. Notas de Implementação e Decisões Técnicas

<!--
  Use esta seção para documentar decisões técnicas tomadas DURANTE a implementação
  que divergem da especificação original, e a justificativa.
  
  Formato:
  ### Data — Título da decisão
  **Problema:** {O que mudou e por quê}
  **Decisão:** {O que foi feito em vez disso}
  **Trade-off:** {O que foi sacrificado}
-->

{Preencher durante a implementação}

---

## 7. Histórico de Revisões

| Versão | Data | Autor | Mudança |
|---|---|---|---|
| 1.0 | YYYY-MM-DD | {Autor} | Criação inicial |

---

*Template versão 1.0.0 — editordetexto.online SDD Infrastructure*
