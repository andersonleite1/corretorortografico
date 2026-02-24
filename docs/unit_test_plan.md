# Plano de Testes Unitários — Editor de Texto

> **Stack de testes:** Vitest · jsdom · @testing-library/react · @testing-library/user-event  
> **Arquivo de configuração:** `vitest.config.ts`  
> **Setup global:** `tests/setup.ts`  
> **Comando:** `npm test`

---

## 1. Mapa de Funcionalidades a Serem Testadas

### 1.1 Barra de Ferramentas (MenuBar)

| Funcionalidade | Componente | Descrição |
|---|---|---|
| Desfazer / Refazer | `UndoButton` / `RedoButton` | Reverte e reaplica alterações no editor |
| Salvar documento | `SaveButton` | Chama `handleSaveDocument`; bloqueia usuário free |
| Negrito, Itálico, Sublinhado | `BoldButton`, `ItalicButton`, `UnderlineButton` | Aplica formatação inline |
| Mais marcações | `MoreMarkPopover` | Tachado, Subscript, Superscript, Código inline |
| Cor do texto / destaque | `TextColorButton`, `TextHighlightButton` | Abre seletor de cor e aplica ao texto selecionado |
| Alinhamento | `AlignPopover` | Esquerda, Centro, Direita, Justificado |
| Listas | `BulletListButton`, `OrderedList` | Listas com marcadores e numeradas |
| Altura de linha | `LineHeightDropdown` | Valores: 1, 1.5, 2, 2.5 |
| Link | `LinkButton` | Insere/edita hyperlinks |
| Tabela | `TableButton` | Insere tabela; abre `TableBuilder` |
| Bloco de código | `CodeBlockButton` | Insere bloco com highlight via Lowlight |
| Inserir | `InsertDropdown` | Itens extras: HR, emoji, etc. |
| Cabeçalho | `HeadingDropdown` | H1–H6 + parágrafo normal |
| Fonte / Tamanho | `FontFamilyDropdown`, `FontSizeDropdown` | Muda família e tamanho da fonte |
| LanguageTool toggle | `LanguageToolToggleButton` | Liga/desliga corretor gramatical |
| LanguageTool sidebar | `LanguageToolSidebarButton` | Abre sidebar lateral direita |
| Exportar | `ExportDropdown` | Exporta como PDF, DOCX ou TXT |
| Pré-visualizar | `PreviewDropdown` | Preview de PDF ou post |
| Meus Documentos | `DocumentsButton` | Abre diálogo de documentos salvos |
| Rascunhos | `DraftsDropdown` | Salvar, carregar e excluir rascunhos |
| Importar PDF | `ImportPdfButton` | Importa PDF e converte em texto |
| Copiar Editor | `CopyEditorButton` | Copia todo o conteúdo para área de transferência |
| Limpar Editor | `ClearEditorButton` | Apaga todo o conteúdo do editor |
| Configurações | `SettingsButton` | Abre `SettingsDialog` |
| Reescrever com IA | `AiRewriteButton` | Popover com seleção de tom; reescreve o texto |

---

### 1.2 Barra de Status (StatusBar)

| Funcionalidade | Descrição |
|---|---|
| Contador de palavras | Exibe contagem reativa de palavras |
| Contador de caracteres | Exibe contagem reativa de caracteres |
| Modo código-fonte | Alterna entre editor rico e `CodeMirrorEditor` |
| Tela cheia | Alterna o modo fullscreen do editor |
| Atalhos de teclado | Abre `ShortcutsDialog` (desktop apenas) |
| Status do LanguageTool | Exibe: "verificando…", "N erros encontrados", "limite atingido" |
| Status de salvamento de rascunho | Exibe indicador: "Salvando…", "Salvo", "Erro ao salvar" |

---

### 1.3 Sidebar Esquerda — Meus Documentos (`SideBar`)

| Funcionalidade | Descrição |
|---|---|
| Carregar lista de documentos | Busca via `GET /api/documents` ao abrir |
| Botão de atualizar | Refaz o fetch dos documentos |
| Abrir documento | Carrega conteúdo no editor via `editor.commands.setContent` |
| Excluir documento | Confirmação em dois passos + `DELETE /api/documents/:id` |
| Estado vazio | Exibe mensagem "Nenhum documento salvo" |
| Estado de carregamento | Exibe spinner enquanto busca |
| Fechar em mobile | Fecha sidebar automaticamente em telas < 768px |

---

### 1.4 Sidebar Direita — LanguageTool (`LanguageToolSidebar`)

| Funcionalidade | Descrição |
|---|---|
| Aba Resumo | Exibe barras de progresso: Ortografia, Gramática, Estilo |
| Aba Dados Detalhados | Lista todos os problemas com sugestões clicáveis |
| Aplicar sugestão individual | `editor.commands.applyLanguageToolSuggestion` |
| Corrigir todos | Aplica primeira sugestão de cada problema (do fim para o início) |
| Estatísticas de texto | Palavras, caracteres, tempo estimado de leitura |
| Estado sem erros | Exibe "Nenhum erro encontrado. Bom trabalho!" |

---

### 1.5 Reescrita com IA (`AiRewriteButton` + `useAiRewrite`)

| Funcionalidade | Descrição |
|---|---|
| Gate de autenticação | Botão desabilitado e com tooltip para usuários não logados |
| Badge Pro | Exibe badge "Pro" para usuários free logados |
| Seleção de tons padrão | Lista tons ativos definidos nas configurações |
| Tons personalizados | Lista tons customizados ativos do usuário |
| Estado sem tons ativos | Mensagem "Nenhum tom selecionado nas configurações" |
| Iniciar reescrita | Chama `POST /api/ai/rewrite` com texto completo e `toneId` |
| Preview em streaming | Exibe texto sendo gerado em tempo real |
| Aceitar sugestão | Substitui conteúdo total do editor pela sugestão |
| Descartar sugestão | Fecha popover e descarta o completion |
| Tratamento de erro — upgrade | Alerta com mensagem e link `/pricing` para usuários free |
| Tratamento de erro — genérico | Exibe mensagem de erro da API |

---

### 1.6 Diálogo de Configurações (`SettingsDialog`)

| Funcionalidade | Descrição |
|---|---|
| Aba "Opções de Tom e Estilo" | Grade de tons padrão com toggle ativo/inativo |
| Criar tom personalizado | Formulário com nome, descrição (máx. 20 chars) e instruções |
| Limite de tons personalizados | Botão oculto quando já existem 5 tons |
| Deletar tom personalizado | Botão de lixeira visível no hover |
| Aba "Barra de Ferramentas" | Checkboxes para ocultar/exibir botões da toolbar |
| Aba "Conf. Gerais" | Toggle: código-fonte, tela cheia, atalhos |
| Corretor do navegador | Toggle para habilitar/desabilitar spellcheck nativo |
| Fechar pelo overlay | Clique fora do modal fecha o diálogo |
| Persistência de configurações | Configurações salvas/carregadas via `EditorSettingsProvider` |

---

### 1.7 Relatório de Problemas (`BugReportDialog`)

| Funcionalidade | Descrição |
|---|---|
| Campo de descrição obrigatório | Mínimo 10 caracteres, máximo 500 |
| Campo de informações adicionais | Opcional, máximo 2000 caracteres; contador exibido |
| Checkbox de notificação | Ao marcar, exibe campo de e-mail |
| Validação de e-mail | Regex: deve conter `@` e domínio válido |
| Envio do formulário | `POST /api/bug-reports` com dados do formulário |
| Tela de sucesso | Confirmação com e-mail informado (se aplicável) |
| Reset ao fechar | Todos os campos são limpos ao fechar o modal |
| Fechar pelo overlay | Clique na área escura fecha e reseta o diálogo |
| Erro de envio | Exibe mensagem de erro retornada pela API |

---

### 1.8 Internacionalização (i18n)

| Funcionalidade | Descrição |
|---|---|
| 3 idiomas suportados | Português (`pt`), Inglês (`en`), Espanhol (`es`) |
| Idioma padrão | `pt` (português) |
| Redirecionamento de locale | Middleware redireciona URL sem locale para o locale correto |
| Cookie de preferência | `NEXT_LOCALE` persistido no cliente |
| Detecção automática | Negotiate pelo header `Accept-Language` no primeiro acesso |
| Troca de idioma | `ThemeSwitcher` / header com links localizados |
| Mensagens do editor | `getEditorMessages(locale)` retorna labels corretos por locale |

---

### 1.9 Atalhos de Teclado

| Atalho | Ação |
|---|---|
| `Ctrl/Cmd + S` | Salvar documento |
| `Ctrl/Cmd + O` | Abrir "Meus Documentos" |
| `Ctrl/Cmd + P` | Exportar (PDF ou DOCX) |
| `F7` | Ligar/Desligar LanguageTool |
| `Shift + F7` | Abrir/Fechar Sidebar do LanguageTool |
| `Ctrl/Cmd + Z` / `Y` | Desfazer / Refazer |
| `Ctrl/Cmd + Shift + S` | Salvar rascunho |

---

### 1.10 Auto-save e Persistência

| Funcionalidade | Descrição |
|---|---|
| Auto-save a cada 30s | Disparado apenas para usuários Pro com `docId` na URL |
| Salvar novo documento | `POST /api/documents` → redireciona URL com `?docId=...` |
| Atualizar documento existente | `POST /api/documents` com `id` existente |
| Notificação de sucesso | `SaveNotification` exibe feedback temporário |
| Bloqueio para usuário free | Toast de erro ao tentar salvar sem plano Pro |

---

## 2. Ações para Implementação dos Testes Unitários

### 2.1 Infraestrutura e Configuração

- [ ] **Criar mocks globais** em `tests/setup.ts`:
  - Mock de `next/navigation` (`useRouter`, `useParams`, `useSearchParams`)
  - Mock de `@clerk/nextjs` (`useAuth`, `auth`)
  - Mock de `fetch` global via `vi.stubGlobal` ou `msw`
  - Mock de `sonner` (`toast.error`, `toast.success`, `toast.info`)
- [ ] **Instalar Mock Service Worker (MSW)** para interceptar requests de API:
  ```bash
  npm install msw --save-dev
  ```
- [ ] **Criar `tests/mocks/handlers.ts`** com handlers MSW para todos os endpoints utilizados nos testes.
- [ ] **Criar helper `tests/utils/render.tsx`** com wrapper de contexto reutilizável que inclua providers necessários.

---

### 2.2 Testes: `BugReportDialog`

**Arquivo:** `tests/BugReportDialog.test.tsx`

- [ ] Renderiza formulário corretamente quando `isOpen=true`
- [ ] Não renderiza nada quando `isOpen=false`
- [ ] Exibe erro quando o campo de descrição está vazio ao submeter
- [ ] Exibe erro quando a descrição tem menos de 10 caracteres
- [ ] Exibe campo de e-mail apenas quando o checkbox de notificação é marcado
- [ ] Exibe erro quando e-mail inválido é fornecido
- [ ] Chama `POST /api/bug-reports` com os dados corretos ao submeter
- [ ] Exibe tela de sucesso após envio bem-sucedido
- [ ] Reseta todos os campos ao fechar o modal
- [ ] Fecha o modal ao clicar no overlay
- [ ] Exibe erro genérico quando a API retorna status de erro

---

### 2.3 Testes: `useAiRewrite`

**Arquivo:** `tests/hooks/useAiRewrite.test.ts`

- [ ] `handleRewrite` chama a API `/api/ai/rewrite` com texto e toneId corretos
- [ ] `handleRewrite` com `scope="selection"` usa somente o texto selecionado
- [ ] `handleRewrite` com `scope="all"` usa o texto completo do editor
- [ ] `handleRewrite` não chama a API quando o texto está vazio
- [ ] `showPreview` muda para `true` após iniciar reescrita
- [ ] `handleAccept` substitui o conteúdo do editor e reseta o preview
- [ ] `handleDiscard` reseta `completion` e `showPreview` sem alterar o editor
- [ ] Tratamento de erro: ao receber JSON com `upgradeUrl`, exibe alerta de upgrade

---

### 2.4 Testes: `SideBar` (Meus Documentos)

**Arquivo:** `tests/SideBar.test.tsx`

- [ ] Não renderiza nada quando `isOpen=false`
- [ ] Chama `GET /api/documents` ao abrir pela primeira vez
- [ ] Exibe spinner durante o carregamento
- [ ] Exibe lista de títulos de documentos após retorno da API
- [ ] Exibe "Nenhum documento salvo" quando a lista está vazia
- [ ] Carrega documento no editor ao clicar no item da lista
- [ ] Exibe botões de confirmar/cancelar ao clicar em excluir
- [ ] Chama `DELETE /api/documents/:id` ao confirmar exclusão
- [ ] Remove documento da lista após exclusão bem-sucedida
- [ ] Botão de atualizar refaz o fetch

---

### 2.5 Testes: `LanguageToolSidebar`

**Arquivo:** `tests/LanguageToolSidebar.test.tsx`

- [ ] Não renderiza nada quando `isOpen=false`
- [ ] Renderiza aba "Resumo" por padrão
- [ ] Exibe contagens corretas de Ortografia, Gramática e Estilo
- [ ] Exibe estatísticas de palavras, caracteres e tempo de leitura
- [ ] Alterna para aba "Dados Detalhados" ao clicar
- [ ] Exibe "Nenhum erro encontrado" quando não há issues
- [ ] Renderiza card de issue com sugestões clicáveis
- [ ] `handleApplySuggestion` aplica substituição correta no editor
- [ ] `handleFixAll` corrige todos os problemas com sugestões disponíveis
- [ ] `handleFixAll` é desabilitado quando não há issues

---

### 2.6 Testes: `SettingsDialog`

**Arquivo:** `tests/SettingsDialog.test.tsx`

- [ ] Não renderiza nada quando `isSettingsDialogOpen=false`
- [ ] Renderiza aba "Opções de Tom e Estilo" por padrão
- [ ] Toggle de tom padrão chama `toggleToneActivation(toneId)`
- [ ] Botão "Novo Tom" abre modal de criação de tom
- [ ] Formulário de criação de tom valida campos obrigatórios
- [ ] Criação de tom chama `addCustomTone` com dados corretos
- [ ] Botão "Novo Tom" oculto quando já existem 5 tons personalizados
- [ ] Deletar tom personalizado chama `deleteCustomTone`
- [ ] Aba "Barra de Ferramentas" exibe lista de checkboxes
- [ ] Toggle de botão chama `toggleButtonVisibility(id)`
- [ ] Aba "Conf. Gerais" exibe toggles de rodapé e spellcheck
- [ ] Toggle `browserSpellcheck` reflete mudança no atributo `spellcheck` do editor
- [ ] Fechar pelo overlay chama `setIsSettingsDialogOpen(false)`

---

### 2.7 Testes: i18n — Middleware e Mensagens

**Arquivo:** `tests/i18n.test.ts`

- [ ] Redireciona `/` para `/en` quando `Accept-Language: en`
- [ ] Reescreve (sem redirecionar) quando locale é o padrão `pt`
- [ ] Mantém locale salvo no cookie `NEXT_LOCALE` em visitas subsequentes
- [ ] `getEditorMessages("pt")` retorna strings em português
- [ ] `getEditorMessages("en")` retorna strings em inglês
- [ ] `getEditorMessages("es")` retorna strings em espanhol
- [ ] Todos os campos de mensagens existem para cada locale (sem keys faltando)

---

### 2.8 Testes: `StatusBar`

**Arquivo:** `tests/StatusBar.test.tsx`

- [ ] Exibe contagem correta de palavras (reativa ao conteúdo)
- [ ] Exibe contagem correta de caracteres
- [ ] Botão de tela cheia chama `toggleFullScreen`
- [ ] Botão de modo fonte chama `toggleSourceMode`
- [ ] Botão de atalhos abre `ShortcutsDialog`
- [ ] Botão de atalhos não exibido em mobile
- [ ] Label do LanguageTool exibe "verificando…" quando `status="checking"`
- [ ] Label do LanguageTool exibe "N erros" quando `status="ready"`
- [ ] Label do LanguageTool não exibido quando `enabled=false`
- [ ] Status de rascunho "Salvando…" com ponto azul animado
- [ ] Status de rascunho "Salvo" com ponto verde
- [ ] Não exibe status de rascunho quando `savingStatus="idle"`

---

### 2.9 Testes de API (integração leve)

**Arquivos:** `tests/api/*.test.ts`

- [ ] `POST /api/bug-reports` — persiste dados válidos e retorna `201`
- [ ] `POST /api/bug-reports` — retorna `400` quando descrição está faltando
- [ ] `GET /api/documents` — retorna lista de documentos do usuário autenticado
- [ ] `POST /api/documents` — cria novo documento e retorna `id`
- [ ] `DELETE /api/documents/:id` — exclui documento e retorna `200`
- [ ] `POST /api/ai/rewrite` — retorna `401` para usuário não autenticado

---

## 3. Prioridade de Implementação

| Prioridade | Módulo | Justificativa |
|---|---|---|
| 🔴 Alta | `BugReportDialog` | Lógica de validação e submit complexa; risco de regressão |
| 🔴 Alta | `useAiRewrite` | Lógica de negócio crítica; integração com API de IA |
| 🔴 Alta | `SideBar` | CRUD de documentos; erros aqui perdem dados do usuário |
| 🟡 Média | `LanguageToolSidebar` | Lógica de `fixAll` suscetível a bugs de posição |
| 🟡 Média | `SettingsDialog` | Muitos estados; risco de regressão em configurações |
| 🟡 Média | i18n | Garantir ausência de keys faltando em todos os locales |
| 🟢 Baixa | `StatusBar` | Majoritariamente display; baixo risco |
| 🟢 Baixa | API routes | Coberto parcialmente por testes de integração existentes |

---

## 4. Estrutura de Arquivos Sugerida

```
tests/
├── setup.ts                          # Setup global já existente
├── mocks/
│   ├── handlers.ts                   # Handlers MSW para todas as APIs
│   ├── server.ts                     # Instância do MSW server
│   └── editor.ts                     # Mock do objeto Editor do Tiptap
├── utils/
│   └── render.tsx                    # Helper de render com providers
├── hooks/
│   └── useAiRewrite.test.ts
├── api/
│   ├── bug-reports.test.ts
│   └── documents.test.ts
├── BugReportDialog.test.tsx
├── SideBar.test.tsx
├── LanguageToolSidebar.test.tsx
├── SettingsDialog.test.tsx
├── StatusBar.test.tsx
├── i18n.test.ts
└── PostContent.test.tsx              # já existente
```
