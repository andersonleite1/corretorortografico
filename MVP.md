# Editor de Texto - Apresentação do MVP

Este documento apresenta de forma clara e concisa todas as **funcionalidades e recursos que já estão implementados e funcionando** na versão atual (MVP - Minimum Viable Product) do Editor de Texto.

---

## ✍️ Editor de Texto (Rich Text)

O núcleo da aplicação é baseado no motor Tiptap (ProseMirror), oferecendo uma experiência de escrita robusta e altamente customizável.

- **Formatação Básica e Avançada**: Negrito, itálico, sublinhado, tachado, subscrito e sobrescrito.
- **Alinhamento de Texto**: Esquerda, centro, direita e justificado.
- **Estilização de Tipografia**:
  - Alteração de família de fontes (Font Family).
  - Ajuste de tamanho da fonte.
  - Controle de altura da linha (Line Height).
  - Cores personalizadas para o texto (Text Color).
  - Cores de destaque/fundo do texto (Highlight).
- **Estruturação de Conteúdo**:
  - Cabeçalhos (Headers H1 a H6).
  - Listas não ordenadas (Bullet) e ordenadas (Numéricas).
  - Blocos de citação (Blockquote).
  - Divisores horizontais.
- **Tabelas**: Inserção e gerenciamento completo de tabelas (linhas, colunas e cabeçalhos).
- **Mídia e Links**:
  - Inserção de links externos.
  - Upload e gerenciamento de Imagens (com integração ao Cloudinary para biblioteca de mídia e suporte a legendas).
  - Incorporação de vídeos do YouTube.
- **Blocos de Código**: Inserção de blocos de código com destaque de sintaxe nativo (Syntax Highlighting).

## 🛠️ Ferramentas de Produtividade e Revisão

- **Revisor Ortográfico e Gramatical Analítico**: Integração com LanguageTool via barra lateral (Sidebar) dedicada. Permite correção em tempo real com sublinhado de erros (matching contextual com os cards de erro).
- **Modo de Edição de Código-Fonte**: Visualização e edição do código HTML nativo da página utilizando CodeMirror 6.
- **Atalhos de Teclado**: Suporte a atalhos de teclado globais, com um painel (modal) de consulta rápida visual para o usuário.
- **Contagem e Insights de Leitura**:
  - Contagem de caracteres e palavras em tempo real.
  - Estimativa de tempo de leitura.
  - Barra de progresso de leitura nativa.
  - Sumário automático (Table of Contents / ToC) gerado a partir dos cabeçalhos do documento.

## 💾 Persistência e Exportação

- **Salvamento Automático**: Persistência inteligente de rascunhos no `localStorage` do navegador para evitar perda de dados.
- **Exportação Múltipla**:
  - Exportação para PDF pronta para uso e impressão.
  - Exportação para arquivo Word padrão (`.docx`).

## ⚙️ Configurações e UI Geral

- **Barra de Ferramentas (Toolbar) e Menus**: Totalmente responsiva, interativa, com menus modulares agrupados.
- **Menu Mobile Redesenhado**: Menu lateral otimizado e responsivo que reúne opções globais para usuários de dispositivos móveis.
- **Temas e Visual**:
  - Suporte completo e alternância de temas (Claro / Escuro).
- **Internacionalização (i18n)**:
  - Sistema totalmente localizado para os idiomas: Português (PT), Inglês (EN) e Espanhol (ES).
- **Sistema de Notificações**: Feedback visual fluido e global utilizando Sonner (Toasts) para ações (como salvar, reportar problemas, etc).
- **Reporte de Problemas**: Botão "Fale Conosco/Reportar Problema" integrado à aplicação que envia bugs e feedbacks para notificação.

## 🔒 Infraestrutura e Autenticação (Setup Pronto)

- **Autenticação**: Telas e sessões configuradas com Clerk.
- **Assinaturas e Pagamentos**: Configuração base para planos de assinatura integrada via Stripe.
- **Banco de Dados**: Gerenciamento de persistência de sistema utilizando Prisma ORM.

---

_Nota: Este documento reflete exclusivamente os recursos já integrados na base de código atual._
