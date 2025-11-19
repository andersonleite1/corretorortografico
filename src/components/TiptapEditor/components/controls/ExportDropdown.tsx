import React, { useCallback } from "react";
import MenuButton from "../MenuButton";
import { DropdownMenuItem } from "../ui/DropdownMenu";
import { useTiptapContext } from "../Provider";

const ExportDropdown = () => {
  const { exportActions, messages } = useTiptapContext();
  const onExportDoc = exportActions?.onExportDoc;
  const onExportPdf = exportActions?.onExportPdf;
  const isExportingPdf = Boolean(exportActions?.isExportingPdf);
  const onExportTxt = exportActions?.onExportTxt;

  const hasAnyAction = Boolean(onExportDoc || onExportPdf || onExportTxt);
  const handleExportDoc = useCallback(() => {
    onExportDoc?.();
  }, [onExportDoc]);

  const handleExportPdf = useCallback(() => {
    return onExportPdf?.();
  }, [onExportPdf]);

  const handleExportTxt = useCallback(() => {
    onExportTxt?.();
  }, [onExportTxt]);

  if (!hasAnyAction) {
    return null;
  }

  return (
    <MenuButton
      type="dropdown"
      icon="Download"
      text={messages.toolbar.export}
      hideText={false}
      tooltip={messages.toolbar.export}
      dropdownStyle={{ minWidth: "11rem" }}
    >
      <DropdownMenuItem asChild disabled={!onExportDoc}>
        <MenuButton
          text={messages.export.doc}
          icon="FileDoc"
          hideText={false}
          tooltip={false}
          onClick={handleExportDoc}
          disabled={!onExportDoc}
        />
      </DropdownMenuItem>
      <DropdownMenuItem asChild disabled={!onExportTxt}>
        <MenuButton
          text={messages.export.txt}
          icon="FileTxt"
          hideText={false}
          tooltip={false}
          onClick={handleExportTxt}
          disabled={!onExportTxt}
        />
      </DropdownMenuItem>
      <DropdownMenuItem asChild disabled={!onExportPdf}>
        <MenuButton
          text={isExportingPdf ? messages.export.generatingPdf : messages.export.pdf}
          icon="FilePdf"
          hideText={false}
          tooltip={false}
          onClick={handleExportPdf}
          disabled={!onExportPdf || isExportingPdf}
        />
      </DropdownMenuItem>
    </MenuButton>
  );
};

export default ExportDropdown;
