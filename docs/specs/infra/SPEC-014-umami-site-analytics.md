# SPEC-014 — Estatísticas de visitas com Umami

## 1. Metadados

| Campo | Valor |
|---|---|
| ID | SPEC-014 |
| Status | `approved` |
| Criação | 2026-10-24 |
| Autor | Codex |
| Revisor | Anderson Leite — código de acompanhamento fornecido no chat |
| Feature relacionada | Métricas públicas de visita na landing |
| ADRs | nenhum |

## 2. Contexto e objetivo

Instalar o código Umami informado pelo usuário para acompanhar visitas ao CorretorOrtografico.online. A integração carrega no `<head>`, roda apenas no domínio público e exclui query string e fragmento das URLs enviadas nos pageviews. A página de privacidade informa a medição e que o código não envia o conteúdo digitado nem o título do rascunho.

Fora do escopo: Google Analytics, Microsoft Clarity, eventos customizados, identidade de visitantes, coleta do texto/documento, banner de consentimento novo e integração com banco.

## 3. Requisitos de engenharia

- Usar `next/script` no Root Layout, `strategy="beforeInteractive"`.
- Script: `https://umami.andersonleite.dev.br/script.js`.
- Website ID público informado: `2da7b158-1b49-4e89-8cc9-4d1d85485c37`.
- Restringir execução ao domínio `corretorortografico.online`.
- Definir `data-exclude-search="true"` e `data-exclude-hash="true"`.
- Atualizar CSP de produção para permitir carregar o script e enviar métricas ao mesmo host.
- Não montar o componente legado que contém IDs de Google Analytics e Clarity.
- Atualizar aviso de privacidade da landing e documentação técnica.

### Arquivos permitidos

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `next.config.mjs`
- `README.md`
- `docs/specs/_INDEX.md`
- `docs/specs/infra/SPEC-013-pre-launch-seo.md`
- `docs/specs/infra/SPEC-014-umami-site-analytics.md`
- `docs/architecture/PRE_LAUNCH_SEO_ROLLOUT.md`

### Harness Impact Map

| Campo | Valor |
|---|---|
| Risco | Baixo: script externo de métricas; sem alteração no editor ou persistência |
| Entradas | Navegação no domínio público |
| Dados | Pageviews; query string e hash excluídos; nenhum texto/título passado pelo código |
| Externos | Host Umami informado pelo usuário |
| Sensores | ESLint, TypeScript/build, inspeção do HTML inicial e CSP; nenhuma dependência nova |
| Rollback | Remover script, diretivas CSP e aviso de analytics identificados nesta spec |

## 4. Contratos

- Script deferido entregue por `next/script` no `<head>` antes da interatividade.
- `data-domains` restringe o tracker ao domínio canônico e evita visitas locais/de preview.
- `data-exclude-search` e `data-exclude-hash` evitam enviar parâmetros como `docId` e âncoras da página.
- Nenhuma API, banco, cookie próprio, perfil ou identificador individual é adicionado pelo site.
- O ID de site é identificador público, não credencial secreta.

## 5. Critérios de aceite

- [x] Script contém a URL e o website ID fornecidos pelo usuário.
- [x] Script fica no `<head>` e só funciona no domínio de produção.
- [x] Query string e fragmento são excluídos dos pageviews.
- [x] CSP de produção permite carregamento e envio ao host Umami.
- [x] Landing e README descrevem analytics sem alegar anonimato ou garantias legais.
- [x] Nenhum ID legado de analytics é montado.
- [x] Build, inspeção de HTML e CSP concluem sem erro.

## 6. Histórico

2026-10-24 — Especificação aprovada pela instrução do usuário ao fornecer o tracking code para instalação.
