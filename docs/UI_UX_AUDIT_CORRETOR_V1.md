# Auditoria de UI/UX — CorretorOrtografico.online v1

**Data:** 24/10/2026  
**Página analisada:** `http://localhost:3000/`  
**Escopo:** landing page e fluxo principal do editor com LanguageTool.

## Como foi feita a análise

A página foi aberta em navegador desktop, em uma janela de aproximadamente 1265 × 768 px. Verifiquei a hierarquia da landing page, o editor renderizado, a barra de ferramentas, o painel de revisão e os estados expostos na árvore de acessibilidade. Também revisei no código as regras de responsividade e a configuração da extensão LanguageTool.

O texto de demonstração já presente no navegador foi preservado. Não foi feita uma análise de texto inserido pelo usuário nem uma avaliação visual em aparelho móvel; as observações sobre telas estreitas vêm da implementação responsiva.

## O que está bom e deve ser mantido

- **A intenção da página está clara:** o título principal usa “Corretor ortográfico online grátis” e a descrição associa a revisão ao LanguageTool.
- **O editor é o conteúdo principal:** ele aparece logo depois do título e da explicação, antes dos blocos longos de SEO. O componente carrega e apresenta conteúdo editável, controles de formatação e painel de revisão.
- **O painel do corretor tem uma estrutura útil:** as abas “Resumo” e “Dados detalhados” separam a visão geral das ocorrências individuais. As categorias Ortografia, Gramática e Estilo/Pontuação ajudam a entender os tipos de sugestão.
- **Há retorno sobre o documento:** contagem de palavras e caracteres, tempo de leitura, estado das sugestões e indicação de salvamento local aparecem próximos ao editor.
- **A privacidade do rascunho é explicada perto da ferramenta:** a página informa que o rascunho fica no navegador e que o texto é enviado ao LanguageTool durante a análise. Essa transparência deve continuar visível.
- **Os controles têm nomes acessíveis:** título, botões, abas, alternâncias e contadores aparecem identificados na árvore de acessibilidade. A barra também oferece áreas separadas para formatação, inserção e ferramentas.
- **A composição desktop é equilibrada:** o editor ocupa a maior parte da largura e mantém o painel de sugestões ao lado, sem competir com o conteúdo SEO abaixo.

## Ajustes recomendados

### Prioridade alta

#### 1. Tornar a revisão ortográfica a ação mais óbvia

**Observação:** o corretor do LanguageTool pode ser ligado ou desligado dentro de **Ferramentas avançadas → Ferramentas**. A ação principal da landing page é escrever ou colar um texto para revisar, mas esse controle fica dentro de um menu secundário.

**Ajuste:** deixar o estado do LanguageTool visível junto ao editor, com um rótulo explícito, por exemplo **“LanguageTool ativo”**, e um controle acessível para ligar/desligar. Manter opções menos usadas dentro de Ferramentas.

**Motivo:** a pessoa deve saber rapidamente se o texto está sendo revisado e como controlar a revisão.

#### 2. Corrigir a descrição “corretor com IA”

**Observação:** visualmente o controle aparece como “Corretor ortográfico”, mas o tooltip acessível e as mensagens de ativação/desativação dizem **“Ativar/Desativar corretor com IA”**. A versão não oferece a funcionalidade de IA descrita no tooltip.

**Ajuste:** trocar os textos para **“Ativar/Desativar corretor do LanguageTool”** ou **“Ativar/Desativar revisão ortográfica”** em todas as localidades disponíveis.

**Motivo:** elimina uma promessa incorreta e evita confusão sobre que serviço analisa o conteúdo.

#### 3. Disponibilizar as sugestões em telas estreitas

**Observação:** abaixo de 1024 px, o botão do painel de erros não é renderizado e o estado inicial fecha a barra lateral. Assim, pessoas em tablets e celulares não têm o mesmo acesso ao resumo e às sugestões detalhadas do LanguageTool que existe no desktop.

**Ajuste:** oferecer um acionador visível para abrir os resultados em um painel móvel — por exemplo, uma gaveta ou folha inferior com contagem de erros e botão de fechar. Garantir que o painel possa ser aberto sem cobrir permanentemente o texto em edição.

**Motivo:** consultar e aplicar sugestões é parte central do produto, então precisa funcionar também no fluxo móvel.

#### 4. Alinhar a promessa de idiomas com a interface

**Observação:** o FAQ diz que a pessoa pode selecionar português, inglês ou espanhol. Na interface inspecionada não encontrei seletor de idioma, e a configuração do editor define `pt-BR` como idioma da análise.

**Ajuste:** adicionar um seletor visível de idioma e conectar a seleção à análise do LanguageTool; ou, enquanto isso não existir, ajustar o FAQ e a descrição para informar que a revisão está configurada para português.

**Motivo:** a interface e o conteúdo da página precisam descrever o mesmo comportamento.

### Prioridade média

#### 5. Facilitar o primeiro uso e diferenciar texto de exemplo

**Observação:** o editor abriu com “Anotações de demonstração” e um texto de exemplo sobre escrever e organizar anotações. Não fica evidente se esse conteúdo é um rascunho real, uma demonstração ou apenas um texto para substituir.

**Ajuste:** escolher uma destas opções para novos visitantes:

- começar com o editor vazio e um placeholder direto, como **“Cole ou digite seu texto para revisar…”**; ou
- manter o exemplo, identificando-o como **“Texto de demonstração”** e oferecendo uma ação clara para substituí-lo.

Também vale avaliar se o campo de título precisa ter o mesmo destaque do texto, já que nomear o documento é secundário para quem quer corrigir um texto rapidamente.

#### 6. Melhorar o estado sem erros e os estados de análise

**Observação:** no texto de demonstração, o painel mostrava zero ocorrências e o estado “Sugestões prontas”. A contagem é útil, mas o estado não explica se o texto foi analisado e não contém erros, se ainda está aguardando análise ou se houve falha.

**Ajuste:** explicitar os estados com mensagens distintas: **“Analisando texto…”**, **“Nenhum problema encontrado”**, **“N sugestões para revisar”** e uma mensagem de falha com orientação para tentar novamente. O painel já possui texto de estado vazio; priorizar esse retorno também na visão Resumo.

#### 7. Aproximar o editor da primeira dobra

**Observação:** em 768 px de altura, o cabeçalho, o espaçamento superior do hero e o título ocupam uma parte considerável da primeira tela. O editor começa abaixo deles e os controles aparecem perto do meio da janela.

**Ajuste:** reduzir um pouco o espaçamento vertical do hero e adicionar um botão **“Revisar meu texto”** que leve diretamente ao editor. Manter o H1 e a explicação para preservar a clareza e o conteúdo SEO.

#### 8. Tornar o painel de resultados mais acionável

**Observação:** o resumo mostra as categorias e indicadores; a aplicação das sugestões ocorre nos detalhes ou no próprio texto. A ação “Corrigir todos” aplica automaticamente a primeira sugestão de cada erro, uma decisão que pode alterar trechos sem revisão individual.

**Ajuste:** manter a revisão individual como ação principal e explicar claramente o efeito de “Corrigir todos”. Se possível, pedir confirmação contextual ou indicar quantas sugestões serão aplicadas antes da ação em lote.

**Motivo:** ajuda a pessoa a manter controle sobre mudanças de gramática e estilo que podem depender do sentido da frase.

## Ordem sugerida

1. Corrigir o tooltip que chama o LanguageTool de IA.
2. Tornar visíveis o estado e o acionador do corretor.
3. Garantir acesso ao painel de sugestões em telas abaixo de 1024 px.
4. Resolver a divergência sobre seleção de idiomas.
5. Definir se a experiência inicial começa vazia ou com exemplo identificado.
6. Melhorar mensagens de análise/estado vazio e a ação “Corrigir todos”.
7. Ajustar a primeira dobra e adicionar o atalho para o editor.

## Resumo

A base visual desktop está organizada: o editor carrega, o LanguageTool tem resumo e detalhes, e as informações de contagem e salvamento ajudam a orientar a pessoa. Os ajustes prioritários são de **descoberta e confiança**: mostrar melhor que a revisão está ativa, corrigir o rótulo incorreto de IA, disponibilizar os resultados em telas estreitas e alinhar a promessa de idiomas com a interface atual.
