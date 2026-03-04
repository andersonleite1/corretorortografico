# QA Report #5 — Editor de Texto

**Data:** 2026-03-02  
**Analista:** Antigravity (IA Coding Assistant — Papel: QA Analyst)  
**Versão do Sistema:** 0.1.1 (Beta / Pré-Lançamento)  
**Status Geral:** ⚠️ Necessita Ajustes Críticos Legais e de Performance

## Resumo Executivo

Após as correções massivas realizadas no Report #4, foi feita uma nova varredura focada em **Consistência de Segurança**, **Escalabilidade de Dados** e **Conformidade Legal (Prontidão de Produção)**.

| Categoria                     | Qtd. | Severidade Máx. |
| ----------------------------- | ---- | --------------- |
| Vulnerabilidades de Segurança | 3    | 🟠 Alta         |
| Bugs de Conformidade Legal    | 2    | 🔴 Crítica      |
| Riscos de Escalabilidade      | 2    | 🟡 Média        |
| Acessibilidade (A11y)         | 1    | 🔵 Baixa        |

---

## 🔴 1. Prontidão de Produção: Conformidade Legal (CRÍTICO)

### [PROD-01] Termos de Uso e Política de Privacidade Inconsistentes

- **Local:** `src/data/pages/terms.ts` e `src/data/pages/privacy.ts`
- **Descrição:** Os textos afirmam explicitamente que o site "não exige cadastro" e "não armazena conteúdo nos servidores". No entanto, o sistema possui integração com Clerk (Auth) e salva Documentos e Rascunhos no banco de dados.
- **Impacto:** Risco legal e quebra de confiança do usuário. Inviabiliza lançamento comercial.
- **Recomendação:** Atualizar textos para refletir o armazenamento de documentos para usuários logados e a coleta de dados via Clerk.

---

## 🟠 2. Vulnerabilidades de Segurança

### [SEG-08] Inconsistência na Sanitização de Inputs de IA

- **Local:** `src/app/api/ai/seo/route.ts` e `src/app/api/ai/translate/route.ts`
- **Descrição:** Diferente da rota de 'Rewrite' (corrigida no relatório anterior), as rotas de SEO e Tradução não aplicam a função `sanitizeAiInput`.
- **Impacto:** Possibilidade de Prompt Injection que pode disturbar a lógica de análise ou tradução.
- **Recomendação:** Aplicar `sanitizeAiInput` em todos os campos de texto enviados para a IA.

### [SEG-09] Falta de Timeout em Requisições Externas (LanguageTool)

- **Local:** `src/app/api/languagetool/route.ts`
- **Descrição:** A chamada de `fetch` para o servidor LanguageTool não possui timeout configurado.
- **Impacto:** Se o servidor externo ficar lento, as threads da aplicação ficam presas, podendo causar indisponibilidade (DoS por exaustão de recursos em ambientes serverless).
- **Recomendação:** Utilizar `AbortController` para definir um timeout de no máximo 5-10 segundos.

---

## ris 3. Riscos de Escalabilidade

### [ESC-05] Processamento de Métricas em Memória no Dashboard

- **Local:** `src/app/api/dashboard/route.ts`
- **Descrição:** O cálculo de "Tempo Economizado" é feito iterando sobre todos os registros de `AiUsage` do usuário no Node.js via `reduce`.
- **Impacto:** Para usuários pesados com milhares de usos, a API ficará extremamente lenta e consumirá muita memória, podendo travar a instância.
- **Recomendação:** Mover o cálculo para a query do banco de dados utilizando agregação do Prisma (`groupBy` ou `aggregate`).

### [ESC-06] Busca de UserID via API Stripe no Webhook

- **Local:** `src/app/api/webhooks/stripe/route.ts`
- **Descrição:** A função `handleSubscriptionUpsert` faz uma chamada extra `stripe.customers.retrieve` se o `userId` não estiver no metadata.
- **Impacto:** Aumenta a latência do webhook e consome cota da API da Stripe desnecessariamente.
- **Recomendação:** Garantir que todos os Checkouts e Subscriptions iniciados na aplicação sempre enviem o `userId` nos metadados da sessão Stripe.

---

## 🔵 4. Acessibilidade (A11y)

### [A11Y-01] Inputs sem Labels Associados

- **Local:** `src/app/[locale]/_components/EditForm.tsx` (Input de Título)
- **Descrição:** O input de título do documento não possui `<label>` nem `aria-label`.
- **Impacto:** Dificulta a navegação para usuários de leitores de tela.
- **Recomendação:** Adicionar `aria-label={formMessages.placeholders.title}` ao componente input.

---

## ✅ Avaliação de Lançamento (MVP)

O sistema está **técnicamente estável** em termos de bugs de código, mas **NÃO está pronto para lançamento em produção** devido ao item **[PROD-01]**. Os Termos de Uso fornecem informações falsas sobre a natureza do serviço, o que pode gerar complicações jurídicas.

**Próximos passos obrigatórios:**

1. Revisão e correção dos textos legais.
2. Unificação da sanitização de IA.
3. Otimização das queries de dashboard para escalabilidade.
