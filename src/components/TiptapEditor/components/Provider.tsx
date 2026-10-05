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
import dynamic from "next/dynamic";
const CodeMirrorEditor = dynamic(
  () => import("@/components/SourceEditor/Editor"),
  {
    ssr: false,
  },
);
import { type Locale, i18n } from "../../../../i18n-config";
import { getEditorMessages, type EditorMessages } from "../i18n/messages";
import LanguageToolSidebar from "./LanguageToolSidebar";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { useEditorSettings } from "@/components/providers/EditorSettingsProvider";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import SaveNotification from "@/components/shared/SaveNotification";
import { saveLocalDocument, getLocalDocumentById } from "@/lib/local-storage";
import { getAcquisitionContent } from "@/data/acquisition";

export type ExportActions = {
  onExportDoc?: () => void | Promise<void>;
  onExportMarkdown?: () => void | Promise<void>;
  onExportPdf?: () => void | Promise<void>;
  onPreviewPdf?: () => void | Promise<void>;
  onPreviewPost?: () => void | Promise<void>;
  onClear?: () => void | Promise<void>;
  isExportingPdf?: boolean;
  onExportTxt?: () => void | Promise<void>;
};
export type EditorPageMode = "fluid" | "a4";

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
  messages: EditorMessages;
  locale: Locale;
  userPlan: "free" | "pro" | "team";
  documentTitle?: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  isLTSidebarOpen: boolean;
  setIsLTSidebarOpen: (value: boolean) => void;
  onSaveDocument: () => boolean;
  lastSavedAt: string | null;
  isSaving: boolean;
  saveStatus: "local" | "pending" | "saving" | "saved" | "error";
  isMobile: boolean;
  onImportMarkdown?: () => void | Promise<void>;
  pageMode: EditorPageMode;
  togglePageMode: () => void;
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
  locale?: Locale;
  userPlan?: "free" | "pro" | "team";
  documentTitle?: string;
  onImportMarkdown?: () => void | Promise<void>;
  pageMode?: EditorPageMode;
};
export const TiptapProvider = ({
  children,
  editorOptions,
  editorProps,
  slotBefore,
  slotAfter,
  exportActions,
  locale,
  documentTitle,
  onImportMarkdown,
  pageMode: initialPageMode = "fluid",
}: TiptapProviderProps) => {
  const userPlan = "free";
  const contentElement = useRef<HTMLDivElement>(null);
  const editor = useTiptapEditor(editorOptions);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [pageMode, setPageMode] = useState<EditorPageMode>(initialPageMode);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "local" | "pending" | "saving" | "saved" | "error"
  >("local");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const lastAutosavedContent = useRef<string>("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const documentId = searchParams.get("docId");
  const savedIdRef = useRef<string | undefined>(undefined);
  const savingRef = useRef(false);

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
  const localMessages = getAcquisitionContent(normalizedLocale);

  // Sync spellcheck attribute with settings
  useEffect(() => {
    if (!editor) return;
    editor.setOptions({
      editorProps: {
        ...editor.options.editorProps,
        attributes: {
          ...editor.options.editorProps.attributes,
          spellcheck: buttonVisibility.browserSpellcheck ? "true" : "false",
        },
      },
    });
  }, [editor, buttonVisibility.browserSpellcheck]);

  const snapshot = useCallback(
    () =>
      JSON.stringify({
        content: editor?.getJSON(),
        title: documentTitle?.trim() || localMessages.untitled,
      }),
    [editor, documentTitle, localMessages.untitled],
  );

  useEffect(() => {
    const localId = documentId?.startsWith("local-") ? documentId : undefined;
    if (savedIdRef.current === localId && localId) return;
    savedIdRef.current = localId;
    lastAutosavedContent.current = "";
    setLastSavedAt(null);
    setSaveStatus("local");
    if (localId) {
      try {
        const doc = getLocalDocumentById(localId);
        if (doc) {
          lastAutosavedContent.current = JSON.stringify({
            content: doc.content,
            title: doc.title,
          });
          setLastSavedAt(doc.updatedAt);
        }
      } catch {
        setSaveStatus("error");
      }
    }
  }, [documentId]);

  const handleSaveDocument = useCallback(
    (notify = true): boolean => {
      if (!editor) return true;
      if (savingRef.current) return false;
      if (editor.isEmpty && !documentTitle?.trim() && !savedIdRef.current)
        return true;
      const current = snapshot();
      if (current === lastAutosavedContent.current) {
        setSaveStatus("saved");
        return true;
      }
      savingRef.current = true;
      setIsSaving(true);
      setSaveStatus("saving");
      try {
        const savedDoc = saveLocalDocument({
          id: savedIdRef.current,
          content: editor.getJSON(),
          title: documentTitle?.trim() || localMessages.untitled,
        });
        savedIdRef.current = savedDoc.id;
        lastAutosavedContent.current = current;
        setLastSavedAt(savedDoc.updatedAt);
        setSaveStatus("saved");
        if (notify) setShowSuccess(true);
        if (documentId !== savedDoc.id) {
          const home = normalizedLocale === "pt" ? "/" : `/${normalizedLocale}`;
          router.replace(`${home}?docId=${encodeURIComponent(savedDoc.id)}`, {
            scroll: false,
          });
        }
        return true;
      } catch {
        setSaveStatus("error");
        if (notify) toast.error(localMessages.saveError);
        return false;
      } finally {
        savingRef.current = false;
        setIsSaving(false);
      }
    },
    [
      editor,
      documentId,
      documentTitle,
      snapshot,
      router,
      normalizedLocale,
      localMessages.untitled,
      localMessages.saveError,
    ],
  );

  useEffect(() => {
    if (!editor) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      if (editor.isEmpty && !documentTitle?.trim() && !savedIdRef.current) {
        setSaveStatus("local");
        return;
      }
      setSaveStatus("pending");
      timer = setTimeout(() => handleSaveDocument(false), 1500);
    };
    editor.on("update", schedule);
    schedule();
    return () => {
      clearTimeout(timer);
      editor.off("update", schedule);
    };
  }, [editor, documentTitle, snapshot, handleSaveDocument]);

  useEffect(() => {
    const persistBeforeLeave = (event: Event) => {
      if (!handleSaveDocument(false)) {
        event.preventDefault();
        toast.error(localMessages.saveError);
      }
    };
    const persistWhenHidden = () => {
      if (document.visibilityState === "hidden") handleSaveDocument(false);
    };
    const persistBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!handleSaveDocument(false)) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("editordetexto:before-leave", persistBeforeLeave);
    window.addEventListener("beforeunload", persistBeforeUnload);
    document.addEventListener("visibilitychange", persistWhenHidden);
    return () => {
      window.removeEventListener(
        "editordetexto:before-leave",
        persistBeforeLeave,
      );
      window.removeEventListener("beforeunload", persistBeforeUnload);
      document.removeEventListener("visibilitychange", persistWhenHidden);
    };
  }, [handleSaveDocument, localMessages.saveError]);

  useEffect(() => {
    const forgetDeleted = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== savedIdRef.current) return;
      savedIdRef.current = undefined;
      lastAutosavedContent.current = "";
      setLastSavedAt(null);
      setSaveStatus("local");
    };
    window.addEventListener("editordetexto:delete-document", forgetDeleted);
    return () =>
      window.removeEventListener(
        "editordetexto:delete-document",
        forgetDeleted,
      );
  }, []);

  // Update shortcuts extension options
  useEffect(() => {
    if (!editor) return;
    editor.setOptions({
      shortcuts: {
        // Arquivo e Controle
        onSave: handleSaveDocument,
        onOpenDocuments: () => {
          if (
            window.dispatchEvent(
              new Event("editordetexto:before-leave", { cancelable: true }),
            )
          )
            setIsDocumentsDialogOpen(true);
        },
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
        if (
          window.dispatchEvent(
            new Event("editordetexto:before-leave", { cancelable: true }),
          )
        )
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
      {...editorProps}
      style={
        isFullScreen
          ? ({
              ...editorProps?.style,
              "--rte-editor-min-height": "auto",
              "--rte-editor-max-height": "none",
            } as React.CSSProperties)
          : editorProps?.style
      }
      className={clsx(
        "rte-editor",
        pageMode === "a4" && "rte-editor--page-a4",
        isFullScreen && "rte-editor--fullscreen",
        isSidebarOpen && "rte-editor--with-sidebar",
        isLTSidebarOpen && "rte-editor--with-lt-sidebar",
      )}
    >
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
      {isLTSidebarOpen && <LanguageToolSidebar isOpen />}
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
        messages,
        locale: normalizedLocale,
        userPlan,
        documentTitle,
        isSidebarOpen,
        setIsSidebarOpen,
        isLTSidebarOpen,
        setIsLTSidebarOpen,
        onSaveDocument: () => handleSaveDocument(true),
        lastSavedAt,
        isSaving,
        saveStatus,
        isMobile,
        onImportMarkdown,
        pageMode,
        togglePageMode: () =>
          setPageMode((mode) => (mode === "a4" ? "fluid" : "a4")),
      }}
    >
      {editorContent}
      {showSuccess && (
        <SaveNotification
          message={localMessages.saved}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </TiptapContext.Provider>
  );
};

export default TiptapProvider;
