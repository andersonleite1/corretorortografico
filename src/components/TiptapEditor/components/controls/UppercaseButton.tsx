import React from "react";
import MenuButton from "../MenuButton";
import { useEditorState } from "@tiptap/react";
import { useTiptapContext } from "../Provider";

const UppercaseButton = () => {
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
            icon="Uppercase"
            tooltip="Converter para Maiúsculas"
            onClick={() => (editor as any).commands.setTextCase("uppercase")}
            {...state}
        />
    );
};

export default UppercaseButton;
