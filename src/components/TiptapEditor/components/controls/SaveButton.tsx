import React from "react";
import { getAcquisitionContent } from "@/data/acquisition";
import MenuButton from "../MenuButton";
import { useTiptapContext } from "../Provider";

export const SaveButton = () => {
  const { locale, messages, onSaveDocument, isSaving } = useTiptapContext();

  return (
    <MenuButton
      icon="Save"
      text={getAcquisitionContent(locale).save}
      hideText={false}
      onClick={() => onSaveDocument()}
      disabled={isSaving}
      tooltip={messages.toolbar.save}
    />
  );
};

export default SaveButton;
