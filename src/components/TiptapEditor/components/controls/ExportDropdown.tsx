import React, { useCallback } from "react";
import { getAcquisitionContent } from "@/data/acquisition";
import MenuButton from "../MenuButton";
import { DropdownMenuItem } from "../ui/DropdownMenu";
import { useTiptapContext } from "../Provider";

const ExportDropdown = () => {
  const { exportActions, messages, locale } = useTiptapContext();
  const t = getAcquisitionContent(locale);
  const onExportDoc = exportActions?.onExportDoc;
  const onExportMarkdown = exportActions?.onExportMarkdown;
  const onExportPdf = exportActions?.onExportPdf;
  const isExportingPdf = Boolean(exportActions?.isExportingPdf);
  const onExportTxt = exportActions?.onExportTxt;

  const hasAnyAction = Boolean(
    onExportDoc || onExportMarkdown || onExportPdf || onExportTxt,
  );
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
          text={t.wordDocx}
          icon="FileDoc"
          hideText={false}
          tooltip={false}
          onClick={handleExportDoc}
          disabled={!onExportDoc}
        />
      </DropdownMenuItem>
      <p
        className="px-3 py-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300"
        style={{ maxWidth: "17rem" }}
      >
        {t.wordHint}
      </p>
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
      <DropdownMenuItem asChild disabled={!onExportMarkdown}>
        <MenuButton
          text={messages.export.markdown}
          icon="FileDoc"
          hideText={false}
          tooltip={false}
          onClick={() => onExportMarkdown?.()}
          disabled={!onExportMarkdown}
        />
      </DropdownMenuItem>
      <DropdownMenuItem asChild disabled={!onExportPdf}>
        <MenuButton
          text={
            isExportingPdf ? messages.export.generatingPdf : messages.export.pdf
          }
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
