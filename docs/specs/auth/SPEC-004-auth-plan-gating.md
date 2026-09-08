# SPEC-004 — Autenticação e Gating de Planos (Clerk & Stripe)

<!-- ================================================================
  TEMPLATE OFICIAL — editordetexto.online
  Versão: 1.0.0
================================================================ -->

---

## 1. Metadados

| Campo | Valor |
|---|---|
| **Título** | Autenticação e Gating de Planos (Clerk & Stripe) |
| **ID** | SPEC-004 |
| **Status** | `approved` |
| **Data de Criação** | 2026-04-24 |
| **Última Atualização** | 2026-04-24 |
| **Autor** | Antigravity AI |
| **Revisor** | Anderson Leite |
| **Feature Relacionada** | Auth & Monetização |
| **ADRs Referenciados** | nenhum |

---

## 2. Contexto e Objetivo

### 2.1 Problema que esta feature resolve

Precisamos garantir que usuários acessem apenas recursos permitidos pelo seu plano de assinatura. Falhas nesta lógica podem levar a abuso de recursos de IA (custos elevados) ou vazamento de dados privados entre usuários.

### 2.2 O que esta feature entrega

- [ ] Autenticação robusta via Clerk (SSO, Magic Links, Social).
- [ ] Sincronização automática entre os dados do Clerk e o banco de dados Neon (PostgreSQL).
- [ ] Gating de recursos (ex: limites de reescrita por IA) baseado no plano do usuário.
- [x] Verificação de plano usando `React.cache`; a fonte de verdade é o PostgreSQL.

### 2.3 O que está FORA do escopo

- Lógica de Checkout do Stripe (processamento de cartão de crédito - delegado ao Stripe Billing).
- Gestão manual de senhas (delegado ao Clerk).

### 2.4 Dependências

| Dependência | Tipo | Status |
|---|---|---|
| Prisma ORM | `blocker` | `done` |
| Clerk Next.js SDK | `blocker` | `done` |
| PostgreSQL | `blocker` | `done` |

---

## 3. Requisitos de Engenharia

### 3.1 Fluxo de Autenticação

1.  **Middleware**: O `src/middleware.ts` intercepta rotas protegidas (definidas em `isProtectedRoute`).
2.  **Redirect**: Usuários não autenticados são enviados para `/sign-in`.
3.  **Sync**: No primeiro login ou acesso ao editor, a função `syncUserWithDb()` é invocada para garantir que o `clerkId` e `email` do usuário existam na tabela `User` do Prisma.

### 3.2 Lógica de Planos (`getUserPlan()`)

 A verificação de plano consulta o PostgreSQL através do Prisma, com `React.cache` evitando chamadas duplicadas na mesma renderização.
3.  **Validadores**: Considera `active` ou `trialing` como planos válidos. Planos expirados ou cancelados revertem para `free`.

### 3.3 Filtro Anti-Leakage (Multi-tenant)

**REGRA ABSOLUTA**: Toda query Prisma que retorne documentos, configurações de usuário ou tons de IA **DEVE** incluir o filtro `userId` obtido via `auth()`.
```typescript
// Exemplo Correto
const docs = await db.document.findMany({
  where: { userId } // userId extraído do Clerk
});
```

---

## 4. Contratos e Tipagens

### 4.1 Enums de Planos
```typescript
type Plan = "free" | "pro" | "team";
type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "unpaid";
```

### 4.2 Helper Core (`src/lib/auth.ts`)
```typescript
/**
 * Retorna o plano atual do usuário de forma performática.
 * @param forceRefresh - Mantido por compatibilidade para forçar uma nova chamada lógica.
 */
export async function getUserPlan(forceRefresh?: boolean): Promise<Plan>;
```

---

## 5. Critérios de Aceite para a IA

### 5.1 Proteção de Rotas
- [ ] Rotas de API que manipulam dados sensíveis devem começar com: `const { userId } = await auth(); if (!userId) return 401;`.
- [ ] O gating de features (ex: reescrita ilimitada) deve usar o retorno de `getUserPlan()`.

### 5.2 Integridade de Dados
- [ ] NUNCA utilizar `findFirst` ou `findUnique` em tabelas de dados de usuário sem a cláusula `where: { userId }`.
- [ ] O webhook do Stripe (se implementado ou futuro) deve ser a fonte da verdade para atualizar a tabela `Subscription`.

### 5.3 Performance
- [ ] A verificação de plano não deve adicionar mais de 50ms ao request.
- [ ] Utilizar `React.cache` no componente de servidor (`getCurrentUser()`) para evitar duplicar requests na mesma renderização.

---

## 6. Histórico de Revisões

| Versão | Data | Autor | Mudança |
|---|---|---|---|
| 1.0 | 2026-04-24 | Antigravity AI | Criação da especificação de Auth e Plan Gating |

---

*Documento normativo — editordetexto.online SDD Infrastructure*
