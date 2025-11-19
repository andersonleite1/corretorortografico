import React from "react";
import MenuButton from "../MenuButton";
import { useEditorState } from "@tiptap/react";
import { useTiptapContext } from "../Provider";

const OrderedListButton = () => {
  const { editor, messages } = useTiptapContext();
  const state = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        active: ctx.editor.isActive("orderedList"),
        disabled: !ctx.editor.isEditable,
      };
    },
  });

  return (
    <MenuButton
      icon="OrderedList"
      tooltip={messages.toolbar.orderedList}
      shortcuts={["Mod", "Shift", "7"]}
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
      {...state}
    />
  );
};

export default OrderedListButton;
