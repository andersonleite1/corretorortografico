# SPEC-005 — Persistência e Estado do Editor

<!-- ================================================================
  TEMPLATE OFICIAL — editordetexto.online
  Versão: 1.0.0
================================================================ -->

---

## 1. Metadados

| Campo | Valor |
|---|---|
| **Título** | Persistência e Estado do Editor (Drafts & Cloud Sync) |
| **ID** | SPEC-005 |
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

Um editor de texto depende da confiança do usuário de que seu trabalho não será perdido. Precisamos de uma estratégia de persistência que funcione tanto para usuários anônimos/gratuitos (offline-first) quanto para assinantes (cloud-sync).

### 2.2 O que esta feature entrega

- [ ] Estratégia Dupla: Salvamento em `localStorage` (Free) vs `Postgres` (Pro/Team).
- [ ] Auto-save silencioso em intervalos de 30 segundos.
- [ ] Recuperação automática de rascunhos baseada no parâmetro `?docId` da URL.
- [ ] Feedback visual de salvamento via toast e notificações discretas.
- [ ] Tratamento de erro para limites de armazenamento local.

### 2.3 O que está FORA do escopo

- Edição colaborativa em tempo real (Yjs/WebSockets).
- Histórico de versões (Undo/Redo via DB). Somente o estado atual é persistido.

### 2.4 Dependências

| Dependência | Tipo | Status |
|---|---|---|
| Tiptap JSON Format | `blocker` | `done` |
| SPEC-004 (Auth Gating) | `blocker` | `done` |
| Prisma / Neon | `blocker` | `done` |

---

## 3. Requisitos de Engenharia

### 3.1 Estratégia de Salvamento (`handleSaveDocument`)

A decisão de onde salvar o dado é baseada no plano do usuário:

#### Usuários FREE
1.  **Destino**: `localStorage` sob a chave `local_documents`.
2.  **Identificador**: IDs prefixados com `local-` gerados randomicamente.
3.  **Limite**: Aproximadamente 5MB (limite do browser). Erros de cota devem exibir o toast `localLimitReached`.

#### Usuários PRO / TEAM
1.  **Destino**: Endpoint `/api/documents` (Prisma/Cloud).
2.  **Identificador**: CUIDs gerados pelo banco de dados.
3.  **Payload**: O conteúdo do editor é convertido de JSON para String (`JSON.stringify(content)`) antes de ser enviado ao servidor.

### 3.2 Gatilhos de Persistência

- **Manual**: `Ctrl + S`, `Cmd + S` ou botão de salvar na UI.
- **Automático**: `setInterval` de 30.000ms invocado no `TiptapProvider`.
- **Prevenção de Perda**: O autosave só inicia se houver um `documentId` ativo ou se o conteúdo tiver alterações detectáveis.

### 3.3 Estrutura do Dado (`Document`)

O schema deve ser idêntico tanto local quanto remoto para facilitar migrações futuras:
```typescript
interface Document {
  id: string;
  title: string;
  content: any; // Tiptap JSON
  updatedAt: string | Date;
  createdAt: string | Date;
}
```

---

## 4. Contratos e Tipagens

### 4.1 API de Salvamento (POST `/api/documents`)
```typescript
export const SaveDocumentRequestSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(255),
  content: z.string(), // JSON Stringified
});
```

---

## 5. Critérios de Aceite para a IA

### 5.1 Consistência de Dados
- [ ] O conteúdo salvo deve ser o retorno de `editor.getJSON()`.
- [ ] Ao salvar um novo documento com sucesso, a URL deve ser atualizada com `?docId={id}` sem recarregar a página.

### 5.2 Fluxo de Plano
- [ ] IA deve verificar `userPlan` antes de decidir entre `saveLocalDocument` e `fetch("/api/documents")`.
- [ ] Se o usuário Pro estiver offline, o sistema deve registrar o erro mas não deve sobrescrever o rascunho local se ele existir.

### 5.3 UX/UI
- [ ] Exibir o componente `SaveNotification` após cada salvamento bem-sucedido.
- [ ] Mostrar indicador de carregamento (`isSaving`) durante o processo de escrita no DB.

---

## 6. Histórico de Revisões

| Versão | Data | Autor | Mudança |
|---|---|---|---|
| 1.0 | 2026-04-24 | Antigravity AI | Especificação de Persistência e Sync |

---

*Documento normativo — editordetexto.online SDD Infrastructure*
