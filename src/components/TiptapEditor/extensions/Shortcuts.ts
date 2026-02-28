import { Extension } from "@tiptap/core";

export interface ShortcutsOptions {
  // Arquivo e Controle
  onSave?: () => void;
  onSaveDraft?: () => void;
  onOpenDocuments?: () => void;
  onCopyAll?: () => void;
  onClearEditor?: () => void;
  onImportPdf?: () => void;
  onExport?: () => void;
  onPreview?: () => void;
  onOpenSettings?: () => void;
  onAiRewrite?: () => void;
  // Revisão e Idioma (F-keys handled via global listener in Provider)
  onToggleLanguageTool?: () => void;
  onLanguageToolSidebar?: () => void;
  // Inserção
  onInsertImage?: () => void;
  onInsertTable?: () => void;
}

export const Shortcuts = Extension.create<ShortcutsOptions>({
  name: "shortcuts",

  addOptions() {
    return {
      onSave: undefined,
      onSaveDraft: undefined,
      onOpenDocuments: undefined,
      onCopyAll: undefined,
      onClearEditor: undefined,
      onImportPdf: undefined,
      onExport: undefined,
      onPreview: undefined,
      onOpenSettings: undefined,
      onAiRewrite: undefined,
      onToggleLanguageTool: undefined,
      onLanguageToolSidebar: undefined,
      onInsertImage: undefined,
      onInsertTable: undefined,
    };
  },

  addKeyboardShortcuts() {
    return {
      // ─── Arquivo e Controle ──────────────────────────────────────
      /** Salvar Documento — Ctrl/Cmd + S */
      "Mod-s": () => {
        this.options.onSave?.();
        return true;
      },
      /**
       * Rascunhos — Ctrl/Cmd + Shift + S
       * (was Mod-Shift-r in previous implementation; moved here
       *  to free Mod-Shift-r for "Alinhar à Direita")
       */
      "Mod-Shift-s": () => {
        this.options.onSaveDraft?.();
        return true;
      },
      /** Meus Documentos — Ctrl/Cmd + O (also handled globally to preventDefault browser file dialog) */
      "Mod-o": () => {
        this.options.onOpenDocuments?.();
        return true;
      },
      /** Copiar Tudo — Ctrl/Cmd + Shift + C */
      "Mod-Shift-c": () => {
        this.options.onCopyAll?.();
        return true;
      },
      /** Limpar Editor — Ctrl/Cmd + Shift + Delete */
      "Mod-Shift-Delete": () => {
        this.options.onClearEditor?.();
        return true;
      },
      /** Importar PDF — Ctrl/Cmd + Shift + I */
      "Mod-Shift-i": () => {
        this.options.onImportPdf?.();
        return true;
      },
      /** Exportar — Ctrl/Cmd + P (also handled globally to preventDefault browser print) */
      "Mod-p": () => {
        this.options.onExport?.();
        return true;
      },
      /** Pré-visualizar — Ctrl/Cmd + Shift + P */
      "Mod-Shift-p": () => {
        this.options.onPreview?.();
        return true;
      },
      /** Configurações — Ctrl/Cmd + , */
      "Mod-,": () => {
        this.options.onOpenSettings?.();
        return true;
      },
      /** Reescrever com IA — Ctrl/Cmd + J */
      "Mod-j": () => {
        this.options.onAiRewrite?.();
        return true;
      },

      // ─── Formatação de Parágrafo ─────────────────────────────────
      /**
       * Alinhar à Direita — Ctrl/Cmd + Shift + R
       * NOTE: Tiptap's TextAlign extension handles Mod-Shift-l/e/r/j natively.
       * We don't override them here; they're managed by the TextAlign extension.
       */

      // ─── Inserção ────────────────────────────────────────────────
      /** Inserir Imagem — Ctrl/Cmd + Alt + I */
      "Mod-Alt-i": () => {
        this.options.onInsertImage?.();
        return true;
      },
      /** Inserir Tabela — Ctrl/Cmd + Alt + T */
      "Mod-Alt-t": () => {
        this.options.onInsertTable?.();
        return true;
      },
    };
  },
});
