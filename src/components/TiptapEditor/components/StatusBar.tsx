import React, { memo, useState } from "react";
import { getAcquisitionContent } from "@/data/acquisition";
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
    isMobile,
    pageMode,
    togglePageMode,
    locale,
    saveStatus,
    lastSavedAt,
  } = useTiptapContext();
  const localMessages = getAcquisitionContent(locale);
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
        <MenuButton
          icon="FileDoc"
          tooltip={pageMode === "a4" ? "Usar modo fluido" : "Usar modo A4"}
          active={pageMode === "a4"}
          onClick={togglePageMode}
        />
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

        <span
          className="rte-local-status"
          role="status"
          aria-live="polite"
          data-status={saveStatus}
          title={`${localMessages.savedHint}. ${localMessages.localNote}`}
        >
          {saveStatus === "saved" && lastSavedAt
            ? `${localMessages.savedAt} ${new Date(lastSavedAt).toLocaleTimeString(locale === "pt" ? "pt-BR" : locale, { hour: "2-digit", minute: "2-digit" })}`
            : localMessages[saveStatus === "error" ? "saveError" : saveStatus]}
        </span>
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
