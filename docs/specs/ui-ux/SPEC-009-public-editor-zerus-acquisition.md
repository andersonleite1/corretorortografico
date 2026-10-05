# SPEC-009 — Editor público e aquisição para o Zerus

## 1. Metadados

| Campo   | Valor                                                                            |
| ------- | -------------------------------------------------------------------------------- |
| ID      | SPEC-009                                                                         |
| Status  | `approved`                                                                       |
| Data    | 2026-10-04                                                                       |
| Autor   | Codex                                                                            |
| Revisor | Anderson Leite — autorização explícita no chat para executar o plano apresentado |
| Feature | Landing/editor sem conta e indicação do Zerus                                    |
| ADRs    | nenhum                                                                           |

## 2. Contexto e objetivo

O Editor de Texto preserva a landing orgânica e o editor gratuito sem login. O Zerus recebe visitantes que desejam conta, organização e IA. Esta spec supera as premissas de login, planos e nuvem na interface pública das SPEC-004/005/007; mantém autorização e isolamento dos endpoints legados.

### Entregas

- Cabeçalho e menu sem login/dashboard, com link explícito para Zerus.
- CTA de escrita aponta para #editor; pequena seção Zerus após o editor.
- Editor, preferências e biblioteca local funcionam sem Clerk no cliente.
- Salvamento identifica sucesso/erro e armazenamento no navegador, sem alegar sincronização.
- Toolbar mobile compacta com expansão de ferramentas avançadas.
- Rotas antigas de auth apontam ao Zerus; dashboard/settings retornam à landing com aviso de transição e contato para dados antigos.
- URLs públicas, title, description, H1, canonical, hreflang e seções orgânicas preservados. Apenas correções factuais sobre conta/IA/privacidade nos textos existentes.
- Links com UTM por posição e eventos sem texto/documento/identificadores privados.

### Fora do escopo

Migração automática entre sites; alteração do banco, exclusão de dados, cobrança/assinaturas, deploy e alterações no Zerus. Recuperação de dados remotos exige atendimento via contato; bases e APIs legadas autenticadas permanecem preservadas.

### Dependências

SPEC-003/005/006/007 (approved), local_documents/post e destino público https://zerus.app.

## 3. Requisitos de engenharia

Next.js 14 App Router, locales pt/en/es, middleware Edge. Remover Clerk do layout público e hooks de auth dos componentes montados. Preservar Clerk apenas no backend legado; APIs protegidas retornam 401 sem sessão, sem redirecionar para uma tela removida. Usar armazenamento local existente; nunca abrir IA paga para visitantes. IDs remotos não serão sobrescritos como IDs locais; exibir orientação de recuperação. Não instalar dependências.

### 3.2 Arquivos permitidos

- docs/specs/ui-ux/SPEC-009-public-editor-zerus-acquisition.md, docs/specs/\_INDEX.md
- src/data/acquisition.ts, src/lib/zerus.ts
- src/components/shared/ZerusLink.tsx, src/components/landing/ZerusBridge.tsx
- src/components/shared/Header.tsx, MobileMenu.tsx, CookieConsent.tsx, DocumentsDialog.tsx, SettingsDialog.tsx
- src/components/Footer/footer.tsx
- src/app/layout.tsx, MainContent.tsx, middleware.ts, middleware.test.ts
- src/app/[locale]/page.tsx, EditPageContent.tsx, style.scss, \_components/EditForm.tsx
- src/app/[locale]/dashboard/page.tsx, settings/page.tsx, (auth)/sign-in/[[...sign-in]]/page.tsx, (auth)/sign-up/page.tsx
- src/components/landing/HeroActions.tsx, LandingCTA.tsx
- src/components/providers/PlanProvider.tsx, EditorSettingsProvider.tsx, SidebarProvider.tsx
- src/components/TiptapEditor/components/Provider.tsx, StatusBar.tsx, MenuBar.tsx
- src/components/TiptapEditor/components/controls/AiRewriteButton.tsx, DocumentsButton.tsx, SettingsButton.tsx
- src/components/TiptapEditor/components/menus/AiBubbleMenu.tsx
- src/components/TiptapEditor/styles/editor.scss
- src/data/home/pt.ts, en.ts, es.ts
- docs/architecture/PUBLIC_EDITOR_ROLLOUT.md

### Harness Impact Map

| Campo            | Valor                                                                                                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Risco            | high: retirada de auth pública, persistência e Tiptap                                                                                                                                    |
| Entradas         | Header, EditPageContent, TiptapProvider, middleware                                                                                                                                      |
| Dados            | rascunhos locais; bancos legados preservados, isolamento userId intacto                                                                                                                  |
| Externos         | Zerus, analytics existente; Clerk legado somente nas APIs                                                                                                                                |
| Reuse Assessment | extend-existing: editor, toolbar, persistência e i18n; reuse-existing: analytics, exportações e diálogo local; novo helper/link compartilha destino e atribuição entre todas as chamadas |
| Sensores         | tsc, lint, compilação de produção; suíte de testes sob solicitação, navegador desktop/mobile                                                                               |
| Rollback         | reverter arquivos desta entrega; nenhum schema/armazenamento é removido                                                                                                                  |

## 4. Contratos e tipagens

getZerusHref(locale, placement) gera URL fixa HTTPS do Zerus, locale e utm_source=editordetexto, utm_medium=referral, utm_campaign=public_editor, utm_content=posição. Nenhum query arbitrário do usuário é propagado.

UI local sempre usa plano free. Save status: local, saving, saved, error; saved depende de escrita bem-sucedida. Bibliotecas locais e chave post preservadas.

Auth antiga: redirect temporário ao Zerus com atribuição. Dashboard/settings: redirect temporário à landing do locale com legacy=account, sem transportar ID/texto. Editor antigo: landing#editor. APIs protegidas: 401 JSON sem sessão e 503 em falha de autorização; guardas atuais de handlers preservadas. APIs públicas existentes inalteradas.

Nenhuma nova API, schema Zod ou migration Prisma.

## 5. Critérios de aceite

- Página e editor carregam sem Clerk no cliente, login, cadastro, dashboard e fetch de plano.
- Escrita, formatação, importação/exportação e salvamento/reabertura local funcionam.
- Toolbar mobile básica aparece com avançados acessíveis por Mais; teclado e zoom funcionam.
- Todos os CTAs de aquisição têm destino Zerus; CTA de escrita usa #editor.
- APIs de IA/documentos/imagens/settings continuam protegidas, inclusive em falha do middleware.
- Conteúdo privado não vai em links ou eventos. IDs remotos não são gravados na biblioteca local.
- SEO preservado exceto correções factuais delimitadas; schemas refletem FAQ atual.
- Dados legados não são deletados; aviso de recuperação e limitação registrado.
- Somente arquivos permitidos alterados; nenhuma dependência adicionada.

## 6. Implementação e evidências

Implementação registrada em docs/architecture/PUBLIC_EDITOR_ROLLOUT.md. TypeScript, lint, produção em cópia isolada e diff --check concluídos com exit 0. Inspeção desktop/mobile e redirect de dashboard confirmados no navegador. Metadados SEO, H1, artigo e perguntas do FAQ iguais ao HEAD em PT/EN/ES. Suíte automatizada não executada. Recuperação de dados antigos e conversão no Zerus dependem da preparação de publicação descrita nesse documento. Scripts harness:check/graphify:refresh não existem neste repositório; não adicionar ferramentas apenas para esta entrega.

## 7. Histórico

2026-10-04 — Plano aprovado pelo usuário na conversa e registrado para implementação.
