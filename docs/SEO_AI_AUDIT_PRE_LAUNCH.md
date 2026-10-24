# Auditoria pré-lançamento — SEO, palavras-chave e busca com IA

Data: 24/10/2026. Código analisado: commit `8993cb7`.

O site ainda não está em produção, conforme confirmado pelo responsável durante a auditoria. Esta análise avalia a preparação para lançamento. Não atribui posições, tráfego ou citações ao projeto antes da publicação.

## Parecer

A landing tem uma boa base técnica para SEO: conteúdo público renderizado no servidor, tema principal claro, canonical consistente, sitemap enxuto e FAQ legível. O editor funcional atende à intenção de quem procura uma ferramenta de correção.

A preparação ainda está incompleta em três frentes: coerência das informações do produto, conteúdo que demonstre seu uso e identificação/confiança na marca. A instrumentação para medir descoberta, desempenho orgânico e citações também precisa ser preparada.

O termo principal está bem representado. Termos secundários têm cobertura parcial, mas a ausência de uma expressão exata não prova falha de otimização: vários pertencem à mesma intenção e devem ser atendidos na mesma página, com texto natural. Não há dados para declarar volume de busca, dificuldade ou ranking.

## Escopo e evidências

Foram examinados os arquivos de rotas, metadata, JSON-LD, robots, sitemap, proxy de host, configuração do editor, documentação de produto e analytics. Também foram consultadas fontes oficiais atuais de Google, Microsoft/Bing, OpenAI e Cloudflare.

Inspeções HTTP locais, sem execução de JavaScript:

| Recurso                   | Resultado observado                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| `/`                       | HTTP 200; título, descrição, canonical, conteúdo e FAQ presentes no HTML                            |
| HTML da landing           | `lang="pt-BR"`; um H1; hierarquia H2/H3; cinco perguntas e respostas                                |
| JSON-LD                   | `WebSite` e `FAQPage` parseáveis; as cinco respostas correspondem ao conteúdo visível               |
| `/robots.txt`             | HTTP 200; `User-Agent: *`, `Allow: /`, sitemap do domínio novo                                      |
| `/sitemap.xml`            | HTTP 200; apenas a URL canônica da landing                                                          |
| `/llms.txt`               | HTTP 200; descrição do produto, limitações e termos relacionados                                    |
| `/?docId=local-seo-audit` | HTTP 200; canonical continua apontando para a raiz; documento local não aparece no HTML do servidor |
| `/pt`, `/en`              | HTTP 404; coerente com a retirada das landings localizadas                                          |
| `/privacidade`, `/sobre`  | HTTP 404; conteúdo institucional correspondente ainda não disponível nessas rotas                   |
| `/pagina-inexistente-seo` | HTTP 404                                                                                            |

Essas observações são do servidor local de desenvolvimento. Não comprovam configuração de CDN, cache, desempenho ou indexação da futura produção.

Referências principais no código:

- `src/app/page.tsx`: conteúdo público, metadata e dados estruturados.
- `src/app/layout.tsx`: idioma, fontes locais, favicon e metadataBase.
- `src/app/robots.ts` e `src/app/sitemap.ts`: descoberta e rastreamento.
- `src/proxy.ts`: redirect 308 de `www` para o host principal, preservando caminho/query.
- `public/llms.txt`: resumo público para sistemas que optem por consumi-lo.
- `src/components/TiptapEditor/kit.ts`: idioma da revisão definido pelo locale.
- `src/components/shared/Analytics.tsx`: componente existente, sem importação/montagem encontrada na aplicação atual.

## O que está bom e deve ser preservado

1. **Foco da página:** o H1 “Corretor ortográfico online grátis” expressa diretamente a tarefa principal. O editor ocupa a posição central da experiência.
2. **Título e descrição:** são relevantes, específicos e usam o novo domínio/produto. O título atual tem 64 caracteres; esse número, isoladamente, não justifica uma mudança. A apresentação final deve ser acompanhada nos resultados após publicação.
3. **Conteúdo disponível sem JavaScript:** explicações, categorias e FAQ estão no HTML inicial. O editor ser carregado no cliente não elimina a informação pública da landing.
4. **Canonicalização:** a home, seus parâmetros locais e o sitemap convergem para a raiz. A ausência visual da barra final no canonical normalizado da raiz não é um problema.
5. **Sitemap proporcional ao produto:** uma única landing pública indexável pede um sitemap simples. Não é necessário criar páginas apenas para aumentar sua quantidade.
6. **FAQ honesta:** informa gratuidade, revisão humana, rascunho local e processamento externo. Não inventa garantias de correção ou privacidade integralmente offline.
7. **Schema coerente:** os dados estruturados refletem o conteúdo visível e não incluem avaliações fictícias.
8. **Português brasileiro consistente na home:** idioma do documento, conteúdo e Open Graph estão alinhados.
9. **Rastreamento permitido no código:** não foram identificados `noindex`, `nosnippet` ou bloqueios específicos de bots na home. Não é preciso listar cada robô individualmente quando a regra geral já permite acesso.

Não há necessidade de adicionar `meta keywords`: o Google declara que não usa essa tag para indexação ou ranking. O trabalho relevante é o alinhamento entre intenção, conteúdo e experiência. [Fonte: metatags suportadas pelo Google](https://developers.google.com/search/docs/crawling-indexing/special-tags).

## Melhorias identificadas

### P1 — Coerência sobre idiomas

Há uma divergência verificável:

- A FAQ diz que a versão atual revisa português brasileiro.
- A home instancia `EditForm` com `locale="pt"`.
- O kit seleciona `pt-BR` pelo locale; `/en` não é uma landing existente.
- `llms.txt`, README e escopo de produto anunciam também inglês e espanhol.

O código possuir mapeamentos para outros idiomas não demonstra que a pessoa consiga selecioná-los na versão pública. Recomenda-se alinhar os textos ao comportamento realmente acessível. Para a landing atual, a descrição mais segura é revisão em português brasileiro, até que o seletor e a revisão nos outros idiomas estejam efetivamente disponíveis e verificados.

Não há razão para adicionar `hreflang` de páginas que não existem.

### P1 — Conteúdo que demonstre a utilidade do editor

A página explica a proposta, mas demonstra pouco o resultado. Recomenda-se complementar a própria landing, preservando sua simplicidade, com:

- Uma seção “Como corrigir seu texto online”, com etapas de colar/digitar, analisar, revisar as sugestões e copiar/exportar.
- Dois ou três exemplos originais e revisados de ortografia, concordância e pontuação, acompanhados de explicações curtas.
- Uma explicação prática da diferença entre correção ortográfica, gramatical e de pontuação.
- Casos de uso como e-mails, trabalhos escolares e textos profissionais, sem prometer nota de redação ou avaliação pedagógica.
- Limitações concretas: sugestões podem depender do contexto e do serviço; o usuário deve avaliar cada alteração.

Os exemplos precisam ser conferidos no editor antes de serem apresentados como demonstrações do produto. Não copiar exemplos de concorrentes nem prometer que toda regra será detectada.

Essa proposta é uma decisão editorial baseada nas lacunas encontradas. Não existe uma quantidade mínima de palavras ou uma densidade de keywords a atingir. O Google orienta produzir conteúdo útil, confiável e com valor próprio. [Fonte: conteúdo útil](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

### P1 — Identificação do responsável e transparência

A landing tem apenas a marca no rodapé. Não foram encontrados nela identificação do responsável, contato público ou links para explicações institucionais/privacidade. As rotas locais `/sobre` e `/privacidade` retornam 404.

Recomenda-se disponibilizar informações reais sobre quem mantém a ferramenta, como contatar o responsável, como o LanguageTool é utilizado e o que acontece com textos e rascunhos. Pode começar com seções estáticas acessíveis no rodapé; páginas próprias são uma opção de organização, sem exigir login ou banco.

Isso melhora a capacidade de uma pessoa avaliar a ferramenta e atribuir suas informações a uma fonte identificável. Não representa um fator isolado com pontuação garantida. Não criar credenciais, especialistas, depoimentos ou números de usuários fictícios.

### P1 — Preparar a medição do novo domínio

Não foi encontrado acesso conectado a Search Console ou Bing Webmaster Tools nesta sessão. A ausência de uma metatag de verificação no repositório não prova que a propriedade não esteja verificada: isso também pode ser feito por DNS.

O componente `Analytics.tsx` existe, mas não foi encontrada sua montagem na aplicação atual. Portanto, sua simples presença no projeto não comprova coleta de visitas. Antes de habilitá-lo, confirmar a propriedade dos identificadores configurados e a compatibilidade com a CSP e com a política de privacidade do novo site.

Search Console e Bing Webmaster Tools podem medir descoberta e busca orgânica sem adicionar banco de dados à aplicação. Analytics de uso é complementar. Eventos de produto devem registrar apenas ações e contagens necessárias; não enviar o texto, o título do rascunho ou identificadores locais como conteúdo de analytics.

### P2 — Dados estruturados e identidade

Manter `WebSite`. `FAQPage` corresponde ao conteúdo, mas não deve ser apresentado como uma forma de ganhar espaço de FAQ no Google: a documentação oficial informa que esse resultado enriquecido deixou de aparecer em 07/05/2026. A FAQ continua útil para leitores. [Fonte: atualizações oficiais do Google](https://developers.google.com/search/updates).

Após definir publicamente o responsável, avaliar um nó `Organization` ou `Person`, com dados verdadeiros, URL e relação com o site. `WebApplication` pode descrever o editor se houver uma necessidade concreta de modelagem; não é pré-requisito de visibilidade em IA nem garantia de rich result. Evitar ampliar o schema apenas para satisfazer ferramentas de auditoria.

### P2 — Compartilhamento

Open Graph já contém título, descrição, URL, nome e locale. O HTML também recebe metadados básicos de Twitter. Falta uma imagem de compartilhamento definida. Uma imagem própria com dimensões explícitas e texto alternativo melhora a apresentação de links compartilhados, sem constituir uma garantia de ranking.

### P2 — Desempenho a validar no build de produção

O projeto já usa fontes locais e carrega o editor separadamente. Isso é uma base favorável, mas não comprova Core Web Vitals aprovados. A hidratação e o carregamento do Tiptap continuam sendo pontos relevantes a medir, sobretudo no celular.

Antes do lançamento, medir um build de produção no desktop e mobile; depois, acompanhar dados reais de campo. Usar LCP, INP e CLS como medidas principais, além da experiência de digitação. A nota 100 do Lighthouse não é uma previsão de ranking, e notas anteriores do EditorDeTexto não são evidência deste novo domínio. [Fonte: Core Web Vitals e Pesquisa Google](https://developers.google.com/search/docs/appearance/core-web-vitals).

## Mapeamento de palavras-chave

Este é um mapa editorial inicial, baseado no produto e no conteúdo existente. Não é pesquisa de volume ou dificuldade com ferramentas pagas. “Cobertura parcial” significa oportunidade de esclarecer uma intenção, não obrigação de repetir a expressão exata.

| Grupo de consultas                                             | Intenção                                 | Evidência atual                                                                                                     | Direcionamento                                                  |
| -------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| corretor ortográfico online                                    | Usar a ferramenta                        | Forte: título, H1, explicação e FAQ                                                                                 | Palavra-chave principal da `/`                                  |
| corretor ortográfico online grátis / gratuito                  | Encontrar ferramenta gratuita            | Forte: título, H1 e FAQ                                                                                             | Mesma `/`; manter gratuidade verdadeira                         |
| corretor ortografico online, sem acento                        | Mesma tarefa, grafia de busca            | Mesma intenção do termo principal                                                                                   | Não criar página ou texto artificial sem acentos                |
| corrigir texto online / correção de texto online               | Executar uma correção                    | Parcial: proposta corresponde; “corrigir texto online” aparece no `llms.txt`, não como seção explicativa da landing | Atender no passo a passo da `/`                                 |
| corretor de texto online                                       | Ferramenta de revisão                    | Parcial: mesma funcionalidade, expressão não é o foco do texto público                                              | Usar como variação natural quando útil                          |
| corretor gramatical online / correção gramatical               | Revisar gramática                        | Parcial: há categoria e descrição de gramática                                                                      | Explicar com exemplo de concordância na `/`                     |
| corretor de pontuação / corrigir vírgulas                      | Revisar pontuação                        | Parcial: categoria “Estilo e pontuação”, sem demonstração                                                           | Explicar sugestões e limites com exemplos verificados           |
| corretor de português / corrigir texto em português            | Encontrar revisão no idioma              | Boa cobertura semântica no título e texto; variante brasileira está na FAQ                                          | Reforçar português brasileiro de forma clara                    |
| corretor online sem cadastro                                   | Usar sem criar conta                     | Benefício aparece na FAQ, pouco destacado no início                                                                 | Acrescentar indicação curta perto do editor                     |
| revisão de e-mail / texto profissional / trabalho escolar      | Aplicação prática                        | Pouca explicação pública por caso de uso                                                                            | Atender com casos de uso curtos na mesma landing                |
| como usar um corretor ortográfico                              | Aprender o processo                      | FAQ explica o básico                                                                                                | Expandir em etapas claras                                       |
| CorretorOrtografico.online                                     | Encontrar a marca                        | Marca no header, footer e WebSite                                                                                   | Manter nome e URL consistentes                                  |
| corretor português de Portugal / inglês / espanhol             | Revisão em variantes/idiomas específicos | Não confirmada como opção acessível na v1                                                                           | Não direcionar essas consultas antes de validar suporte público |
| corretor de redação ENEM / nota de redação / reescrever com IA | Avaliação pedagógica ou geração de texto | Fora do produto atual                                                                                               | Não prometer esses recursos                                     |

Todos os termos transacionais equivalentes devem convergir para a home nesta v1. Páginas futuras só fazem sentido para necessidades distintas, com conteúdo próprio. Criar várias landings quase iguais para sinônimos fragmentaria uma proposta que hoje cabe em uma página.

Como referências de mercado, foram consultadas as páginas oficiais do [LanguageTool](https://languagetool.org/pt) e do [QuillBot](https://quillbot.com/pt/corretor-ortografico). Elas apresentam recursos, explicações e demonstrações além da ferramenta. A oportunidade do projeto é explicar sua experiência específica: revisão em português brasileiro, uso sem conta, formatação e rascunho local. Essas consultas não estabelecem posições comparáveis no Google ou Bing.

## Preparação para citações em respostas de IA

O Google informa que a participação nos recursos de IA depende dos fundamentos de SEO e da elegibilidade da página indexada para exibir snippets; não exige um schema especial. Seu guia também esclarece que `llms.txt` não ajuda nem prejudica o ranking no Google, pois não é usado com essa finalidade. Não há tamanho ideal de página ou formato obrigatório de pequenos blocos. [Fontes: requisitos para recursos de IA](https://developers.google.com/search/docs/appearance/ai-features) e [guia de otimização para IA](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

Para este produto, o trabalho concreto é:

1. Publicar uma página acessível e rastreável com o conteúdo público já entregue no HTML.
2. Corrigir a divergência sobre idiomas em todas as descrições.
3. Acrescentar exemplos próprios, instruções úteis e explicações verificáveis.
4. Identificar quem mantém o serviço e fornecer contato.
5. Manter visíveis as limitações e o processamento pelo LanguageTool/PDF.
6. Verificar que a futura CDN não apresente bloqueios ou desafios aos crawlers legítimos.

O `robots.txt` local permite todos os bots. Para ChatGPT Search, a documentação identifica `OAI-SearchBot` como crawler de busca; `GPTBot` tem finalidade de treinamento e sua permissão é independente. Permitir treinamento não é condição necessária para aparecer na busca do ChatGPT. [Fonte: crawlers da OpenAI](https://developers.openai.com/api/docs/bots).

No Bing, a recomendação é combinar conteúdo claro e acessível com descoberta e atualização consistentes. IndexNow pode comunicar mudanças aos mecanismos participantes após o lançamento; não garante inclusão, posição ou citação e não substitui a medição no Google. [Fontes: diretrizes do Bing](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a?region=france) e [envio de URLs](https://www.bing.com/webmasters/help/URL-Submission-62f2860b).

Não foi demonstrado nesta auditoria que o site seja citado por ChatGPT, Google ou Copilot. Preparação técnica, conteúdo citado e visitas são medidas diferentes.

## Google e Bing: o que foi possível verificar

| Verificação pública em 24/10/2026                                     | Resultado                                                                                | Interpretação                                                                                    |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Google: `site:corretorortografico.online`, idioma pt-BR e país Brasil | Nenhum documento correspondente exibido                                                  | Observação pontual; não é contagem completa do índice nem auditoria da propriedade               |
| Bing: mesma consulta de domínio                                       | Resultados apresentados não identificaram o domínio e incluíram conteúdo não relacionado | Consulta inconclusiva; não permite afirmar ausência total do índice                              |
| Busca web pelo domínio exato entre aspas                              | Sem resultados na consulta realizada                                                     | Não há evidência pública de presença nessa amostra                                               |
| HTTPS público                                                         | Navegador exibiu Cloudflare 525 em 24/10/2026 às 07:53 UTC                               | Pendência de infraestrutura antes do lançamento, coerente com o site ainda não estar em produção |
| Search Console / Bing Webmaster Tools da propriedade                  | Sem acesso nesta sessão                                                                  | Posições, impressões, cliques e citações não auditados                                           |

O erro 525 representa falha de negociação TLS entre Cloudflare e a origem. Conferir domínio na hospedagem, destino DNS, certificado e configuração TLS/porta/SNI antes da publicação. A causa específica depende da infraestrutura. Não foi alterado nenhum desses serviços. [Fonte: Cloudflare 525](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-5xx-errors/error-525/).

Como o lançamento ainda não ocorreu, a conclusão sobre ranking é **não mensurado**. Não é correto dizer que as palavras-chave já estão bem ranqueadas, nem atribuir a falta de resultados a uma penalização.

## Plano de lançamento e acompanhamento

| Ordem | Ação                                              | Critério de conclusão                                                                                                           |
| ----- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Alinhar idiomas, benefícios e limitações          | Landing, README e `llms.txt` descrevem o que a pessoa consegue usar                                                             |
| 2     | Complementar instruções, exemplos e identificação | Conteúdo público útil na landing, responsável identificável e informação de privacidade acessível                               |
| 3     | Preparar propriedades Google/Bing                 | Domínio verificado nos painéis, preferencialmente com configuração de domínio/DNS; sem necessidade de banco                     |
| 4     | Validar o build de produção                       | HTML público, metadados, canonical, status 404 e funcionamento do editor conferidos; métricas desktop/mobile registradas        |
| 5     | Publicar com domínio/TLS corretos                 | `/`, `/robots.txt` e `/sitemap.xml` acessíveis; HTTP e `www` convergem para HTTPS canônico; sem desafios indevidos aos crawlers |
| 6     | Enviar sitemap e inspecionar URL                  | Google e Bing conseguem buscar a página; acompanhar canonical escolhida e motivo de eventual exclusão                           |
| 7     | Considerar IndexNow                               | Avisos apenas quando URLs públicas forem criadas, alteradas ou removidas; não enviar a cada digitação                           |
| 8     | Registrar a primeira referência de desempenho     | Impressões, cliques, CTR e posição média por consulta/página, país Brasil e dispositivo, conforme dados disponíveis             |
| 9     | Acompanhar busca com IA                           | Relatório de IA do Google e AI Performance do Bing; registrar páginas e temas citados                                           |

Para busca tradicional, usar Search Console e Bing Webmaster Tools para acompanhar consultas e páginas. No Google, posição média é uma medida agregada; uma busca manual isolada não representa a posição de todos os usuários. [Fonte: métricas do Search Console](https://support.google.com/webmasters/answer/7042828?hl=en).

Para IA, o Google anunciou relatórios dedicados de desempenho em IA generativa em junho de 2026, com disponibilização global informada em agosto. Consultar esses relatórios na propriedade publicada. No Bing, AI Performance mostra citações, páginas e grounding queries; citações não equivalem a cliques ou ranking. [Fontes: relatórios do Google](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) e [AI Performance do Bing](https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c).

Revisar os primeiros dados após haver volume suficiente e comparar períodos equivalentes, separando celular e desktop. Usar o mapa de consultas para decidir quais explicações melhorar, sem criar páginas ou repetir palavras por obrigação. Não há prazo ou posição garantidos para indexação e ranking.

## Registro da entrega

Esta entrega contém pesquisa, inspeção do código e respostas HTTP, comparação com orientações oficiais e este relatório. Nenhum código da aplicação, DNS, conta de buscador ou configuração Cloudflare foi alterado. Não houve deploy nem submissão de URLs. Não foram executadas suítes de teste ou nova medição Lighthouse, pois não houve mudança de implementação.

A documentação histórica em `docs/architecture/SEO_SEMRUSH_ROLLOUT.md` e `MOBILE_PERFORMANCE_ROLLOUT.md` contém evidências do projeto original EditorDeTexto. Essas evidências não foram tratadas como resultados do CorretorOrtografico.online.

## Aplicação posterior das recomendações

Em 24/10/2026, o responsável autorizou “aplique esses ajustes” e forneceu o e-mail público `contato@corretorortografico.online`. A implementação e suas verificações estão registradas em [PRE_LAUNCH_SEO_ROLLOUT.md](architecture/PRE_LAUNCH_SEO_ROLLOUT.md), conforme SPEC-013. Os achados acima preservam o retrato anterior à implementação; publicação, verificação das propriedades e ranking continuam dependendo do lançamento.
