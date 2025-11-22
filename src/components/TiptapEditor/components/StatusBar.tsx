import React, { memo } from "react";
import { useEditorState } from "@tiptap/react";
import { Toolbar } from "./ui/Toolbar";
import MenuButton from "./MenuButton";
import { useTiptapContext } from "./Provider";

const StatusBar = () => {
  const {
    editor,
    isFullScreen,
    isSourceMode,
    toggleFullScreen,
    toggleSourceMode,
    messages,
  } =
    useTiptapContext();
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
        <MenuButton
          icon="SourceCode"
          text={messages.statusBar.source}
          active={isSourceMode}
          onClick={toggleSourceMode}
        />
        <MenuButton
          icon={isFullScreen ? "Minimize" : "Maximize"}
          text={messages.statusBar.fullscreen}
          active={isFullScreen}
          onClick={toggleFullScreen}
        />
        <span className="rte-word-count" onClick={toggleFullScreen}>
          {messages.statusBar.toggleHint(isFullScreen)}
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
    </div>
  );
};

export default memo(StatusBar);
