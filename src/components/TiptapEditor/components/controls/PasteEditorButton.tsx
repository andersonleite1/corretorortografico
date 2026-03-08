import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import MenuButton from "../MenuButton";
import { useTiptapContext } from "../Provider";
import Icon from "../ui/Icon";

const PasteEditorButton = () => {
    const { editor, messages, contentElement } = useTiptapContext();
    const [isToastVisible, setIsToastVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handlePaste = useCallback(async () => {
        if (
            !editor ||
            typeof navigator === "undefined" ||
            !navigator.clipboard?.readText
        ) {
            return;
        }

        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                editor.commands.insertContent(text);
                setIsToastVisible(true);
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(() => setIsToastVisible(false), 2000);
            }
        } catch (error) {
            console.error("Paste failed:", error);
            setIsToastVisible(false);
        }
    }, [editor]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    if (!editor) {
        return null;
    }

    const toastContainer = contentElement.current?.closest(".rte-editor") ?? null;

    return (
        <>
            <MenuButton
                icon="Paste"
                tooltip={messages.toolbar.pasteEditor}
                onClick={handlePaste}
                aria-label={messages.toolbar.pasteEditor}
            />
            {isToastVisible && toastContainer
                ? createPortal(
                    <div className="rte-toast" role="status" aria-live="polite">
                        <Icon name="Check" size={16} />
                        <span>{messages.notifications.pasteSuccess}</span>
                    </div>,
                    toastContainer,
                )
                : null}
        </>
    );
};

export default PasteEditorButton;
