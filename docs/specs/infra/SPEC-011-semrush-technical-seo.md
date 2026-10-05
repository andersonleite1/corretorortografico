# SPEC-011 — Correções técnicas da auditoria Semrush

## 1. Metadados

| Campo | Valor |
| --- | --- |
| ID | SPEC-011 |
| Status | `approved` |
| Data de Criação / Última Atualização | 2026-10-04 |
| Autor | Codex |
| Revisor | Anderson Leite — autorização no chat: “prossiga com esses ajustes necessarios o que voce nao conseguir fazer me informe” |
| Feature Relacionada | Auditoria Semrush 25419958, verificada em produção e no repositório |
| ADRs | nenhum |

## 2. Contexto e objetivo

Corrigir falhas técnicas confirmadas sem reescrever o conteúdo orgânico ranqueado. A auditoria aponta 16 schemas de aplicativo incompletos, 9 links Cloudflare de proteção de e-mail, 404 no www, título inglês longo e HSTS ausente no www.

### Entregas

- Remover SoftwareApplication do layout global. Sem avaliações reais, usar WebSite somente nas homes, localizado e com URL coerente, sem prometer rich result de aplicativo.
- Corrigir a categoria reservada nos dados para UtilitiesApplication; nenhum review/rating inventado.
- Encurtar apenas seo.title inglês, preservando a palavra-chave e os benefícios principais.
- Emitir comentários HTML email_off ao redor dos contatos públicos, conforme documentação Cloudflare. O link mailto e o texto visível continuam disponíveis sem JavaScript.
- Redirecionar o host www.editordetexto.online permanentemente ao HTTPS principal, preservando path/query, antes do processamento de locale. Manter HSTS nas respostas.
- Documentar dependências de DNS, TLS, configuração de hospedagem e validação após deploy.

### Fora do escopo

Deploy; alterações de conta Cloudflare/DNS sem acesso; reviews fictícios; reescrita da landing; aumentar palavras para satisfazer heurísticas; APIs, auth, editor, banco ou dependências.

### Dependências

SPEC-003 e SPEC-009 approved; DNS/TLS/vínculo de www à hospedagem pendentes de conferência externa. O repositório não provisiona estes recursos.

## 3. Requisitos de engenharia

Next.js 14 App Router, componentes servidor, canonicalização de host no middleware Edge antes do processamento de i18n. Reusar getHomeContent/getLocaleUrl e headers existentes; nenhuma API nova. JSON-LD escapa `<` na serialização. email_off deve estar no HTML real, não ser comentário JSX; HTML injetado do componente de e-mail é constante, sem entrada de usuário. Cache público e autenticação das APIs permanecem iguais.

### Arquivos permitidos

- docs/specs/infra/SPEC-011-semrush-technical-seo.md
- docs/specs/_INDEX.md
- docs/architecture/SEO_SEMRUSH_ROLLOUT.md
- src/app/layout.tsx
- src/app/[locale]/page.tsx
- src/data/home/index.ts, en.ts, pt.ts, es.ts
- src/components/shared/PublicContactEmail.tsx
- src/app/[locale]/contato/ContactPageContent.tsx
- src/app/[locale]/privacidade/PrivacyPageContent.tsx
- src/data/pages/terms.ts
- next.config.mjs
- src/middleware.ts
- src/lib/security-headers.mjs

### Harness Impact Map

| Campo | Valor |
| --- | --- |
| Risco | medium: metadados públicos e redirect de host antes do i18n no middleware |
| Entradas | homes PT/EN/ES; contato, privacidade, termos; host www |
| Dados | conteúdo público; nenhuma leitura/escrita de documentos ou banco |
| Externos | Cloudflare obfuscation, DNS/TLS/hosting, crawlers |
| Sensores | lint e TypeScript; inspeção de respostas HTML/headers locais; sem criar ou executar suítes de teste nesta entrega |
| Rollback | reverter somente o diff desta spec; mudanças anteriores preservadas |

### Reuse Assessment

extend-existing: helpers de metadata e locale, layout/home, redirects/headers existentes e strings HTML dos termos. extract-shared: PublicContactEmail concentra markup estático mailto/email_off reutilizado por contato e privacidade; nenhum componente equivalente encontrado. extract-shared: valor HSTS existente centralizado em security-headers.mjs para ser consumido pelo config ESM e middleware Edge sem dependências Node. Não criar serviço de contato, schema genérico ou configuração duplicada de HSTS.

## 4. Contratos e tipagens

getHomeWebsiteSchema(locale: string): WebSite JSON-LD com name/url/description/inLanguage do conteúdo correspondente; locale inválido usa o default existente. Não inclui offers, rating ou categoria de aplicativo. Montado somente na home.

PublicContactEmail({ className?: string }): markup estático do único e-mail público já utilizado, envolvido pelos comentários HTML documentados. Não aceita HTML/endereço vindo de usuário.

Host www exato: status 308, Location https://editordetexto.online + pathname + search. Middleware confere exclusivamente o hostname do header Host, sem confiar em x-forwarded-host. Config matcher contém uma regra de host específica para incluir também assets no www; demais hosts mantêm o matcher original. URL de destino fixa principal, pathname/search copiados; fragmentos não são enviados em HTTP. Demais hosts e contratos de APIs intactos. HSTS usa o valor já configurado: max-age=63072000; includeSubDomains; preload.

Nenhum contrato Zod/API/Prisma novo. Canonical/hreflang/H1, corpo da landing e title PT/ES preservados.

## 5. Critérios de aceite

- Home PT/EN/ES emite WebSite com idioma/URL correto; outras páginas não herdam SoftwareApplication.
- Schema de aplicativo incompleto e avaliações fictícias não são emitidos.
- Title EN conciso; conteúdo, title PT/ES, canonical e hreflang mantidos.
- Nove contatos em contato/privacidade/termos dos três idiomas emitem email_off no HTML com mailto funcional.
- Redirect www é permanente, preserva caminho/query e tem HSTS; demais hosts continuam usando i18n existente.
- Nenhuma dependência, banco, API protegida ou fluxo do editor alterado.
- Pendências de produção, DNS/TLS/hosting e novo crawl claramente registradas; não declarar www em produção resolvido apenas pelo código.

## 6. Notas de implementação e evidências

Next.js 14.2.35 descarta resHeaders nos redirects nativos: inspeção local confirmou 308 sem HSTS. Canonicalização movida para middleware com HSTS explícito e matcher específico para o host www. Configuração HSTS compartilhada com next.config para não duplicar a política. A resposta HTTPS da borda ainda depende de DNS/TLS/vínculo da hospedagem. Scripts harness:check e graphify:refresh não existem no editordetexto; não instalar ferramentas para esta entrega. Validação Cloudflare após publicação é obrigatória, pois localhost não executa a transformação da borda.

Evidências completas em docs/architecture/SEO_SEMRUSH_ROLLOUT.md. TypeScript, lint e diff --check concluídos com exit 0; 15 respostas HTML e 4 redirects locais inspecionados. Sem deploy, alteração de DNS/TLS/Cloudflare, build de produção ou execução de suíte de testes.

## 7. Histórico

2026-10-04 — Plano da auditoria aprovado no chat pelo usuário e registrado antes da implementação.
