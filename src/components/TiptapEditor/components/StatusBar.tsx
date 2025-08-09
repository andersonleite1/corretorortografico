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
      </div>
    </div>
  );
};

export default memo(StatusBar);
