import React from "react";
import MenuButton from "../MenuButton";
import { useEditorState } from "@tiptap/react";
import { useTiptapContext } from "../Provider";

const BulletListButton = () => {
  const { editor, messages } = useTiptapContext();
  const state = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        active: ctx.editor.isActive("bulletList"),
        disabled: !ctx.editor.isEditable,
      };
    },
  });

  return (
    <MenuButton
      icon="BulletList"
      tooltip={messages.toolbar.bulletList}
      shortcuts={["Mod", "Shift", "8"]}
      onClick={() => editor.chain().focus().toggleBulletList().run()}
      {...state}
    />
  );
};

export default BulletListButton;
