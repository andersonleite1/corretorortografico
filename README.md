# CorretorOrtografico.online

Landing page em português brasileiro com um editor de texto online integrado ao LanguageTool. A correção, as sugestões de gramática e a revisão de estilo são o foco principal do produto.

## Escopo da versão atual

- Editor Tiptap com sugestões do LanguageTool configuradas para português brasileiro.
- Rascunhos guardados localmente no navegador; sem login e sem sincronização em nuvem.
- Sem banco de dados, documentos na nuvem, dashboard, pagamentos ou recursos de IA.
- A rota `/api/languagetool` encaminha as análises para o serviço configurado.
- A exportação em PDF usa o serviço de conversão configurado em `GOTENBERG_URL`.

## Desenvolvimento

Requer Node.js `>=20.18.1` e npm.

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Configuração opcional

- `NEXT_PUBLIC_APP_URL`: URL da aplicação usada na validação de origem da API.
- `LANGUAGETOOL_ENDPOINTS`: lista de endpoints `/v2/check` separados por vírgula. Se omitido, usa os endpoints configurados no código.
- `GOTENBERG_URL`: serviço usado para exportação de PDF.
- `GOTENBERG_API_BASIC_AUTH_USERNAME` / `GOTENBERG_API_BASIC_AUTH_PASSWORD`: autenticação opcional no serviço de PDF.
- `GOOGLE_SITE_VERIFICATION`: token público de verificação de propriedade no Google Search Console.
- `BING_SITE_VERIFICATION`: token público de verificação no Bing Webmaster Tools.

Não configure `DATABASE_URL`: a aplicação não precisa de banco de dados.

## SEO e lançamento

A home entrega o conteúdo público no HTML inicial, incluindo instruções, exemplos, FAQ, contato e informações de privacidade. O editor permanece no cliente. Há canonical, sitemap, robots.txt e imagem Open Graph gerada pelo Next.

As variáveis de verificação por metatag são opcionais. Preencha apenas o token informado pelo painel do buscador, antes de executar o build; sem valor, a metatag não é emitida. Para a verificação XML do Bing, o arquivo `public/BingSiteAuth.xml` é servido na raiz como `/BingSiteAuth.xml`. A propriedade precisa estar publicada para os buscadores validarem os métodos ou receberem o sitemap.

```bash
npm run build
npm run start -- -p 3001
```

Antes de publicar, conferir o HTML e a imagem `/opengraph-image` no build de produção. Após a publicação, validar domínio/TLS, enviar `/sitemap.xml` nos painéis e acompanhar consultas, dispositivos e presença nos relatórios de IA. O roteiro completo está em [PRE_LAUNCH_SEO_ROLLOUT.md](docs/architecture/PRE_LAUNCH_SEO_ROLLOUT.md).

O Umami registra estatísticas de visita apenas no domínio público. A configuração exclui parâmetros e fragmentos da URL dos pageviews e não envia o texto ou o título do rascunho pelo código de analytics. O contato público da ferramenta é contato@corretorortografico.online.
