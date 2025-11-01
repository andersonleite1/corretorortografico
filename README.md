# Editor de Texto Online

## Descrição Geral
O Editor de Texto Online é uma aplicação Next.js voltada para criação de conteúdo rico diretamente no navegador. Ele combina um editor WYSIWYG avançado, pré-visualizações em diferentes contextos e ferramentas de exportação para dar suporte a redatores, equipes de marketing e criadores de conteúdo técnico. O fluxo padrão salva automaticamente o texto no `localStorage`, permitindo retomar rascunhos, visualizar a leitura final e gerar entregáveis sem depender de backend dedicado.

## Tecnologias Utilizadas
- **Next.js 14** — framework React com App Router e recursos híbridos CSR/SSR, empregado para estruturar rotas do editor, prévias (`post-csr`, `post-ssr`, `post-pdf`) e APIs internas.
- **React 18 + React Hook Form** — biblioteca de UI e gerenciamento de formulários, usada para controlar o estado do editor e validar campos como título e conteúdo.
- **TypeScript** — linguagem tipada que garante segurança em componentes complexos (menus, hooks personalizados e serviços de persistência).
- **Tiptap (ProseMirror)** — editor rich text modular que fornece formatação avançada, tabelas, alinhamentos, contagem de palavras e menus contextuais.
- **CodeMirror 6** — editor de código utilizado no modo fonte para ajustar HTML exportado com destaque de sintaxe.
- **Tailwind CSS + SCSS** — combinação de utilitários e folhas de estilo globais para compor o design responsivo, temas claro/escuro e efeitos específicos do editor.
- **Cloudinary SDK** — armazenamento externo de imagens com upload via `/api/images`, facilitando biblioteca de mídia integrada.
- **html2canvas & jsPDF** — ferramentas client-side responsáveis por capturar a visualização e gerar PDFs (workflow em desenvolvimento).
- **File Saver** — utilitário para baixar versões `.doc` do conteúdo.
- **Vercel Analytics & Speed Insights** — monitoramento de uso e performance em produção.

## Como Executar o Projeto Localmente
1. Garanta Node.js 18+ instalado.
2. Clone o repositório e acesse a pasta: `git clone ... && cd editordetexto`.
3. Copie as variáveis de ambiente: `cp .env.example .env.local` e preencha credenciais Cloudinary.
4. Instale dependências: `npm install`.
5. Execute em modo desenvolvimento: `npm run dev` (http://localhost:3000).
6. Opcional: `npm run lint` para garantir conformidade com o ESLint.
7. Build de produção: `npm run build` seguido de `npm run start`.

## Estrutura de Pastas
```
src/
  app/                # Rotas App Router, incluindo editor principal e pré-visualizações
  components/         # Biblioteca de UI: TiptapEditor, SourceEditor, MediaLibrary e componentes compartilhados
  data/               # Conteúdo estático exibido no site (ex.: texto institucional)
  extensions/         # Extensões customizadas para o editor rich text
  hooks/              # Hooks reutilizáveis (ex.: sumário automático, progresso de leitura)
  services/           # Serviços client-side como persistência em localStorage
  styles/             # Estilos globais e tokens complementares ao Tailwind
public/               # Ativos estáticos (logos, imagens de fallback, favicon)
```

## Funcionalidades Principais
- **Editor Rich Text com menus avançados**: botões para heading, listas, tabela, cores, links e inserção de mídia, com estado persistido automaticamente.
- **Visualização em múltiplos contextos**: páginas dedicadas para preview CSR (com leitura estimada), SSR e layout pronto para impressão/PDF.
- **Exportação e compartilhamento**: download de `.doc`, fluxo de captura para PDF e links rápidos de compartilhamento social.
- **Modo Fonte (HTML)**: alternância para CodeMirror permitindo ajustes finos no markup.
- **Biblioteca de mídia**: upload e seleção de imagens hospedadas na Cloudinary diretamente do editor.
- **Recursos de leitura**: sumário automático (`PostToc`), barra de progresso, contagem de palavras e dados do autor.
- **Gestão de rascunhos locais**: salvar, carregar e excluir versões anteriores limitadas a 10 entradas.
- **Tema claro/escuro**: alternância persistida via `ThemeSwitcher`.

## Possíveis Melhorias Futuras
- Concluir exportação PDF nativa para remover dependência de janela auxiliar e suportar documentos longos.
- Adicionar autenticação e sincronização com backend para rascunhos multi-dispositivos.
- Implementar suíte de testes (Jest/Vitest + Playwright) para garantir estabilidade do editor e rotas críticas.
- Internacionalização (i18n) para atender público além do português.
- Criar modo colaborativo ou comentários em tempo real usando WebSockets ou serviços terceiros.
