import React from "react";
import { useEditorState } from "@tiptap/react";
import MenuButton from "../MenuButton";
import { useTiptapContext } from "../Provider";

const RedoButton = () => {
  const { editor, messages } = useTiptapContext();

  const state = useEditorState({
    editor,
    selector: (ctx) => ({
      disabled: !ctx.editor.can().redo(),
    }),
  });

  return (
    <MenuButton
      icon="Redo"
      tooltip={messages.toolbar.redo}
      shortcuts={["Mod", "Y"]}
      onClick={() => editor.chain().focus().redo().run()}
      {...state}
    />
  );
};

export default RedoButton;
