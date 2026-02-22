import React, { memo } from "react";
import MenuButton from "../MenuButton";
import { useSidebar } from "@/components/providers/SidebarProvider";

const DocumentsButton = () => {
    const { setIsDocumentsDialogOpen, isSidebarOpen, setIsSidebarOpen, isMobile } = useSidebar();

    return (
        <>
            <MenuButton
                text="Documentos"
                icon="Drafts"
                hideText={false}
                tooltip="Meus Documentos"
                onClick={() => setIsDocumentsDialogOpen(true)}
            />
            {!isMobile && (
                <MenuButton
                    icon="Columns"
                    tooltip="Mostrar na Lateral Meus Documentos"
                    active={isSidebarOpen}
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                />
            )}
        </>
    );
};

export default memo(DocumentsButton);
