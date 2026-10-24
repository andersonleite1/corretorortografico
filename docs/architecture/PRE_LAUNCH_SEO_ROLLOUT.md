# SEO pré-lançamento — CorretorOrtografico.online

Data: 24/10/2026. Escopo aprovado: SPEC-013, após a auditoria `docs/SEO_AI_AUDIT_PRE_LAUNCH.md` e a solicitação “aplique esses ajustes”.

## Implementação

- Idioma anunciado alinhado ao português brasileiro configurado na home, no README, no `llms.txt` e nos documentos de escopo.
- Benefícios “Grátis · Sem cadastro · Português brasileiro” próximos ao editor, sem botão adicional.
- Passo a passo para corrigir texto online, categorias, exemplos próprios e casos de uso na mesma landing renderizada no servidor.
- Seções de apresentação, contato e informações sobre o processamento dos textos, acessíveis pelo rodapé. E-mail fornecido pelo responsável no chat: `contato@corretorortografico.online`.
- Explicação de salvamento local, análise pelo LanguageTool via servidor e conversão PDF pelo serviço configurado. Nenhuma afirmação sobre prazos de retenção de terceiros ou funcionamento offline da análise.
- Imagem social PNG de 1200 × 630 gerada pela convenção `opengraph-image.tsx`, com fonte embutida no Next; nenhuma consulta externa necessária para gerá-la. Twitter usa cartão grande com a mesma imagem.
- Tokens opcionais `GOOGLE_SITE_VERIFICATION` e `BING_SITE_VERIFICATION` ligados à metadata nativa. Sem valor, nenhuma tag vazia é gerada.
- `.env.example` atualizado para as configurações da v1, removendo instruções de banco, Clerk, Stripe e integrações antigas que não participam da aplicação pública.
- Contraste do texto de status e dos botões de sugestão corrigido após a medição: azul `#1d4ed8` no fundo claro e `#60a5fa` no escuro. Nenhuma lógica do editor foi modificada.

Título, H1, canonical, cinco perguntas/respostas da FAQ e contrato do editor foram preservados. O schema de FAQ continua correspondendo ao texto visível, sem promessa de resultado enriquecido. Não foram criados schemas com organização, credenciais ou avaliações inventadas.

## Exemplos conferidos

Foram enviadas apenas frases sintéticas à API local, que encaminhou as análises ao serviço LanguageTool configurado:

| Categoria             | Antes                                       | Sugestão recebida                           |
| --------------------- | ------------------------------------------- | ------------------------------------------- |
| Ortografia            | Precizamos revisar o texto antes de enviar. | Precisamos revisar o texto antes de enviar. |
| Concordância          | Os documento estão prontos para revisão.    | Os documentos estão prontos para revisão.   |
| Pontuação/espaçamento | O texto está pronto , vamos revisar.        | O texto está pronto, vamos revisar.         |

Uma frase inicial de vocativo não foi sinalizada pelo serviço e não foi usada na demonstração. Os exemplos publicados não prometem que o corretor detecte todas as ocorrências em qualquer contexto.

## Configuração dos buscadores

1. Criar/verificar a propriedade do domínio no Google Search Console e no Bing Webmaster Tools.
2. Preferir verificação por DNS quando apropriado. Se usar metatags, preencher em ambiente de build apenas os códigos fornecidos pelos painéis, não a tag HTML inteira:

   ```dotenv
   GOOGLE_SITE_VERIFICATION=
   BING_SITE_VERIFICATION=
   ```

3. Executar um novo build/deploy após definir os códigos: a home e suas metatags são pré-renderizadas.
4. Conferir `google-site-verification` e `msvalidate.01` no HTML publicado, concluir a verificação nos painéis e enviar `https://corretorortografico.online/sitemap.xml`.

As variáveis não verificam a conta automaticamente. O Umami foi instalado posteriormente conforme a [SPEC-014](../specs/infra/SPEC-014-umami-site-analytics.md). O tracker só executa no domínio canônico, exclui query string e fragmento dos pageviews, e a landing explica a medição. A configuração do servidor de métricas é a URL fornecida pelo usuário; o serviço precisa estar acessível no lançamento. Nenhum conteúdo de texto ou título de rascunho é passado ao código de analytics.

Validação do Umami: build de produção e ESLint concluídos; HTML prerenderizado contém o bootstrap `beforeInteractive` no `<head>` com o ID e atributos configurados. A CSP de produção autoriza `script-src` e `connect-src` apenas para o host de métricas informado. A coleta de uma visita real depende de domínio público e disponibilidade do servidor Umami, ainda não confirmada antes do lançamento.

## Verificações

- Build de produção concluído, incluindo TypeScript e geração estática da home, imagem, robots e sitemap.
- ESLint dos três arquivos TSX de implementação: aprovado, sem warnings.
- HTTP do build de produção local: `/`, robots, sitemap, `llms.txt`, imagem e home com `docId` respondem 200; página inexistente responde 404.
- `www` local retorna 308 para HTTPS canônico e preserva a query.
- HTML inicial contém um H1, as seções novas, o e-mail e os três exemplos. Canonical permanece na raiz, inclusive com parâmetros locais.
- JSON-LD parseável: `WebSite` e `FAQPage`; cinco perguntas/respostas iguais às visíveis.
- Sem códigos configurados, as metatags de verificação são omitidas. O fluxo com códigos reais depende da futura configuração das propriedades.
- Metadados OG e Twitter apontam para a imagem gerada: PNG válido, 1200 × 630, 55.910 bytes na versão conferida.

O build avisou que a base Browserslist tem sete meses e que os `@import` Sass existentes serão descontinuados. Os avisos não impediram a compilação; não houve atualização de dependências ou migração global de estilos nesta entrega.

Conferência visual no browser: editor montado e texto de status em `rgb(29, 78, 216)`. Não houve rolagem horizontal nas larguras úteis de 1265, 375 e 305 pixels. A revisão mobile identificou o nome do domínio na seção Sobre e o link do cabeçalho como pontos de excesso de largura; foram corrigidos com quebra permitida no domínio, coluna com largura flexível e quebra de linha no cabeçalho. O link do rodapé navega até a seção de contato, e o e-mail cabe na área disponível. Foram registradas capturas de desktop e mobile; o viewport temporário foi restaurado.

As medições finais de Lighthouse são registradas abaixo após a validação. São execuções de laboratório no servidor local de produção, com navegador isolado e perfil padrão de cada dispositivo; não representam dados reais de usuários nem ranking. As primeiras execuções oscilaram entre 95 e 99 no mobile e 98 e 100 no desktop: não se atribui essa variação somente às mudanças cosméticas.

### Lighthouse — build final

Lighthouse 13.5.0, ferramenta já disponível no ambiente, sem instalação de dependências. Execuções desktop e mobile feitas em sequência, sem medições simultâneas. Nenhum warning de execução nos relatórios finais.

| Categoria / métrica | Desktop | Mobile |
| ------------------- | ------: | -----: |
| Desempenho          |     100 |     97 |
| Acessibilidade      |     100 |    100 |
| Boas práticas       |     100 |    100 |
| SEO                 |     100 |    100 |
| LCP                 |   0,3 s |  1,5 s |
| TBT                 |    0 ms | 180 ms |
| CLS                 |   0,001 |      0 |

A primeira medição desktop identificou contraste de 3,67:1 no status, com nota 97 em acessibilidade. Após o ajuste do azul, a auditoria de contraste passou. As notas de desempenho variam entre execuções; a tabela registra a última medição do build final, não uma garantia de pontuação futura. TBT é uma métrica de laboratório e não substitui INP de campo.

Relatórios brutos temporários: `/tmp/corretor-seo-desktop-final.json` e `/tmp/corretor-seo-mobile-final.json`. O servidor de produção local foi usado apenas para validação; o servidor de desenvolvimento existente foi preservado. Não foram criados testes que apenas reproduzem o texto da página; a validação incluiu build, HTML, dados estruturados, imagem, Lighthouse e browser. Nenhum erro de console foi registrado na página conferida.

## Publicação e medição pendentes

O site ainda não está em produção. Antes do lançamento, vincular o domínio à hospedagem, conferir DNS e TLS entre Cloudflare e origem e validar HTTP → HTTPS e `www` → domínio principal. A auditoria prévia observou erro público 525; isso é uma pendência de preparação do domínio, não uma regressão deste código.

Depois do lançamento, verificar HTML/headers e a imagem usando o domínio público, confirmar acesso dos crawlers e inspecionar a URL nos painéis. Enviar o sitemap e acompanhar indexação/canonical escolhida. IndexNow pode ser configurado depois com a chave da propriedade para comunicar mudanças de URLs públicas; nenhuma chamada ou integração IndexNow foi criada nesta entrega.

O arquivo de autenticação XML do Bing foi adicionado como `public/BingSiteAuth.xml`. O build local o serve com `200 OK`; no domínio público, a URL ainda responde `404` em 2026-10-24. Publique esta versão e depois conclua a verificação pelo Bing Webmaster Tools.

Acompanhar consultas, impressões, cliques, CTR e posição média por página, país Brasil e dispositivo. Para busca com IA, consultar os relatórios de IA generativa no Google e AI Performance no Bing. Citação e visita não são a mesma métrica. Nenhuma posição, citação ou resultado de Core Web Vitals de campo foi demonstrado por esta implementação local.

## Rollback

Reverter somente os arquivos da SPEC-013. Preservar os rascunhos no navegador, a auditoria inicial e alterações de outras entregas. Não há migração, banco ou estado remoto a restaurar.
