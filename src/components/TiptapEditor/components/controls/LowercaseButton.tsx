import React from "react";
import MenuButton from "../MenuButton";
import { useEditorState } from "@tiptap/react";
import { useTiptapContext } from "../Provider";

const LowercaseButton = () => {
    const { editor } = useTiptapContext();

    const state = useEditorState({
        editor,
        selector: (ctx) => {
            return {
                disabled: !ctx.editor.isEditable || ctx.editor.state.selection.empty,
            };
        },
    });

    return (
        <MenuButton
            icon="Lowercase"
            tooltip="Converter para Minúsculas"
            onClick={() => (editor as any).commands.setTextCase("lowercase")}
            {...state}
        />
    );
};

export default LowercaseButton;
