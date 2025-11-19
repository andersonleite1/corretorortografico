import React from "react";
import MenuButton from "../MenuButton";
import { useEditorState } from "@tiptap/react";
import { useTiptapContext } from "../Provider";

const CodeBlockButton = () => {
  const { editor, messages } = useTiptapContext();
  const state = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        active: ctx.editor.isActive("codeBlock"),
        disabled: !ctx.editor.can().toggleCodeBlock(),
      };
    },
  });

  return (
    <MenuButton
      icon="Code"
      tooltip={messages.toolbar.codeBlock}
      onClick={() => editor.chain().focus().setCodeBlock().run()}
      {...state}
    />
  );
};

export default CodeBlockButton;
