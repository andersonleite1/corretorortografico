# Relatório de Textos Estáticos (Não Internacionalizados)

Durante a verificação da aplicação `editordetexto`, foram identificados diversos trechos com textos estáticos em hard-code (não internacionalizados) em múltiplos componentes e páginas React. Para que a aplicação esteja 100% internacionalizada, é necessário transferir as strings abaixo para os arquivos de locale da pasta `src/data/` (ou dicionários do seu i18n) e referenciá-las nos componentes.

Abaixo está o mapeamento detalhado de todos os textos não internacionalizados encontrados:

## 1. Textos Renderizados diretamente (Conteúdo em tags HTML/JSX)

- `src/components/MediaLibrary/MediaLibrary.tsx`
  - Linha 117: `<h2>Assets</h2>`
- `src/components/MediaLibrary/MediaGallery.tsx`
  - Linha 69: `<span>Enviando...</span>`
- `src/components/TiptapEditor/components/menus/LanguageToolMenu.tsx`
  - Linha 227: `<span>Corrigir</span>`
- `src/components/TiptapEditor/components/LanguageToolSidebar.tsx`
  - Linha 117: `Categorias` (dentro de um div)
  - Linhas 175-187: `<span>Caracteres</span>`, `<span>Palavras</span>`, `<span>Tempo de Leitura</span>`, `<span>Status</span>`
  - Linha 188: `<span>Sugestões prontas</span>`
  - Linha 250: `<span>Corrija tudo de uma vez</span>`
- `src/components/TiptapEditor/components/SideBar.tsx`
  - Linha 94: `<p>Nenhum documento salvo.</p>`
- `src/components/Drafts/DraftComparison.tsx`
  - Linha 85: `<span>Texto Adicionado</span>`
  - Linha 89: `<span>Texto Removido</span>`
  - Linha 93: `<span>Sem Alterações</span>`
- `src/components/shared/Header.tsx`
  - Linha 130: `<span>Dashboard</span>`
- `src/components/shared/PostToc.tsx`
  - Linha 36: `<h2>On this page</h2>`
- `src/components/Footer/footer.tsx`
  - Linha 158: `<title>Pix</title>` (pode ser irrelevante, mas está hardcoded)
- `src/components/landing/LandingPricing.tsx`
  - Linha 97: `<span>Grátis</span>`
- `src/app/[locale]/settings/SettingsContent.tsx`
  - Linha 61: `<h2>Seu Perfil</h2>`
- `src/app/[locale]/settings/page.tsx`
  - Linha 23: `<h1>Configurações</h1>`
- `src/app/[locale]/contact/ContactPageContent.tsx`
  - Linha 101: `<p>Email</p>`

## 2. Textos em Atributos (Props, aria-label, title, alt, placeholder)

- `src/components/MediaLibrary/MediaLibrary.tsx`
  - Linha 125: `aria-label="Loading images"`
- `src/components/TiptapEditor/components/LanguageToolSidebar.tsx`
  - Linha 89: `title="Fechar"`
- `src/components/TiptapEditor/components/controls/DraftsDropdown.tsx`
  - Linha 109: `title="Comparar Versão"`
- `src/components/TiptapEditor/components/SideBar.tsx`
  - Linha 81: `title="Atualizar"`
- `src/components/auth/EmailSignIn.tsx`
  - Linha 213: `placeholder="Ex: seuemail@exemplo.com"`
- `src/components/auth/EmailCodeSignUp.tsx`
  - Linha 160: `placeholder="Ex: seuemail@exemplo.com"`
- `src/components/shared/SettingsDialog.tsx`
  - Linha 402: `aria-label="Corretor do Navegador"`
  - Linha 444: `placeholder="Ex: Divertido, Técnico..."`
  - Linha 456: `placeholder="Máximo 20 caracteres"`
  - Linha 469: `placeholder="Instruções para a IA"`
- `src/components/shared/DocumentsDialog.tsx`
  - Linha 258: `title="Sua galeria está vazia"`
  - Linha 301: `title="Quick Look"`
  - Linha 311: `title="Editar"`
  - Linha 321: `title="Excluir"`
- `src/components/shared/ScrollToTop.tsx`
  - Linha 51: `aria-label="Voltar para o topo"`
- `src/components/shared/CookieConsent.tsx`
  - Linha 70: `aria-label="Close"`
- `src/components/shared/Header.tsx`
  - Linha 115: `alt="Editor de texto"`
  - Linha 194: `aria-label="Open Menu"`
- `src/components/shared/BugReportDialog.tsx`
  - Linha 131: `aria-label="Fechar diálogo"`
  - Linha 203: `placeholder="Ex: O botão de exportação não está funcionando"`
  - Linha 230: `placeholder="Descreva os passos para reproduzir o problema..."`
- `src/components/landing/LandingHero.tsx`
  - Linha 38: `aria-label="Apresentação do editor de texto online"`
  - Linha 62: `alt="Mockup de um MacBook Pro mostrando a interface do editor de texto online"`
- `src/components/landing/LandingCTA.tsx`
  - Linha 43: `aria-label="Chamada para ação final"`
- `src/components/Footer/footer.tsx`
  - Linha 167: `alt="Compra Segura SSL"`
- `src/app/[locale]/_components/EditForm.tsx`
  - Linha 910: `aria-label="Reportar Problema"`
- `src/app/[locale]/dashboard/DashboardContent.tsx`
  - Linha 223: `title="Sem dados para exibir"`
  - Linha 318: `title="Nenhum tom detectado"`
  - Linha 399: `title="O início de algo grande"`
  - Linhas 497-511: `label="Tempo Economizado"`, `label="Documentos"`, `label="Reescritas Hoje"`
  - Linhas 524-532: `title="Cota Diária Gratuita"`, `title="Cota Mensal do Plano"`

## 3. Mensagens de Toast (Notificações)

- `src/components/TiptapEditor/components/Provider.tsx`
  - Linha 191: `toast.error("Limite de armazenamento local atingido");`
  - Linha 196: `toast.error("Erro ao salvar o documento");`
- `src/components/TiptapEditor/components/SideBar.tsx`
  - Linha 34: `toast.error("Erro ao carregar documentos");`
  - Linha 52: `toast.success("Documento excluído");`
  - Linha 57: `toast.error("Erro ao excluir documento");`
  - Linha 63: `toast.success('Documento "..." carregado');`
- `src/components/shared/DocumentsDialog.tsx`
  - Linha 82: `toast.error("Erro ao carregar documentos");`
  - Linha 98: `toast.success("Documento excluído (local)");`
  - Linha 108: `toast.success("Documento excluído");`
  - Linha 113: `toast.error("Erro ao excluir documento");`
- `src/components/shared/BugReportDialog.tsx`
  - Linha 96: `toast.success("Relatório enviado com sucesso!");`
  - Linha 103: `toast.error("Erro ao enviar relatório.");`
- `src/app/[locale]/settings/SettingsContent.tsx`
  - Linha 23: `toast.error("Erro ao processar solicitação.");`

## Conclusão

Foi confirmado que existem exceções: a aplicação **não** está 100% internacionalizada. Diversos trechos em dashboards, diálogos, barra lateral, botões, modais (como o de bugs e de configurações), avisos e toasts usam textos hardcoded definidos diretamente em português (ou partes em inglês como "Assets", "Close" e "On this page").
Para consertar isso, esses locais identificados precisam ser migrados para chaves de internacionalização no repositório de dados locale e inseridos dinamicamente nos componentes da UI.
