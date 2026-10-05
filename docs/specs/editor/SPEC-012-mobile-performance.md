# SPEC-012 — Desempenho da landing e do editor no celular

## 1. Metadados
- Status: approved
- Data: 2026-10-04
- Revisor: Anderson Leite — autorização explícita no chat para seguir com os ajustes de desempenho, preservando desktop e SEO.
- Dependências: SPEC-009/010 (editor público), SPEC-005/006 (persistência e editor).

## 2. Objetivo e escopo
Reduzir trabalho síncrono durante digitação, carregar ferramentas opcionais somente quando usadas e estabilizar o carregamento inicial. Preservar funcionalidades, conteúdo SEO, metadados, URLs, preferências, biblioteca e rascunhos. Não remover backend autenticado legado nem dados. Sem dependências novas ou publicação.

## 3. Requisitos e Harness Impact Map
- Risco high: Tiptap e persistência. Aplicar no repositório editordetexto, sem alterações no Zerus.
- Entradas: EditForm, TiptapProvider, hook useTiptapEditor, layout, MainContent e CookieConsent.
- Dados: chaves post/local_documents e formatos preservados; autosave em 1,5s e flush na saída/ocultação/unmount. Comparação/serialização fora do caminho de cada tecla, confirmação somente após gravação.
- Carregamento: CodeMirror e módulos Markdown opcionais via import dinâmico; diálogos montados somente quando abertos. Reutilizar componentes existentes.
- Layout: dimensões do conteúdo definidas antes do primeiro paint, toolbar/status com reserva de espaço. Respeitar autofocus:false; não abrir teclado/focar durante montagem.
- Consentimento: aviso disponível no HTML inicial para visitante novo, mesmas ações e texto; leitura de storage protegida. Política de analytics não alterada.
- Fontes: evitar preload da fonte mono de ferramentas secundárias, sem mudar fontes visíveis.
- Externos: nenhum novo endpoint, telemetria, serviço ou transmissão de texto.
- Sensores: build produção isolado antes/depois, TypeScript/lint, inspeção funcional desktop/mobile claro/escuro e persistência com documento sintético, comparação de HTML/metadados/SEO. Relatórios PSI públicos são baseline de produção; não prometer scores pós-alteração sem publicar e medir.
- Rollback: snapshot /private/tmp/editordetexto-perf-before; reverter somente esta entrega, mantendo alterações anteriores e dados.
- Reuse Assessment: extend-existing em EditForm, Provider e hook; reuse-existing em SourceEditor, dialogs, Markdown e CookieConsent. Não criar subsistema ou duplicar storage.

## 4. Arquivos permitidos
- docs/specs/editor/SPEC-012-mobile-performance.md, docs/specs/_INDEX.md
- docs/architecture/MOBILE_PERFORMANCE_ROLLOUT.md
- src/app/layout.tsx, MainContent.tsx, [locale]/_components/EditForm.tsx
- src/components/shared/CookieConsent.tsx
- src/components/TiptapEditor/components/Provider.tsx, Editor.tsx
- src/components/TiptapEditor/hooks/useTiptapEditor.ts
- src/components/TiptapEditor/styles/editor.scss

## 5. Aceite
- Sem autofocus involuntário; dimensões do corpo aplicadas no primeiro render.
- Digitação não grava post nem serializa snapshot do autosave a cada tecla.
- Pausa/saída preservam rascunho e biblioteca; reload mantém título e formatação.
- Modo HTML, Markdown, preferências e biblioteca continuam acessíveis.
- H1, title, description, canonical, hreflang e seções orgânicas iguais ao snapshot.
- Desktop e mobile inspecionados; nenhuma alteração à versão de dependências ou package-lock preexistente.
- Sensores e limitações registrados no relatório de entrega.
