# SPEC-010 — Usabilidade do editor público

## 1. Metadados

- Status: approved
- Data: 2026-10-04
- Revisor: Anderson Leite, autorização explícita “aplique esses ajustes” após a proposta no chat.
- Dependências: SPEC-009, SPEC-005, SPEC-006 e SPEC-003.

## 2. Escopo aprovado

Toolbar desktop com ações principais e grupos Formatar/Inserir/Ferramentas. Mobile com painel categorizado sobre a página, sem expandir a toolbar verticalmente. Reutilizar controles e primitivas Radix existentes. Título com label curto e placeholder de escrita visível. Editor com fonte 16px, entrelinha 1.6 e estados ativos/foco legíveis nos dois temas.

Salvamento automático após pausa de 1.5s, com estados local/pending/saving/saved/error e horário somente após gravação bem-sucedida. Falha bloqueia a saída pelo CTA Zerus e mantém conteúdo em memória. Salvar antes da saída usa o mesmo contrato local, sem transmitir texto. Preservar chaves e documentos existentes; não escrever sobre biblioteca ilegível. Não alterar backend, auth, banco, assinaturas ou metadados/artigo de SEO.

Biblioteca local com trechos de texto, datas localizadas, Abrir sempre visível, prévia segura como texto, renomear preservando conteúdo, exclusão apenas com confirmação já existente e diálogos acessíveis por teclado. Renomear documento ativo atualiza o título do formulário.

Entregar arquivo Word DOCX real com pacote OpenXML e HTML importado pelo Word (altChunk), preservando HTML do editor. Não renomear HTML isolado para .docx. Compatibilidade de altChunk em outros leitores pode variar e deve ser informada. Sem instalação de dependências; manter PDF/TXT/Markdown existentes.

### Refinamento autorizado no chat

Alinhar CTA do header aos idiomas em uma única linha, com label localizado “Começar no Zerus”, removendo a legenda separada. Abrir painel ortográfico por padrão em desktop (>=1024px) quando não houver preferência salva; respeitar fechamento explícito anterior. Mobile continua fechado por padrão. Reuse Assessment: extend-existing no Header e SidebarProvider, sem nova dependência ou componente.

Refinamento autorizado: posicionar o botão existente “IA no Zerus” à direita da linha de formatação no desktop. No mobile permanece no painel Ferramentas, preservando espaço. Reuse Assessment: reuse-existing em AiRewriteButton/ZerusLink; extend-existing em MenuBar/CSS. Destino, proteção de rascunho, tooltip e atribuição existentes preservados.

## 3. Harness Impact Map

- Risco: high, Tiptap e persistência local.
- Entradas: MenuBar, Provider, EditForm, DocumentsDialog, ZerusLink.
- Dados: mesmos local_documents/post, sem migração ou exclusão.
- Externos: mesmos links Zerus; gravação local antes de navegar; nenhum conteúdo em analytics.
- Reuse Assessment: extend-existing em toolbar, provider, diálogo e persistência; reuse-existing em controles/Popover/Dialog/export HTML/i18n. new-implementation para empacotamento DOCX: não há gerador DOCX/ZIP direto instalado nem helper equivalente no repositório; pacote ZIP sem compressão evita instalar biblioteca para cinco partes OpenXML.
- Sensores: TypeScript/lint, build isolado se viável, inspeção claro/escuro desktop/mobile, documento DOCX conferido como ZIP/OpenXML; suíte automatizada somente se solicitada.
- Rollback: reverter arquivos desta spec, mantendo dados locais e mudanças anteriores.

## 4. Arquivos permitidos

- docs/specs/ui-ux/SPEC-010-editor-usability.md e docs/specs/\_INDEX.md
- src/data/acquisition.ts
- src/app/[locale]/\_components/EditForm.tsx e src/app/[locale]/style.scss
- src/components/TiptapEditor/components/MenuBar.tsx, Provider.tsx, StatusBar.tsx, MenuButton.tsx
- src/components/TiptapEditor/components/controls/SaveButton.tsx, DocumentsButton.tsx, ExportDropdown.tsx
- src/components/TiptapEditor/components/ui/Dialog.tsx, Popover.tsx e DropdownMenu.tsx
- src/components/TiptapEditor/styles/editor.scss e styles/components.scss
- src/components/TiptapEditor/kit.ts e hooks/useTiptapEditor.ts
- src/components/shared/DocumentsDialog.tsx, ZerusLink.tsx e Header.tsx
- src/components/providers/SidebarProvider.tsx
- src/lib/local-storage.ts e src/lib/docx-export.ts
- docs/architecture/PUBLIC_EDITOR_ROLLOUT.md

## 5. Contratos e aceite

- Todos os controles anteriores continuam acessíveis, respeitando preferências de visibilidade.
- Popovers não cortados pelo container do editor; foco e Escape funcionam; botões com nome e pelo menos 44px no mobile.
- Autosave confirma apenas o conteúdo escrito; falhas não atualizam snapshot/horário e impedem navegação pelo Zerus.
- Biblioteca não converte JSON em HTML inseguro; renomear não elimina conteúdo/datas de criação.
- Arquivo DOCX usa MIME OpenXML, assinatura ZIP e partes/relacionamentos corretos.
- H1, seo, artigo, perguntas FAQ, canonical e hreflang preservados.
- Nenhuma alteração a package-lock.json preexistente, dependência ou dados remotos.

## 6. Evidências

- TypeScript e lint conferidos; lint sem erros, com avisos existentes no projeto. Build de produção em cópia isolada, sem instalar dependências ou regenerar banco.
- Navegador: desktop claro/escuro e mobile 390×844; painel ancorado na toolbar, submenus sobre o painel, sem overflow horizontal da página. Na largura de 390px, formatação em uma linha com sete alvos de 44×44px.
- Documento sintético: estado pendente seguido de salvo com horário; título, conteúdo e formatação preservados após reload. Renomeação atualiza o editor ativo e mantém o conteúdo; biblioteca mostra trechos, data PT-BR e Abrir sempre visível. Prévia como texto; Escape devolve foco.
- Placeholder verificado no DOM vazio. Identificado e corrigido o descarte de editorProps.placeholder ao atualizar spellcheck/opções; inicialização agora conserva ambas as opções.
- DOCX: helper gerou pacote de 2600 bytes; ZIP/CRC, cinco partes XML/HTML e XMLs conferidos. Download acionado na UI, mas captura do arquivo pelo navegador interrompida; abertura/renderização no Microsoft Word não foi verificada. Leitores sem suporte a altChunk podem ignorar o conteúdo; UI informa compatibilidade.
- Falhas de quota/armazenamento e bloqueio de saída foram revisados no código, sem simulação destrutiva em dados existentes. Nenhum documento preexistente excluído; suíte automatizada não executada.
- Comparação semântica em PT/EN/ES: seo, article, H1, perguntas do FAQ e WebApplication schema iguais a HEAD. Canonical/hreflang não alterados nesta spec.
- Reuse Assessment final: extend-existing nos controles, provider, biblioteca, persistência e primitivas; novo helper DOCX justificado na seção 3. Nenhuma dependência nova; package-lock.json preexistente preservado (11 adições/11 remoções).

### Evidências do refinamento do header e painel

CTA e seletor de idiomas medidos no navegador desktop com top=14px e height=36px para ambos. Label “Começar no Zerus” em uma única linha. Painel ortográfico visível após reload em 1280×900; oculto ao mudar para 390×844. Preferência explícita de fechamento preservada pelo contrato existente. TypeScript e lint dos dois componentes conferidos; nenhum texto de SEO alterado.

Botão IA no Zerus conferido no navegador à direita da segunda linha da toolbar, mantendo o destino com placement editor_ai e proteção local existentes. Lint do MenuBar sem erros.
