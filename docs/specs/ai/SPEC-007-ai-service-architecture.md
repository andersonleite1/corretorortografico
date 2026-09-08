# SPEC-007 — Arquitetura de Serviços de IA

<!-- ================================================================
  TEMPLATE OFICIAL — editordetexto.online
  Versão: 1.0.0
================================================================ -->

---

## 1. Metadados

| Campo | Valor |
|---|---|
| **Título** | Arquitetura de Serviços de IA (Vercel AI SDK) |
| **ID** | SPEC-007 |
| **Status** | `approved` |
| **Data de Criação** | 2026-04-24 |
| **Última Atualização** | 2026-04-24 |
| **Autor** | Antigravity AI |
| **Revisor** | Anderson Leite |
| **Feature Relacionada** | AI Core |
| **ADRs Referenciados** | nenhum |

---

## 2. Contexto e Objetivo

### 2.1 Problema que esta feature resolve

A integração de IA é o maior custo variável do projeto e o maior risco de segurança (Prompt Injection). Precisamos de uma arquitetura que padronize o consumo de LLMs, controle custos rigorosamente e proteja os prompts do sistema.

### 2.2 O que esta feature entrega

- [ ] Abstração via Vercel AI SDK para troca rápida de modelos (OpenAI, Anthropic, etc.).
- [ ] Streaming de texto para experiência de usuário em tempo real.
- [ ] Gating de uso por plano (Free vs Pro) com limites diários e mensais.
- [ ] Sistema de sanitização anti-jailbreak para instruções customizadas.
- [ ] Logs de observabilidade para métricas de eficiência (tokens/palavra/tempo).

### 2.3 O que está FORA do escopo

- Treinamento de modelos próprios.
- Armazenamento de vetores (RAG) — o editor trabalha apenas com o contexto imediato do documento.

### 2.4 Dependências

| Dependência | Tipo | Status |
|---|---|---|
| Vercel AI SDK Core | `blocker` | `done` |
| OpenAI API Key | `blocker` | `done` |
| PostgreSQL (Ratelimit) | `blocker` | `done` |
| SPEC-004 (Auth) | `blocker` | `done` |

---

## 3. Requisitos de Engenharia

### 3.1 Camada de Segurança (The Guardrails)

Todo Route Handler de IA (`/api/ai/*`) deve seguir obrigatoriamente esta ordem de middleware interno:
1.  **Global IP Rate Limit**: Proteção contra ataques de negação de serviço (DoS) usando PostgreSQL.
2.  **Auth Check**: Verificação de `userId` via Clerk.
3.  **Plan Limit Check**: Verificação de saldo de uso (`checkAiRateLimit`) no banco de dados.
4.  **Input Sanitization**: Aplicação de `sanitizeAiInput()` em qualquer string vinda do usuário que vá compor o prompt final.

### 3.2 Padronização de Prompts

- **System Prompt**: Deve ser estático e definido no servidor, nunca enviado pelo cliente.
- **Tone Prompts**: Uma biblioteca centralizada de instruções de estilo (Formal, Casual, Instagram, etc) para garantir consistência em diferentes partes do app.
- **Formato de Saída**: Instruir explicitamente a LLM a retornar apenas o texto final, sem "markdown backticks" desnecessários ou prefácios ("Aqui está sua reescrita:").

### 3.3 Observabilidade (`aiUsage`)

Ao final de cada stream bem-sucedido (`onFinish`), deve-se registrar no Prisma:
- `tokensUsed`: Total de tokens (prompt + completion).
- `wordCount`: Quantidade de palavras processadas (para métricas de negócio).
- `processingTimeMs`: Tempo total de resposta da API.

---

## 4. Contratos e Tipagens

### 4.1 Schema de Input (Zod)
```typescript
const AiRequestSchema = z.object({
  text: z.string().min(1).max(5000), // Limite de segurança p/ contexto
  tone: z.string(),
  customInstructions: z.string().max(500).optional(),
  language: z.string().default("pt-BR"),
});
```

---

## 5. Critérios de Aceite para a IA

### 5.1 Implementação de Rotas
- [ ] Usar obrigatoriamente `streamText` do Vercel AI SDK.
- [ ] Definir `runtime = "nodejs"` para compatibilidade com Prisma.
- [ ] Configurar `AI_MODEL` via variável de ambiente (fallback: `gpt-4o-mini`).

### 5.2 Segurança e Abuso
- [ ] Retornar HTTP 429 se o limite do plano for atingido, com mensagem clara de upgrade.
- [ ] Tratar erros de API da OpenAI (Quota exceed, Down) para não expor a stack trace original ao usuário.

### 5.3 UX
- [ ] Resposta deve começar a ser renderizada no cliente em menos de 1s (TTFB).

---

## 6. Histórico de Revisões

| Versão | Data | Autor | Mudança |
|---|---|---|---|
| 1.0 | 2026-04-24 | Antigravity AI | Especificação da Arquitetura de IA |

---

*Documento normativo — editordetexto.online SDD Infrastructure*
