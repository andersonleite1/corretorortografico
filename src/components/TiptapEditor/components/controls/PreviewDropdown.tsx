import React, { useCallback } from "react";
import MenuButton from "../MenuButton";
import { DropdownMenuItem } from "../ui/DropdownMenu";
import { useTiptapContext } from "../Provider";

const PreviewDropdown = () => {
  const { exportActions, messages } = useTiptapContext();
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
      text={messages.toolbar.preview}
      hideText={false}
      tooltip={messages.toolbar.preview}
      dropdownStyle={{ minWidth: "12rem" }}
    >
      <DropdownMenuItem asChild disabled={!onPreviewPdf}>
        <MenuButton
          text={
            isExportingPdf
              ? messages.preview.generatingPdf
              : messages.preview.pdf
          }
          icon="FilePdf"
          hideText={false}
          tooltip={false}
          onClick={handlePreviewPdf}
          disabled={!onPreviewPdf || isExportingPdf}
        />
      </DropdownMenuItem>
      <DropdownMenuItem asChild disabled={!onPreviewPost}>
        <MenuButton
          text={messages.preview.post}
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
