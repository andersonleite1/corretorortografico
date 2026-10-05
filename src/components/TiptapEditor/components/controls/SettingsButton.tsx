import React, { memo } from "react";
import MenuButton from "../MenuButton";
import { useEditorSettings } from "@/components/providers/EditorSettingsProvider";

const SettingsButton = () => {
  const { isSettingsDialogOpen, setIsSettingsDialogOpen } = useEditorSettings();

  return (
    <MenuButton
      icon="Settings"
      tooltip="Configurações do Editor"
      active={isSettingsDialogOpen}
      onClick={() => setIsSettingsDialogOpen(!isSettingsDialogOpen)}
    />
  );
};

export default memo(SettingsButton);
