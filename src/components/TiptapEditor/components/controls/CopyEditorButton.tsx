import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import MenuButton from "../MenuButton";
import { useTiptapContext } from "../Provider";
import Icon from "../ui/Icon";

const CopyEditorButton = () => {
  const { editor, messages, contentElement } = useTiptapContext();
  const [isToastVisible, setIsToastVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = useCallback(async () => {
    if (!editor || typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(editor.getText());
      setIsToastVisible(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setIsToastVisible(false), 2000);
    } catch (error) {
      console.error(error);
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
        icon="Clipboard"
        tooltip={messages.toolbar.copyEditor}
        onClick={handleCopy}
        aria-label={messages.toolbar.copyEditor}
      />
      {isToastVisible && toastContainer
        ? createPortal(
            <div className="rte-toast" role="status" aria-live="polite">
              <Icon name="Check" size={16} />
              <span>{messages.notifications.copySuccess}</span>
            </div>,
            toastContainer
          )
        : null}
    </>
  );
};

export default CopyEditorButton;
