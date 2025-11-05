import React, { useCallback } from "react";
import MenuButton from "../MenuButton";
import { DropdownMenuItem } from "../ui/DropdownMenu";
import { useTiptapContext } from "../Provider";

const ExportDropdown = () => {
  const { exportActions } = useTiptapContext();
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
      text="Exportar"
      hideText={false}
      tooltip="Exportar"
      dropdownStyle={{ minWidth: "11rem" }}
    >
      <DropdownMenuItem asChild disabled={!onExportDoc}>
        <MenuButton
          text="Exportar DOC"
          icon="FileDoc"
          hideText={false}
          tooltip={false}
          onClick={handleExportDoc}
          disabled={!onExportDoc}
        />
      </DropdownMenuItem>
      <DropdownMenuItem asChild disabled={!onExportTxt}>
        <MenuButton
          text="Exportar TXT"
          icon="FileTxt"
          hideText={false}
          tooltip={false}
          onClick={handleExportTxt}
          disabled={!onExportTxt}
        />
      </DropdownMenuItem>
      <DropdownMenuItem asChild disabled={!onExportPdf}>
        <MenuButton
          text={isExportingPdf ? "Gerando PDF..." : "Exportar PDF"}
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
