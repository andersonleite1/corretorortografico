# Desempenho mobile — entrega de 04/10/2026

## Escopo e impacto
Implementação autorizada pelo usuário, conforme SPEC-012. Melhorias de carregamento e digitação na landing/editor público, preservando conteúdo SEO e desktop. Sem publicação, dependências novas ou remoção de dados/backend legado.

Harness Impact Map: risco alto em Tiptap e persistência; entradas EditForm, Provider, Editor, hook useTiptapEditor, MainContent, layout e CookieConsent. Formatos/chaves post e local_documents preservados. Nenhum endpoint ou transmissão de texto adicional. Reuse Assessment: extend-existing para editor/autosave; reuse-existing para diálogos, CodeMirror, Markdown e aviso de cookies.

## Alterações
- EditForm: gravação do rascunho post após pausa de 1,5 s, com flush na saída, ocultação e desmontagem. Importação/exportação Markdown carregam seus módulos sob demanda; diálogo de problema somente quando aberto.
- Provider: comparação/serialização do autosave fora do caminho de cada tecla; CodeMirror somente no modo HTML; painel de revisão montado quando aberto. Dimensões inline respeitam tela cheia.
- Editor: toolbar/status acompanham o editor; dimensões aplicadas no primeiro render.
- useTiptapEditor: removido foco forçado que ignorava autofocus:false.
- MainContent: biblioteca e configurações montadas ao abrir.
- layout: oito arquivos de fonte mono deixam de ser preloads; mesma fonte e pesos disponíveis. CookieConsent disponibilizado no HTML inicial.
- CookieConsent: mesma mensagem e ações; leitura protegida de localStorage. Política de analytics preservada.

## Relatórios de produção consultados
PageSpeed fornecido pelo usuário, capturado em 04/10/2026: celular 52; desktop 85. Laboratório mobile: LCP 7,1 s, TBT 380 ms, CLS 0,200. Desktop: LCP 1,4 s, TBT 200 ms, CLS 0,030. O relatório associa deslocamento ao container do editor e identifica JavaScript não usado, incluindo autenticação ainda presente na produção.

Dados de campo de 28 dias: mobile LCP 3,3 s, INP 709 ms, CLS 0,28; desktop LCP 3,0 s, INP 250 ms, CLS 0,05. Ambos falham na avaliação de Core Web Vitals. O segundo relatório Lighthouse fornecido, com docId na URL, mostra celular 54, LCP 6,6 s, TBT 390 ms, CLS 0,201.

Fontes: [PageSpeed](https://pagespeed.web.dev/analysis/https-editordetexto-online/zommfowour?form_factor=mobile) e [Lighthouse viewer](https://googlechrome.github.io/lighthouse/viewer/?psiurl=https%3A%2F%2Feditordetexto.online%2F%3FdocId%3Dlocal-k35k5ag7q&strategy=mobile).

## Comparação local de produção
Snapshots isolados: /private/tmp/editordetexto-perf-before e /private/tmp/editordetexto-perf-after. Builds com a versão instalada do Next.js e mesmas dependências.

| Medida | Antes | Depois |
| --- | ---: | ---: |
| JS gzip declarado nos blocos EditForm + TiptapEditor | 417.140 bytes | 288.778 bytes |
| Preloads de fontes no DOM | 14 | 6 |
| First Load JS da rota locale, tabela do build | 124 kB | 124 kB |

A redução de 30,8% refere-se à união dos arquivos JS declarados para esses dois blocos no react-loadable-manifest; não representa o tráfego total da página nem uma medição de velocidade. Os oito arquivos mono retirados do preload somam 173.124 bytes em disco; continuam disponíveis por CSS quando necessários. A retirada prévia do login da landing já existia no snapshot inicial e não é contabilizada como mudança desta entrega.

## Verificações realizadas
- Builds antes/depois concluídos; build final inclui checagem de tipos e lint. Avisos existentes não impedem compilação. TypeScript separado também passou antes do ajuste final de tela cheia; o build final valida esse ajuste.
- git diff --check passou. package-lock.json idêntico ao snapshot inicial, preservando alterações preexistentes.
- Browser mobile e desktop, claro/escuro: sem overflow horizontal nas dimensões verificadas. Em 1280×900, container desktop manteve exatamente x=80,5, y=219,5, largura=1104 e altura=647 antes/depois.
- Digitação, salvamento após pausa, recarga, título, biblioteca, configurações, modo HTML e tela cheia verificados com documento sintético em localhost:3013. Recarga imediata antes do debounce preservou texto e negrito, confirmando flush na saída.
- Após carregar, foco permanece no BODY; editor não solicita teclado automaticamente.
- Title, description, canonical, hreflang, H1, artigo e FAQ iguais antes/depois nas páginas PT e EN inspecionadas.
- Sem suíte de testes adicionada/executada. Scripts graphify:refresh e harness:check não estão disponíveis neste repositório; nenhum arquivo do Zerus foi alterado.

## Limitações e publicação
Ainda não há nota Lighthouse/PSI após os ajustes: o código não foi publicado. Não foi medida melhoria de INP, LCP ou CLS em produção. Importação/exportação de todos os formatos e resultados externos de correção gramatical não receberam validação completa nesta entrega.

Após publicação, repetir PageSpeed no celular e desktop, com a mesma URL e múltiplas execuções; comparar métricas, não apenas a nota. Verificar digitação/persistência em aparelho real. Acompanhar Core Web Vitals de campo, cuja janela de 28 dias levará tempo para refletir a versão nova. Não há garantia de recuperação do tráfego orgânico por estes ajustes.

Rollback: consultar o snapshot inicial e reverter somente as alterações desta entrega; preservar trabalhos anteriores, dependências e documentos locais.
