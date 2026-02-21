import {
  createContext,
  HTMLAttributes,
  ReactNode,
  RefObject,
  useContext,
  useRef,
  useState,
} from "react";
import { EditorContent, type Editor } from "@tiptap/react";
import useTiptapEditor, { type UseTiptapEditorOptions } from "../hooks/useTiptapEditor";
import clsx from "clsx";
import CodeMirrorEditor from "@/components/SourceEditor/Editor";
import { type Locale, i18n } from "../../../../i18n-config";
import { getEditorMessages, type EditorMessages } from "../i18n/messages";
import SideBar from "./SideBar";
import LanguageToolSidebar from "./LanguageToolSidebar";
import { useSidebar } from "@/components/providers/SidebarProvider";

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
  editorProps,
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
  const [isLTSidebarOpen, setIsLTSidebarOpen] = useState(false);
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

  const normalizedLocale = (locale ?? i18n.defaultLocale) as Locale;
  const messages = getEditorMessages(normalizedLocale);

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
    <div className={clsx(
      "rte-editor",
      isFullScreen && "rte-editor--fullscreen",
      isSidebarOpen && "rte-editor--with-sidebar",
      isLTSidebarOpen && "rte-editor--with-lt-sidebar"
    )}>
      <SideBar isOpen={isSidebarOpen} />
      <div className="rte-editor__main">
        {slotBefore}
        <div className="rte-editor__container" onMouseDown={focusEditorViaContainer}>
          {isSourceMode ? (
            <CodeMirrorEditor initialContent={editor.getHTML() || ""} />
          ) : (
            <EditorContent ref={contentElement} editor={editor} className="rte-editor__content" />
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
      }}
    >
      {editorContent}
    </TiptapContext.Provider>
  );
};

export default TiptapProvider;
