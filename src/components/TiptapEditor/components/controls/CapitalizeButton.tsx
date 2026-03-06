import React from "react";
import MenuButton from "../MenuButton";
import { useEditorState } from "@tiptap/react";
import { useTiptapContext } from "../Provider";

const CapitalizeButton = () => {
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
            icon="Capitalize"
            tooltip="Primeira Letra Maiúscula"
            onClick={() => (editor as any).commands.setTextCase("capitalize")}
            {...state}
        />
    );
};

export default CapitalizeButton;
