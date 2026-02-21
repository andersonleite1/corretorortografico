import React, { memo } from "react";
import MenuButton from "../MenuButton";
import { useEditorSettings } from "@/components/providers/EditorSettingsProvider";
import { useAuth } from "@clerk/nextjs";

const SettingsButton = () => {
    const { isSettingsDialogOpen, setIsSettingsDialogOpen } = useEditorSettings();
    const { isSignedIn } = useAuth();

    if (!isSignedIn) {
        return null;
    }

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
