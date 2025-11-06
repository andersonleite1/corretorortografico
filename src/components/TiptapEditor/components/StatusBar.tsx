import React, { memo } from "react";
import { useEditorState } from "@tiptap/react";
import { Toolbar } from "./ui/Toolbar";
import MenuButton from "./MenuButton";
import { useTiptapContext } from "./Provider";

const StatusBar = () => {
  const { editor, isFullScreen, isSourceMode, toggleFullScreen, toggleSourceMode } =
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
      const storage = ctx.editor.storage.languageTool;
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
        return "Revisando…";
      case "ready":
        return `Sugestões: ${languageTool.count}`;
      case "rate_limited":
        return "Limite atingido";
      case "error":
        return "Indisponível";
      default:
        return null;
    }
  })();

  return (
    <div className="rte-status-bar">
      <Toolbar dense>
        <MenuButton
          icon="SourceCode"
          text="Código Fonte"
          active={isSourceMode}
          onClick={toggleSourceMode}
        />
        <MenuButton
          icon={isFullScreen ? "Minimize" : "Maximize"}
          text="Tela cheia"
          active={isFullScreen}
          onClick={toggleFullScreen}
        />
      </Toolbar>

      <div className="rte-counter">
        <span className="rte-word-count">Palavras: {counter.words}</span>
        <span className="rte-charater">Caracteres: {counter.characters}</span>
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
