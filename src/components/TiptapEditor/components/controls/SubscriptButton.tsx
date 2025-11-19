import React from "react";
import { Editor, useEditorState } from "@tiptap/react";
import MenuButton from "../MenuButton";
import { useTiptapContext } from "../Provider";

const SubscriptButton = () => {
  const { editor, messages } = useTiptapContext();

  const state = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        active: ctx.editor.isActive("subscript"),
        disabled: !ctx.editor.can().toggleSubscript(),
      };
    },
  });

  return (
    <MenuButton
      icon="Subscript"
      tooltip={messages.toolbar.subscript}
      shortcuts={["Mod", ","]}
      onClick={() => editor.chain().focus().toggleSubscript().run()}
      {...state}
    />
  );
};

export default SubscriptButton;
