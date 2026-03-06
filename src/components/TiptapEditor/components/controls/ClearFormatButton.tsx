import React from "react";
import MenuButton from "../MenuButton";
import { useEditorState } from "@tiptap/react";
import { useTiptapContext } from "../Provider";

const ClearFormatButton = () => {
  const { editor, messages } = useTiptapContext();

  const state = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        disabled: !ctx.editor.isEditable,
      };
    },
  });

  return (
    <MenuButton
      icon="Eraser"
      tooltip={messages.toolbar.clearFormat}
      onClick={() =>
        editor.chain().focus().unsetAllMarks().clearNodes().run()
      }
      {...state}
    />
  );
};

export default ClearFormatButton;
