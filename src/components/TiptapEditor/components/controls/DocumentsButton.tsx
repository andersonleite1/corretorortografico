import React, { memo } from "react";
import MenuButton from "../MenuButton";
import { useSidebar } from "@/components/providers/SidebarProvider";

const DocumentsButton = () => {
    const { setIsDocumentsDialogOpen } = useSidebar();

    return (
        <MenuButton
            text="Documentos"
            icon="Drafts" // Usando o mesmo ícone de rascunhos ou um similar se disponível
            hideText={false}
            tooltip="Meus Documentos"
            onClick={() => setIsDocumentsDialogOpen(true)}
        />
    );
};

export default memo(DocumentsButton);
