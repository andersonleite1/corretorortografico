import React from "react";
import MenuButton from "../MenuButton";
import { useTiptapContext } from "../Provider";

export const SaveButton = () => {
  const { messages, onSaveDocument, isSaving } = useTiptapContext();

  return (
    <MenuButton
      icon="Save"
      text={messages.toolbar.save}
      onClick={onSaveDocument}
      disabled={isSaving}
      tooltip={messages.toolbar.save}
    />
  );
};

export default SaveButton;
