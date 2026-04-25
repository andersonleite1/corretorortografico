# SDD Infrastructure — editordetexto.online

> **Specification-Driven Development (SDD)**
> **Versão:** 1.0.0 · **Mantido por:** Staff Engineering · **Criado em:** 2026-04-24

---

## Regra de Ouro

> **Nenhum agente de IA ou desenvolvedor pode escrever uma linha de código sem antes ler e validar a especificação técnica correspondente em `/docs/specs/`.**

Esta regra é não-negociável. Toda feature, bugfix significativo ou mudança arquitetural deve ter um arquivo `.md` de especificação criado, revisado e com `status: approved` antes que qualquer implementação comece.

---

## Artefato 1 — Árvore de Diretórios `/docs`

```
docs/                                         ← Raiz da documentação do projeto
│
├── SDD_INFRASTRUCTURE.md                     ← Este arquivo (fundação do SDD)
│
├── architecture/                             ← Documentação arquitetural permanente
│   ├── ARCHITECTURE.md                       ← C4 Model Level 2, árvore de diretórios,
│   │                                            decisões de stack, fluxos de persistência
│   ├── ADR/                                  ← Architecture Decision Records
│   │   ├── ADR-000-TEMPLATE.md               ← Template para novos ADRs
│   │   ├── ADR-001-monolith-modular.md       ← Decisão: monolito modular vs microserviços
│   │   ├── ADR-002-offline-first.md          ← Decisão: localStorage como source of truth
│   │   ├── ADR-003-clerk-auth.md             ← Decisão: Clerk vs Auth.js vs Supabase Auth
│   │   ├── ADR-004-tiptap-editor.md          ← Decisão: Tiptap vs Lexical vs Slate
│   │   └── ADR-005-prisma-neon.md            ← Decisão: Prisma + Neon Serverless
│   │
│   └── diagrams/                             ← Diagramas C4 e fluxogramas
│       ├── c4-context.mmd                    ← C4 Level 1: contexto do sistema
│       ├── c4-container.mmd                  ← C4 Level 2: contêineres (em ARCHITECTURE.md)
│       └── sync-flow.mmd                     ← Fluxo local→cloud de documentos
│
└── specs/                                    ← Especificações de features (SDD core)
    ├── _TEMPLATE_SPEC.md                     ← Template oficial (ver Artefato 2)
    ├── _INDEX.md                             ← Índice de todas as specs (status, autor, data)
    │
    ├── editor/                               ← Features do editor Tiptap/CodeMirror
    │   ├── SPEC-001-languagetool-extension.md
    │   ├── SPEC-002-search-and-replace.md
    │   └── SPEC-003-source-mode-bidirectional-sync.md
    │
    ├── ai/                                   ← Features de inteligência artificial
    │   ├── SPEC-010-ai-rewrite.md
    │   ├── SPEC-011-ai-translate.md
    │   ├── SPEC-012-ai-ghostwriter.md
    │   └── SPEC-013-ai-seo-suggestions.md
    │
    ├── documents/                            ← Features de gestão de documentos
    │   ├── SPEC-020-local-cloud-sync.md
    │   ├── SPEC-021-document-export.md
    │   └── SPEC-022-document-sharing.md
    │
    ├── auth/                                 ← Features de autenticação e autorização
    │   ├── SPEC-030-clerk-integration.md
    │   └── SPEC-031-plan-gating.md
    │
    ├── billing/                              ← Features de pagamento e planos
    │   ├── SPEC-040-stripe-checkout.md
    │   └── SPEC-041-usage-metering.md
    │
    └── pwa/                                  ← Features de Progressive Web App
        └── SPEC-050-service-worker-cache.md
```

**Convenções de nomenclatura:**

| Padrão | Descrição |
|---|---|
| `SPEC-{NNN}-{slug}.md` | Features novas. NNN é sequencial por domínio (000–009: infra, 010–019: AI, etc.) |
| `ADR-{NNN}-{slug}.md` | Architecture Decision Records. Imutáveis após `status: accepted` |
| `_TEMPLATE_*.md` | Prefixo `_` indica arquivo de scaffolding, não uma spec real |
| `_INDEX.md` | Índice mestre — atualizado a cada nova spec criada |

---
