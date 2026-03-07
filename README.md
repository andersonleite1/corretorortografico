# Editor de Texto Online ✨

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

Um editor de texto WYSIWYG moderno, robusto e altamente customizável construído com **Next.js 14**. Projetado para oferecer uma experiência de escrita fluida com recursos avançados de formatação, persistência local e múltiplas opções de exportação.

---

## 🚀 Principais Funcionalidades

- **✍️ Editor Rich Text Avançado**: Baseado em Tiptap (ProseMirror), oferecendo headers, listas, tabelas, cores, links e suporte a mídias.
- **🌍 Internacionalização (i18n)**: Suporte nativo para Português (PT), Inglês (EN) e Espanhol (ES) usando App Router.
- **💾 Persistência Inteligente**: Salvamento automático no `localStorage` para garantir que rascunhos nunca sejam perdidos.
- **🖼️ Gerenciamento de Mídia**: Integração direta com Cloudinary para upload e biblioteca de imagens.
- **📑 Múltiplos Formatos de Exportação**: Gere arquivos `.doc`, visualize versões CSR/SSR e fluxo otimizado para PDF.
- **💻 Modo Fonte (HTML)**: Edição direta do código-fonte usando CodeMirror 6 com syntax highlighting.
- **🌓 Tema Dinâmico**: Suporte total a temas Claro e Escuro com transições suaves.
- **📊 Insights de Leitura**: Sumário automático (ToC), estimativa de tempo de leitura, barra de progresso e contagem de palavras.

---

## 🛠️ Tech Stack

### Core

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/) + [SCSS](https://sass-lang.com/)
- **Componentes**: [Radix UI](https://www.radix-ui.com/) (Dropdown, Popover, Tooltip)

### Editor & Ferramentas

- **Engine do Editor**: [Tiptap](https://tiptap.dev/) / [ProseMirror](https://prosemirror.net/)
- **Edição de Código**: [CodeMirror 6](https://codemirror.net/)
- **Upload de Imagens**: [Cloudinary](https://cloudinary.com/)
- **Exportação**: [PDF (API Externa)](https://editordetexto.online) e .docx nativo.

---

## 📂 Estrutura do Projeto

```bash
src/
├── app/             # Rotas do App Router (Editor, Previews, API)
│   ├── (edit)/      # Página principal do editor
│   ├── [locale]/    # Rotas internacionalizadas
│   └── api/         # Endpoints para upload de imagens e utilities
├── components/      # Componentes de UI modulares
│   ├── TiptapEditor/# Core do editor e extensões
│   ├── MediaLibrary/# Interface de gestão de imagens
│   └── shared/      # Botões, inputs e elementos comuns
├── extensions/      # Customizações e extensões do Tiptap
├── hooks/           # Hooks personalizados (sumário, progresso, etc.)
├── services/        # Lógica de persistência e serviços externos
└── styles/          # Configurações globais de CSS/SCSS
```

---

## 🏁 Introdução

### Pré-requisitos

- Node.js 18.x ou superior
- NPM ou Yarn

### Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/andersonleite1/editordetexto.git
   cd editordetexto
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:

   ```bash
   cp .env.example .env.local
   # Adicione suas credenciais do Cloudinary no .env.local
   ```

4. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

### Testes

O projeto utiliza **Vitest** com **React Testing Library** para garantir a qualidade do código.

- Executar todos os testes:
  ```bash
  npm test
  ```
- Abrir interface visual do Vitest:
  ```bash
  npx vitest --ui
  ```

---

## 🌎 Internacionalização (i18n)

O projeto utiliza uma estrutura robusta de i18n. Para adicionar ou modificar traduções, consulte:

- `src/app/[locale]/` para rotas específicas.
- `i18n-config.ts` para definições de locales disponíveis (`pt`, `en`, `es`).

---

## 📄 Exportação & Compartilhamento

- **Documento Word**: Utilize a função de exportação para gerar arquivos `.docx` compatíveis.
- **PDF**: O projeto inclui um fluxo dedicado em `/post-pdf` para geração de documentos prontos para impressão ou salvamento em PDF.
- **Social**: Compartilhamento rápido via WhatsApp, LinkedIn, Twitter e Facebook.

---

## 🤝 Contribuição

Contribuições são o que tornam a comunidade open source um lugar incrível para aprender, inspirar e criar. Qualquer contribuição que você fizer será **muito apreciada**.

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Insira suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça o Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## ⚖️ Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---

<p align="center">Desenvolvido com ❤️ por Anderson Leite</p>
