# Correções técnicas SEO — Semrush / Editor de Texto

Data: 2026-10-04. Escopo aprovado: SPEC-011. Alterações locais, ainda não publicadas.

## Implementação

| Área | Alteração | Situação |
| --- | --- | --- |
| Schema global | SoftwareApplication removido do layout; WebSite apenas nas homes PT/EN/ES | Conferido no HTML local |
| Localização do schema | URL e inLanguage obtidos do conteúdo da rota, sem depender do cookie do layout | pt-BR / en / es corretos |
| Schema de aplicativo | Nenhuma avaliação inventada; categoria reservada corrigida para UtilitiesApplication | Rich result de aplicativo não solicitado enquanto não houver reviews reais |
| Title EN | Free Online Text Editor — Write, Format & Export | 48 caracteres; corpo, PT/ES e OG anteriores preservados |
| Contato/Privacidade/Termos | Comentários HTML email_off envolvendo os contatos dos três idiomas | 9 páginas conferidas com mailto e par de comentários |
| www | Middleware retorna 308 para o domínio HTTPS principal, preservando caminho/query | Conferido localmente inclusive para assets e robots.txt |
| HSTS | Valor existente extraído para módulo ESM compartilhado pelo config e middleware | Confirmado na resposta 308 local |

## Decisão sobre o redirect

O redirect inicial em next.config funcionou, mas descartou HSTS. Na versão instalada do Next.js 14.2.35, a ramificação de redirect em resolve-routes retorna sem resHeaders. A correção usa NextResponse.redirect com o cabeçalho explícito antes do i18n, sem alterar o bloco de autorização das APIs.

O matcher adicional depende exclusivamente do host www.editordetexto.online e inclui arquivos estáticos. O middleware verifica o header Host exato; não usa x-forwarded-host para escolher destino. O hostname de destino é fixo. O matcher original permanece para os outros hosts.

## Reuse Assessment / Manifesto da alteração

- extend-existing: getHomeContent, getLocaleUrl, hrefLangMap, home/layout, i18n middleware, configuração de headers e strings HTML dos termos.
- extract-shared: PublicContactEmail reutiliza o único endereço público existente em contato e privacidade. HTML constante; não aceita conteúdo de usuário.
- extract-shared: security-headers.mjs centraliza o valor HSTS para evitar divergência entre configuração ESM e resposta Edge.
- Nenhuma dependência, API nova, migration, armazenamento ou integração externa adicionada.
- Alterações anteriores da aquisição Zerus e do editor preservadas; package-lock.json não foi alterado nesta entrega.

Arquivos de implementação: next.config.mjs; src/middleware.ts; src/lib/security-headers.mjs; src/app/layout.tsx; src/app/[locale]/page.tsx; src/data/home/index.ts, pt.ts, en.ts, es.ts; src/components/shared/PublicContactEmail.tsx; src/app/[locale]/contato/ContactPageContent.tsx; src/app/[locale]/privacidade/PrivacyPageContent.tsx; src/data/pages/terms.ts.

Documentação: docs/specs/infra/SPEC-011-semrush-technical-seo.md; docs/specs/_INDEX.md; este documento.

## Evidências locais

- TypeScript: tsc --noEmit --incremental false, exit 0.
- Lint dos arquivos alterados: sem warnings/erros, exit 0.
- git diff --check: exit 0.
- Inspeção HTTP de 15 páginas: todas 200; homes contêm WebSite + FAQPage, páginas institucionais não contêm SoftwareApplication.
- Homes: PT URL https://editordetexto.online e pt-BR; EN /en e en; ES /es e es. Canonical e títulos PT/ES mantidos.
- Cada uma das 9 páginas de contato/privacidade/termos contém um par real de comentários email_off e um mailto direto no HTML, independente de JavaScript.
- Host www com /?utm_source=seo, /en/contato?utm_source=seo&x=1, /background.webp?x=1 e /robots.txt: 308; Location no principal com caminho/query preservados; Strict-Transport-Security: max-age=63072000; includeSubDomains; preload.
- Nenhuma suíte automatizada criada ou executada. Build de produção desta entrega não executado.
- harness:check e graphify:refresh não existem no editordetexto; este trabalho não modifica o repositório Zerus.

## O que depende de publicação e infraestrutura

1. Publicar a versão com estas alterações. O site online ainda entrega a versão anterior.
2. Conferir na hospedagem se www.editordetexto.online está vinculado ao mesmo projeto/serviço da raiz. O 404 de produção pode ser gerado antes de a requisição chegar ao Next.js; o código não pode corrigir um host que não chega à aplicação.
3. Conferir DNS do www e certificado TLS. Não trocar registros por suposição; usar os valores indicados pela hospedagem existente. Não há provisionamento de DNS/TLS/host neste repositório.
4. Se o www for tratado por uma regra de redirect no Cloudflare ou proxy antes da aplicação, essa resposta HTTPS precisa incluir HSTS na borda; o header da aplicação só funciona quando a requisição chega até ela.
5. Após publicação, conferir o HTML público das nove páginas: mailto direto e ausência de href para /cdn-cgi/l/email-protection. Os comentários usados são o mecanismo documentado de exclusão pontual do Cloudflare; localhost não comprova a transformação final da borda. Se alguma otimização intermediária remover os comentários, ajustar uma regra de configuração Cloudflare para estas rotas e conferir novamente.
6. Reexecutar a auditoria Semrush após publicação e conferir Search Console. Os números atuais não mudam apenas porque o repositório foi corrigido.

Não foram alterados DNS, painel Cloudflare, TLS ou serviço de hospedagem; não há acesso configurado a esses recursos nesta entrega. Não foi feito deploy.

## Alertas heurísticos preservados

Baixa quantidade de palavras em Contato/Sobre e proporção texto/HTML não foram tratadas com adição artificial de conteúdo. O texto da landing e seus H1, seções, FAQ, canonical e hreflang foram preservados. Otimizações de desempenho exigem diagnóstico próprio; os alertas de proporção não provam lentidão ou problema de indexação.

## Referências

- Cloudflare: https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/
- Google / SoftwareApplication: https://developers.google.com/search/docs/appearance/structured-data/software-app
- Next.js 14 / redirects: https://nextjs.org/docs/14/app/api-reference/next-config-js/redirects

## Rollback

Reverter somente o diff da SPEC-011, preservando as alterações não commitadas anteriores. Os snapshots anteriores desta entrega estão em /private/tmp/editordetexto-seo-before (temporários). Não há migration nem dados a restaurar.
