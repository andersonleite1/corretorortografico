import React, { useCallback } from "react";
import MenuButton from "../MenuButton";
import { DropdownMenuItem } from "../ui/DropdownMenu";
import { useTiptapContext } from "../Provider";

const PreviewDropdown = () => {
  const { exportActions } = useTiptapContext();
  const onPreviewPdf = exportActions?.onPreviewPdf;
  const onPreviewPost = exportActions?.onPreviewPost;
  const isExportingPdf = Boolean(exportActions?.isExportingPdf);

  const hasAnyAction = Boolean(onPreviewPdf || onPreviewPost);

  const handlePreviewPdf = useCallback(() => {
    onPreviewPdf?.();
  }, [onPreviewPdf]);

  const handlePreviewPost = useCallback(() => {
    onPreviewPost?.();
  }, [onPreviewPost]);

  if (!hasAnyAction) {
    return null;
  }

  return (
    <MenuButton
      type="dropdown"
      icon="Eye"
      text="Visualizar"
      hideText={false}
      tooltip="Visualizar"
      dropdownStyle={{ minWidth: "12rem" }}
    >
      <DropdownMenuItem asChild disabled={!onPreviewPdf}>
        <MenuButton
          text={isExportingPdf ? "Gerando PDF..." : "Visualizar PDF"}
          icon="FilePdf"
          hideText={false}
          tooltip={false}
          onClick={handlePreviewPdf}
          disabled={!onPreviewPdf || isExportingPdf}
        />
      </DropdownMenuItem>
      <DropdownMenuItem asChild disabled={!onPreviewPost}>
        <MenuButton
          text="Visualizar Post"
          icon="Eye"
          hideText={false}
          tooltip={false}
          onClick={handlePreviewPost}
          disabled={!onPreviewPost}
        />
      </DropdownMenuItem>
    </MenuButton>
  );
};

export default PreviewDropdown;
