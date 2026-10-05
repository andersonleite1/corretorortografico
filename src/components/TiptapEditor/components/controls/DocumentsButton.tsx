import { memo } from "react";
import MenuButton from "../MenuButton";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { useTiptapContext } from "../Provider";
import { getAcquisitionContent } from "@/data/acquisition";

function DocumentsButton() {
  const { setIsDocumentsDialogOpen } = useSidebar();
  const { locale } = useTiptapContext();
  const t = getAcquisitionContent(locale);
  return (
    <MenuButton
      icon="Drafts"
      text={t.myTexts}
      hideText={false}
      tooltip={t.documents}
      onClick={() => {
        if (
          window.dispatchEvent(
            new Event("editordetexto:before-leave", { cancelable: true }),
          )
        )
          setIsDocumentsDialogOpen(true);
      }}
    />
  );
}
export default memo(DocumentsButton);
