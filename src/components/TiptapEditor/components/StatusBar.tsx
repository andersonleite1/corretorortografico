import React, { memo, useState } from "react";
import clsx from "clsx";
import { useEditorState } from "@tiptap/react";
import { Toolbar } from "./ui/Toolbar";
import MenuButton from "./MenuButton";
import { useTiptapContext } from "./Provider";
import { useEditorSettings } from "@/components/providers/EditorSettingsProvider";
import { ShortcutsDialog } from "@/components/shared/ShortcutsDialog";

const StatusBar = () => {
  const {
    editor,
    isFullScreen,
    isSourceMode,
    toggleFullScreen,
    toggleSourceMode,
    messages,
    draftActions,
    isMobile,
  } = useTiptapContext();
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
        {buttonVisibility.fullScreen && (
          <span
            className="rte-word-count hidden sm:inline"
            onClick={toggleFullScreen}
          >
            {messages.statusBar.toggleHint}
          </span>
        )}
        {draftActions?.savingStatus && draftActions.savingStatus !== "idle" && (
          <div className="flex items-center gap-2 px-3 py-1 ml-4 rounded-full bg-gray-100 dark:bg-white/5 text-[10px] font-bold uppercase tracking-wider animate-in fade-in duration-300">
            <div
              className={clsx(
                "w-1.5 h-1.5 rounded-full",
                draftActions.savingStatus === "saving" &&
                  "bg-blue-500 animate-pulse",
                draftActions.savingStatus === "saved" && "bg-green-500",
                draftActions.savingStatus === "error" && "bg-red-500",
              )}
            />
            <span
              className={clsx(
                draftActions.savingStatus === "saving" && "text-blue-500",
                draftActions.savingStatus === "saved" && "text-green-500",
                draftActions.savingStatus === "error" && "text-red-500",
              )}
            >
              {draftActions.savingStatus === "saving" && "Salvando rascunho..."}
              {draftActions.savingStatus === "saved" && "Rascunho salvo"}
              {draftActions.savingStatus === "error" && "Erro no rascunho"}
            </span>
          </div>
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
