import React, {
  createContext,
  HTMLAttributes,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { EditorContent, type Editor } from "@tiptap/react";
import useTiptapEditor, {
  type UseTiptapEditorOptions,
} from "../hooks/useTiptapEditor";
import clsx from "clsx";
import CodeMirrorEditor from "@/components/SourceEditor/Editor";
import { type Locale, i18n } from "../../../../i18n-config";
import { getEditorMessages, type EditorMessages } from "../i18n/messages";
import SideBar from "./SideBar";
import LanguageToolSidebar from "./LanguageToolSidebar";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { useEditorSettings } from "@/components/providers/EditorSettingsProvider";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import SaveNotification from "@/components/shared/SaveNotification";

export type ExportActions = {
  onExportDoc?: () => void | Promise<void>;
  onExportPdf?: () => void | Promise<void>;
  onPreviewPdf?: () => void | Promise<void>;
  onPreviewPost?: () => void | Promise<void>;
  onClear?: () => void | Promise<void>;
  isExportingPdf?: boolean;
  onExportTxt?: () => void | Promise<void>;
};

export type DraftSummary = {
  id: string;
  title: string;
  date: string;
};

export type DraftActions = {
  drafts: DraftSummary[];
  onSaveDraft?: () => void;
  onLoadDraft?: (id: string) => void;
  onDeleteDraft?: (id: string) => void;
  onCompareDraft?: (id: string) => void;
  savingStatus?: "idle" | "saving" | "saved" | "error";
};

type TiptapContextType = {
  editor: Editor;
  contentElement: RefObject<Element>;
  isFullScreen: boolean;
  isResizing: boolean;
  isSourceMode: boolean;
  toggleFullScreen: () => void;
  toggleSourceMode: () => void;
  setIsResizing: (value: boolean) => void;
  exportActions?: ExportActions;
  draftActions?: DraftActions;
  messages: EditorMessages;
  locale: Locale;
  userPlan: "free" | "pro" | "team";
  documentTitle?: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  isLTSidebarOpen: boolean;
  setIsLTSidebarOpen: (value: boolean) => void;
  onSaveDocument: () => void;
  isSaving: boolean;
  isMobile: boolean;
};

const TiptapContext = createContext<TiptapContextType>({} as TiptapContextType);
export const useTiptapContext = () => useContext(TiptapContext);

type TiptapProviderProps = {
  slotBefore?: ReactNode;
  slotAfter?: ReactNode;
  editorOptions: UseTiptapEditorOptions;
  editorProps?: HTMLAttributes<HTMLDivElement>;
  children?: ReactNode;
  exportActions?: ExportActions;
  draftActions?: DraftActions;
  locale?: Locale;
  userPlan?: "free" | "pro" | "team";
  documentTitle?: string;
};
export const TiptapProvider = ({
  children,
  editorOptions,
  slotBefore,
  slotAfter,
  exportActions,
  draftActions,
  locale,
  userPlan = "free",
  documentTitle,
}: TiptapProviderProps) => {
  const contentElement = useRef<HTMLDivElement>(null);
  const editor = useTiptapEditor(editorOptions);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const documentId = searchParams.get("docId");

  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isLTSidebarOpen,
    setIsLTSidebarOpen,
    isMobile,
    setIsDocumentsDialogOpen,
  } = useSidebar();
  const { buttonVisibility, setIsSettingsDialogOpen } = useEditorSettings();

  const normalizedLocale = (locale ?? i18n.defaultLocale) as Locale;
  const messages = getEditorMessages(normalizedLocale);

  // Sync spellcheck attribute with settings
  useEffect(() => {
    if (!editor) return;
    editor.setOptions({
      editorProps: {
        attributes: {
          spellcheck: buttonVisibility.browserSpellcheck ? "true" : "false",
        },
      },
    });
  }, [editor, buttonVisibility.browserSpellcheck]);

  const handleSaveDocument = useCallback(async () => {
    if (userPlan === "free") {
      toast.error("Upgrade para o plano Pro para salvar documentos");
      return;
    }

    setIsSaving(true);
    try {
      const content = editor.getJSON();
      const stringifiedContent = JSON.stringify(content);
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: documentId || undefined,
          content: stringifiedContent,
          title: documentTitle || "Sem título",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erro ao salvar o documento");
      }

      const savedDoc = await response.json();

      setShowSuccess(true);

      if (!documentId && savedDoc.id) {
        router.push(`/${normalizedLocale}?docId=${savedDoc.id}`);
      }
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message || "Erro ao salvar o documento");
      } else {
        toast.error("Erro ao salvar o documento");
      }
    } finally {
      setIsSaving(false);
    }
  }, [editor, userPlan, documentId, router, documentTitle, normalizedLocale]);

  // Update shortcuts extension options
  useEffect(() => {
    if (!editor) return;
    editor.setOptions({
      shortcuts: {
        // Arquivo e Controle
        onSave: handleSaveDocument,
        onSaveDraft: draftActions?.onSaveDraft,
        onOpenDocuments: () => setIsDocumentsDialogOpen(true),
        onCopyAll: () => {
          if (
            typeof navigator !== "undefined" &&
            navigator.clipboard?.writeText
          ) {
            navigator.clipboard
              .writeText(editor.getText())
              .catch(console.error);
          }
        },
        onClearEditor: exportActions?.onClear ?? undefined,
        onImportPdf: undefined, // ImportPdfButton manages its own dialog state
        onExport:
          exportActions?.onExportPdf ?? exportActions?.onExportDoc ?? undefined,
        onPreview:
          exportActions?.onPreviewPost ??
          exportActions?.onPreviewPdf ??
          undefined,
        onOpenSettings: () => setIsSettingsDialogOpen(true),
        onAiRewrite: undefined, // AiRewriteButton manages its own popover state
        onInsertImage: undefined,
        onInsertTable: undefined,
      },
    } as any);
  }, [
    editor,
    handleSaveDocument,
    draftActions?.onSaveDraft,
    exportActions?.onClear,
    exportActions?.onExportPdf,
    exportActions?.onExportDoc,
    exportActions?.onPreviewPost,
    exportActions?.onPreviewPdf,
    setIsDocumentsDialogOpen,
    setIsSettingsDialogOpen,
  ]);

  // Global keydown listener for browser-intercepted shortcuts
  useEffect(() => {
    if (!editor) return;

    const handleGlobalKeydown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd + O → Meus Documentos (prevents OS file-open dialog)
      if (isMod && !e.shiftKey && e.key === "o") {
        e.preventDefault();
        setIsDocumentsDialogOpen(true);
        return;
      }

      // Ctrl/Cmd + P → Exportar (prevents browser print dialog)
      if (isMod && !e.shiftKey && e.key === "p") {
        e.preventDefault();
        const action = exportActions?.onExportPdf ?? exportActions?.onExportDoc;
        action?.();
        return;
      }

      // F7 → LanguageTool Toggle
      if (!isMod && !e.shiftKey && e.key === "F7") {
        e.preventDefault();
        (editor.commands as any).setLanguageToolEnabled?.(
          !(editor.storage as any).languageTool?.enabled,
        );
        return;
      }

      // Shift + F7 → LanguageTool Sidebar
      if (!isMod && e.shiftKey && e.key === "F7") {
        e.preventDefault();
        setIsLTSidebarOpen(!isLTSidebarOpen);
        return;
      }
    };

    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  }, [
    editor,
    exportActions,
    isLTSidebarOpen,
    setIsLTSidebarOpen,
    setIsDocumentsDialogOpen,
  ]);

  // Auto-save document every 30 seconds
  useEffect(() => {
    if (!documentId || userPlan === "free" || !handleSaveDocument) {
      return;
    }

    const intervalId = setInterval(() => {
      handleSaveDocument();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [documentId, userPlan, handleSaveDocument]);

  if (!editor) {
    return null;
  }

  const focusEditorViaContainer = (event: React.MouseEvent) => {
    const target = event.target as Element;
    const content = contentElement.current;
    if (content && target.contains(content)) {
      content.style.display = "flex";
      setTimeout(() => {
        content.style.display = "";
      }, 0);
    }
  };

  const editorContent = (
    <div
      className={clsx(
        "rte-editor",
        isFullScreen && "rte-editor--fullscreen",
        isSidebarOpen && "rte-editor--with-sidebar",
        isLTSidebarOpen && "rte-editor--with-lt-sidebar",
      )}
    >
      <SideBar isOpen={isSidebarOpen} />
      <div className="rte-editor__main">
        {slotBefore}
        <div
          className="rte-editor__container"
          onMouseDown={focusEditorViaContainer}
        >
          {isSourceMode ? (
            <CodeMirrorEditor initialContent={editor.getHTML() || ""} />
          ) : (
            <EditorContent
              ref={contentElement}
              editor={editor}
              className="rte-editor__content"
            />
          )}
        </div>
        {children}
        {slotAfter}
      </div>
      <LanguageToolSidebar isOpen={isLTSidebarOpen} />
    </div>
  );

  return (
    <TiptapContext.Provider
      value={{
        editor,
        contentElement,
        isFullScreen,
        isResizing,
        isSourceMode,
        setIsResizing,
        toggleFullScreen: () => setIsFullScreen((prev) => !prev),
        toggleSourceMode: () => setIsSourceMode((prev) => !prev),
        exportActions,
        draftActions,
        messages,
        locale: normalizedLocale,
        userPlan,
        documentTitle,
        isSidebarOpen,
        setIsSidebarOpen,
        isLTSidebarOpen,
        setIsLTSidebarOpen,
        onSaveDocument: handleSaveDocument,
        isSaving,
        isMobile,
      }}
    >
      {editorContent}
      {showSuccess && (
        <SaveNotification
          message={documentId ? "Documento atualizado" : "Documento salvo"}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </TiptapContext.Provider>
  );
};

export default TiptapProvider;
