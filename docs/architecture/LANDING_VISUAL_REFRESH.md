# Refinamento visual da landing — 24/10/2026

Solicitação: melhorar a apresentação da landing preservando integralmente o editor e sua barra lateral, acesso rápido à ferramenta, conteúdo de SEO e desempenho. Refatoração cosmética abrangida pela exceção de SDD para mudanças sem comportamento de negócio.

## Implementação

- Cabeçalho com marca e navegação, apresentação compacta e benefícios legíveis.
- Ilustração editorial em HTML/CSS abaixo do editor, sem download de imagem.
- Passo a passo com contraste, categorias de revisão, exemplos de antes/depois e FAQ com link de retorno ao editor.
- Estilos encapsulados em CSS Module, aplicados somente às seções de apoio. Nenhuma alteração nos componentes, estilos, carregamento ou markup do bloco `#editor`.
- Metadata, canonical, H1 textual, cinco FAQs e JSON-LD preservados. Conteúdo indexável continua em Server Component.
- Sem novas dependências, fontes, requisições de imagem, animações ou componentes client. CSS adicional: aproximadamente 2,2 KB gzip antes da minificação de produção.

## Verificação

- Build de produção e ESLint concluídos.
- Comparação de código confirmou bloco do editor, metadata, lista de FAQ e schemas inalterados.
- HTML gerado: um H1, canonical do domínio e cinco perguntas no FAQPage.
- Inspeção visual no Chrome em desktop e viewport de 400 px: editor montado, seções responsivas, sem overflow horizontal no mobile (scrollWidth = viewport = 400).
- Cypress existente: no build local, 1/3 passou; em desenvolvimento, 2/3 passaram. Falhas registradas como hidratação React #418 no Script beforeInteractive de analytics do RootLayout, arquivo não alterado nesta entrega. Não foi suprimida a exceção ou alterado o editor para contornar o teste. Logs locais: /tmp/landing-cypress-mobile.log e /tmp/landing-cypress-dev.log. A execução não comprova aprovação da suíte.
- Lighthouse via DevTools local não concluiu a auditoria. As notas fornecidas pelo usuário são a referência anterior, não uma medição deste layout. Revalidar desktop/mobile após publicação em condições equivalentes.

Nenhum commit, push ou deploy faz parte desta entrega.
