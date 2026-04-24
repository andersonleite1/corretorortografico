# SPEC-006 — Contrato do Módulo TiptapEditor

<!-- ================================================================
  TEMPLATE OFICIAL — editordetexto.online
  Versão: 1.0.0
================================================================ -->

---

## 1. Metadados

| Campo | Valor |
|---|---|
| **Título** | Contrato do Módulo TiptapEditor (Core) |
| **ID** | SPEC-006 |
| **Status** | `approved` |
| **Data de Criação** | 2026-04-24 |
| **Última Atualização** | 2026-04-24 |
| **Autor** | Antigravity AI |
| **Revisor** | Anderson Leite |
| **Feature Relacionada** | Editor Core |
| **ADRs Referenciados** | nenhum |

---

## 2. Contexto e Objetivo

### 2.1 Problema que esta feature resolve

O `TiptapEditor` é a parte mais complexa do sistema. Sem regras rígidas de encapsulamento, o código tende a se tornar "espaguete", com vazamento de extensões do ProseMirror para a lógica de UI e dependências circulares com a pasta `lib/`.

### 2.2 O que esta feature entrega

- [ ] Arquitetura modular e auto-contida para o editor.
- [ ] Separação clara entre Extensões, Comandos, Regras de Teclado e UI.
- [ ] Contexto unificado (`TiptapContext`) para evitar prop-drilling.
- [ ] Carregamento otimizado (Dynamic Imports) para menus baseados no DOM.
- [ ] Segurança de tipos para Props do editor e comandos customizados.

### 2.3 O que está FORA do escopo

- Implementação do CodeMirror (outro módulo).
- Regras de persistência (cobertas pela SPEC-005).

### 2.4 Dependências

| Dependência | Tipo | Status |
|---|---|---|
| Tiptap v3 SDK | `blocker` | `done` |
| ProseMirror | `blocker` | `done` |

---

## 3. Requisitos de Engenharia

### 3.1 Estrutura Interna de Pastas

O módulo em `src/components/TiptapEditor` deve obrigatoriamente seguir esta estrutura:
1.  **`components/`**: Peças de UI (Toolbar, Button, Resizer).
2.  **`extensions/`**: Onde vivem as extensões oficiais e customizadas do Tiptap.
3.  **`hooks/`**: Lógica de estado complexa (ex: `useTiptapEditor`).
4.  **`menus/`**: Bubble menus e Floating menus.
5.  **`styles/`**: SCSS específico do editor (tokens `--rte-*`).

### 3.2 Registro de Extensões (`kit.ts`)

Todas as extensões devem ser registradas centralmente em `kit.ts` através da função `createExtensionKit(locale)`.
**Proibição**: NUNCA instanciar extensões diretamente no componente `Editor.tsx`.

### 3.3 Consumo de Estado (`TiptapContext`)

O acesso ao editor deve ser feito ÚNICA e EXCLUSIVAMENTE via `useTiptapContext()`.
**Contrato do Contexto:**
```typescript
type TiptapContextType = {
  editor: Editor;           // Instância real do Tiptap
  isSourceMode: boolean;    // Estado do modo HTML
  messages: EditorMessages; // Traduções i18n
  userPlan: Plan;           // Plano do usuário para gating de botões
  onSaveDocument: () => void;
};
```

---

## 4. Contratos e Tipagens

### 4.1 Interface de Props (`Editor.tsx`)
```typescript
export interface TiptapEditorProps {
  initialContent?: Content;
  onContentChange?: (value: Content) => void;
  readonly?: boolean;
  userPlan?: "free" | "pro" | "team";
  locale?: Locale;
}
```

---

## 5. Critérios de Aceite para a IA (Regras Invioláveis)

### 5.1 Encapsulamento
- [ ] NUNCA importar nada de `src/components/TiptapEditor` dentro de `src/lib`. A dependência deve ser unidirecional.
- [ ] UI de menus (ex: `LinkMenu`) deve ser importada via `next/dynamic` com `{ ssr: false }`.

### 5.2 Estilos
- [ ] Estilos devem usar as variáveis CSS definidas no `style.scss` do módulo.
- [ ] Evitar Tailwind classes "hardcoded" para cores que variam entre temas no editor; prefira as variáveis `--rte-*`.

### 5.3 Extensões Customizadas
- [ ] Qualquer comando novo (ex: `setHighlight`) deve ser documentado na interface `Commands` do Tiptap (via TypeScript declaration merging) para evitar o uso de `as any`.

---

## 6. Histórico de Revisões

| Versão | Data | Autor | Mudança |
|---|---|---|---|
| 1.0 | 2026-04-24 | Antigravity AI | Criação da norma técnica do Editor Core |

---

*Documento normativo — editordetexto.online SDD Infrastructure*
