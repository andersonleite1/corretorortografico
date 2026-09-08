import React, { memo, useState } from "react";
import clsx from "clsx";
import { useEditorState } from "@tiptap/react";
import { Toolbar } from "./ui/Toolbar";
import MenuButton from "./MenuButton";
import { useTiptapContext } from "./Provider";
import { useEditorSettings } from "@/components/providers/EditorSettingsProvider";
import { ShortcutsDialog } from "@/components/shared/ShortcutsDialog";
import { useSidebar } from "@/components/providers/SidebarProvider";

const StatusBar = () => {
  const {
    editor,
    isFullScreen,
    isSourceMode,
    toggleFullScreen,
    toggleSourceMode,
    messages,
    isMobile,
  } = useTiptapContext();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const { buttonVisibility } = useEditorSettings();
  const [isShortcutsDialogOpen, setIsShortcutsDialogOpen] = useState(false);
  const counter = useEditorState({
    editor,
    selector: (ctx) => ({
      words: ctx.editor.storage.characterCount.words(),
      characters: ctx.editor.storage.characterCount.characters(),
    }),
  });
  const languageTool = useEditorState({
    editor,
    selector: (ctx) => {
      const storage = (ctx.editor.storage as any).languageTool;
      return {
        enabled: storage?.enabled ?? false,
        status: storage?.status ?? "idle",
        count: storage?.issues?.length ?? 0,
        message: storage?.message ?? null,
      };
    },
  });

  const spellcheckLabel = (() => {
    if (!languageTool.enabled) {
      return null;
    }

    switch (languageTool.status) {
      case "checking":
        return messages.statusBar.spellcheck.checking;
      case "ready":
        return messages.statusBar.spellcheck.ready(languageTool.count);
      case "rate_limited":
        return messages.statusBar.spellcheck.rateLimited;
      case "error":
        return messages.statusBar.spellcheck.error;
      default:
        return null;
    }
  })();

  return (
    <div className="rte-status-bar">
      <Toolbar dense>
        {!isMobile && buttonVisibility.documents && (
          <MenuButton
            icon="Columns"
            tooltip="Mostrar na Lateral Meus Documentos"
            active={isSidebarOpen}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        )}
        {buttonVisibility.sourceCode && (
          <MenuButton
            icon="SourceCode"
            text={messages.statusBar.source}
            active={isSourceMode}
            onClick={toggleSourceMode}
          />
        )}
        {/* Shortcuts Dialog Button — only visible on desktop, before fullscreen */}
        {!isMobile && buttonVisibility.shortcuts && (
          <MenuButton
            icon="Keyboard"
            tooltip="Atalhos de Teclado"
            active={isShortcutsDialogOpen}
            onClick={() => setIsShortcutsDialogOpen(true)}
          />
        )}
        {buttonVisibility.fullScreen && (
          <MenuButton
            icon={isFullScreen ? "Minimize" : "Maximize"}
            text={messages.statusBar.fullscreen}
            active={isFullScreen}
            onClick={toggleFullScreen}
          />
        )}

        <div className="flex items-center gap-2 px-3 py-1 ml-2 rounded-full bg-gray-100 dark:bg-white/5 text-[10px] font-bold uppercase tracking-wider">
          <div
            className={clsx(
              "w-1.5 h-1.5 rounded-full",
              !!useTiptapContext().documentTitle ||
                !!new URLSearchParams(window.location.search).get("docId")
                ? "bg-green-500"
                : "bg-amber-500",
            )}
          />
          <span
            className={clsx(
              !!useTiptapContext().documentTitle ||
                !!new URLSearchParams(window.location.search).get("docId")
                ? "text-green-500"
                : "text-amber-500",
            )}
          >
            {!!useTiptapContext().documentTitle ||
            !!new URLSearchParams(window.location.search).get("docId")
              ? "Sincronizado"
              : "Local"}
          </span>
        </div>
      </Toolbar>

      <div className="rte-counter">
        <span className="rte-word-count">
          {messages.statusBar.words}: {counter.words}
        </span>
        <span className="rte-charater">
          {messages.statusBar.characters}: {counter.characters}
        </span>
        {spellcheckLabel && (
          <span
            className="rte-spellcheck"
            data-status={languageTool.status}
            title={languageTool.message ?? undefined}
          >
            {spellcheckLabel}
          </span>
        )}
      </div>

      {/* Shortcuts Dialog */}
      <ShortcutsDialog
        isOpen={isShortcutsDialogOpen}
        onClose={() => setIsShortcutsDialogOpen(false)}
      />
    </div>
  );
};

export default memo(StatusBar);
