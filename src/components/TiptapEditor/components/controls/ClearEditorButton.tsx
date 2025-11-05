import React, { useCallback } from "react";
import MenuButton from "../MenuButton";
import { useTiptapContext } from "../Provider";

const ClearEditorButton = () => {
  const { exportActions } = useTiptapContext();
  const handleClear = useCallback(() => {
    exportActions?.onClear?.();
  }, [exportActions?.onClear]);

  if (!exportActions?.onClear) {
    return null;
  }

  return (
    <MenuButton
      icon="Trash"
      tooltip="Limpar"
      onClick={handleClear}
      aria-label="Limpar"
    />
  );
};

export default ClearEditorButton;
