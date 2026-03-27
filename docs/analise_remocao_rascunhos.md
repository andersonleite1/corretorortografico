# Análise de Impacto: Remoção de Rascunhos (Drafts)

## Objetivo
Analisar o impacto de remover a funcionalidade de "Rascunho de Documento", mantendo apenas o salvamento direto do documento principal.

## 1. Banco de Dados (`prisma/schema.prisma`)
- **Remoção do modelo `Draft`**: O banco não precisará mais armazenar as versões intermediárias de texto.
- **Atualização do modelo `Document`**: Será necessário remover o relacionamento `drafts Draft[]`.
- **Limpeza de Banco**: As tabelas relacionadas a `Draft` perderão a serventia. Uma nova migração cuidará da exclusão da tabela e do histórico de rascunhos.

## 2. Rotas de API (Backend)
- **Exclusão total de `src/app/api/documents/[id]/drafts/route.ts`**: Esta rota é responsável pelas operações de gerir (listar e criar limitadamente com throttle) os rascunhos; pode ser completamente apagada.
- **Adaptação do Salvamento Direto**: Caso a interface dependesse dos drafts para o "auto-save", a chamada que salva o progresso precisará acionar a API de atualização direta do `Document`. 

## 3. Componentes de Interface (Frontend)
Os componentes ligados unicamente à visualização ou comparação de rascunhos devem ser excluídos e referências limpas:
- **Exclusões**:
  - `src/components/Drafts/DraftComparison.tsx`
  - `src/components/TiptapEditor/components/controls/DraftsDropdown.tsx`
- **Adaptações**:
  - `src/app/[locale]/_components/EditForm.tsx`: Remover as queries de busca e recuperação de rascunhos. O formulário não oferecerá mais o modal/botão de resgatar versão.
  - `src/components/TiptapEditor/components/StatusBar.tsx`: Mensagens do tipo "Salvando rascunho..." ("Saving draft...") devem ser mudadas para "Salvando..." ("Saving document...").
  - `src/components/TiptapEditor/components/MenuBar.tsx` e `Editor.tsx`: O menu dropdown de seleção de múltiplas versões (`<DraftsDropdown />`) não será mais renderizado.

## 4. Textos e Internacionalização (i18n)
Deverão ser removidas de arquivos como `src/data/edit/messages.ts` e `src/components/TiptapEditor/i18n/messages.ts` quaisquer chaves contendo textos sobre drafts (p.ex: "Rascunho automático", "Ver rascunhos"). O arquivo de testes `EditForm.localStorage.test.tsx` deve ser corrigido caso estivesse simulando salvamento de "Draft".

## 5. Impacto Funcional e Experiência do Usuário

> [!WARNING]
> Sem rascunhos intermediários da aplicação, é preciso ter atenção a:
> 
> 1. **Comportamento de Auto-save**: Transformar a ação de salvar o rascunho no salvamento direto do Documento fará com que qualquer errata escrita pelo usuário sobreponha o arquivo original na nuvem em tempo real (caso utilize auto-save). O usuário perde a capacidade de comparar o seu texto principal "oficial" contra a versão mal acabada.
> 2. **Economia de Recursos**: A exclusão do modelo `Draft` liberará bastante tamanho da base de dados (era fixado 5 cópias completas em JSON stringified e texto por cada Documento) e o volume de requests concorrentes de leitura/criação das versões à API, simplificando significativamente a arquitetura.
