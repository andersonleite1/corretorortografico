import React, { memo } from "react";
import MenuButton from "../MenuButton";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { useAuth } from "@clerk/nextjs";
import { useTiptapContext } from "../Provider";

const DocumentsButton = () => {
  const {
    setIsDocumentsDialogOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    isMobile,
  } = useSidebar();
  const { isSignedIn } = useAuth();
  const {} = useTiptapContext();

  if (!isSignedIn) return null;

  return (
    <>
      <MenuButton
        text="Documentos"
        icon="Drafts"
        hideText={false}
        tooltip="Meus Documentos"
        onClick={() => setIsDocumentsDialogOpen(true)}
      />
    </>
  );
};

export default memo(DocumentsButton);
