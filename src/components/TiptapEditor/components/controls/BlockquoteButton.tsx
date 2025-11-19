import React from "react";
import { useTiptapContext } from "../Provider";
import { useEditorState } from "@tiptap/react";
import MenuButton from "../MenuButton";

const BlockquoteButton = () => {
  const { editor, messages } = useTiptapContext();
  const state = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        active: ctx.editor.isActive("blockquote"),
        disabled: !ctx.editor.can().toggleBlockquote(),
      };
    },
  });

  return (
    <MenuButton
      icon="Quote"
      tooltip={messages.toolbar.blockquote}
      shortcuts={["Mod", "Shift", "B"]}
      onClick={() => editor.chain().focus().toggleBlockquote().run()}
      {...state}
    />
  );
};

export default BlockquoteButton;
