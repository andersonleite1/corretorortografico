import React, { useCallback } from "react";
import MenuButton from "../MenuButton";
import { useTiptapContext } from "../Provider";

const ClearEditorButton = () => {
  const { exportActions, messages } = useTiptapContext();
  const handleClear = useCallback(() => {
    exportActions?.onClear?.();
  }, [exportActions?.onClear]);

  if (!exportActions?.onClear) {
    return null;
  }

  return (
    <MenuButton
      icon="Trash"
      tooltip={messages.toolbar.clearEditor}
      onClick={handleClear}
      aria-label={messages.toolbar.clearEditor}
    />
  );
};

export default ClearEditorButton;
