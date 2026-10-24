import React, { memo, useState, useId, useRef, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/Popover";

import { getAcquisitionContent } from "@/data/acquisition";
import { Toolbar, ToolbarDivider } from "./ui/Toolbar";
import MenuButton from "./MenuButton";
import { useTiptapContext } from "./Provider";
import { useEditorSettings } from "@/components/providers/EditorSettingsProvider";

import BoldButton from "./controls/BoldButton";
import ItalicButton from "./controls/ItalicButton";
import UndoButton from "./controls/UndoButton";
import RedoButton from "./controls/RedoButton";
import UnderlineButton from "./controls/UnderlineButton";
import SaveButton from "./controls/SaveButton";
import AlignPopover from "./controls/AlignPopover";
import HeadingDropdown from "./controls/HeadingDropdown";

import BulletListButton from "./controls/BulletListButton";
import OrderedListButton from "./controls/OrderedList";
import MoreMarkDropdown from "./controls/MoreMarkPopover";
import LinkButton from "./controls/LinkButton";
import CodeBlockButton from "./controls/CodeBlockButton";

import TextColorButton from "./controls/TextColorButton";
import TextHighlightButton from "./controls/TextHighlightButton";
import InsertDropdown from "./controls/InsertDropdown";
import TableButton from "@/components/TiptapEditor/components/controls/TableButton";
import FontFamilyDropdown from "./controls/FontFamilyDropdown";
import FontSizeDropdown from "./controls/FontSizeDropdown";
import LineHeightDropdown from "./controls/LineHeightDropdown";
import LanguageToolToggleButton from "./controls/LanguageToolToggleButton";
import LanguageToolSidebarButton from "./controls/LanguageToolSidebarButton";
import ExportDropdown from "./controls/ExportDropdown";
import PreviewDropdown from "./controls/PreviewDropdown";
import ClearEditorButton from "./controls/ClearEditorButton";
import ImportPdfButton from "./controls/ImportPdfButton";
import CopyEditorButton from "./controls/CopyEditorButton";
import PasteEditorButton from "./controls/PasteEditorButton";
import ClearFormatButton from "./controls/ClearFormatButton";
import UppercaseButton from "./controls/UppercaseButton";
import LowercaseButton from "./controls/LowercaseButton";
import CapitalizeButton from "./controls/CapitalizeButton";
import SearchReplacePopover from "./controls/SearchReplacePopover";
import EmojiButton from "./controls/EmojiButton";

const MenuBar = () => {
  const { exportActions, onImportMarkdown, locale } = useTiptapContext();
  const t = getAcquisitionContent(locale);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<"format" | "insert" | "utilities">(
    "format",
  );
  const panelId = useId();
  const activeTrigger = useRef<HTMLButtonElement | null>(null);
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverOpened = useRef(false);
  const hoverClosing = useRef(false);
  const { buttonVisibility } = useEditorSettings();

  const showExport = Boolean(
    exportActions?.onExportDoc ||
    exportActions?.onExportMarkdown ||
    exportActions?.onExportPdf ||
    exportActions?.onExportTxt,
  );
  const showPreview = Boolean(
    exportActions?.onPreviewPdf || exportActions?.onPreviewPost,
  );

  const clearHoverClose = () => {
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
    hoverCloseTimer.current = null;
  };
  const scheduleHoverClose = () => {
    if (!hoverOpened.current) return;
    clearHoverClose();
    hoverCloseTimer.current = setTimeout(() => {
      hoverOpened.current = false;
      hoverClosing.current = true;
      setOpen(false);
    }, 250);
  };
  useEffect(() => () => clearHoverClose(), []);

  const categories = ["format", "insert", "utilities"] as const;
  const renderTools = () => {
    if (category === "format")
      return (
        <Toolbar className="rte-tools-grid">
          {buttonVisibility.heading && (
            <span className="rte-mobile-heading">
              <HeadingDropdown />
            </span>
          )}
          {buttonVisibility.fontFamily && <FontFamilyDropdown />}
          {buttonVisibility.fontSize && <FontSizeDropdown />}
          {buttonVisibility.textColor && <TextColorButton />}
          {buttonVisibility.textHighlight && <TextHighlightButton />}
          {buttonVisibility.align && <AlignPopover />}
          {buttonVisibility.lineHeight && <LineHeightDropdown />}
          {buttonVisibility.moreMark && <MoreMarkDropdown />}
          {buttonVisibility.clearFormat && <ClearFormatButton />}
          {buttonVisibility.uppercase && <UppercaseButton />}
          {buttonVisibility.lowercase && <LowercaseButton />}
          {buttonVisibility.capitalize && <CapitalizeButton />}
        </Toolbar>
      );
    if (category === "insert")
      return (
        <Toolbar className="rte-tools-grid">
          {buttonVisibility.table && <TableButton />}
          {buttonVisibility.link && <LinkButton />}
          {buttonVisibility.insert && <InsertDropdown />}
          {buttonVisibility.codeBlock && <CodeBlockButton />}
          {buttonVisibility.emoji && <EmojiButton />}
        </Toolbar>
      );
    return (
      <Toolbar className="rte-tools-grid">
        {buttonVisibility.languageTool && <LanguageToolToggleButton />}
        {showPreview && buttonVisibility.preview && <PreviewDropdown />}
        {buttonVisibility.importPdf && <ImportPdfButton />}
        {onImportMarkdown && (
          <MenuButton
            icon="FileDoc"
            text={t.importMarkdown}
            hideText={false}
            onClick={() => onImportMarkdown()}
          />
        )}
        {buttonVisibility.copyEditor && <CopyEditorButton />}
        {buttonVisibility.copyEditor && <PasteEditorButton />}
        {exportActions?.onClear && buttonVisibility.clearEditor && (
          <ClearEditorButton />
        )}
        {buttonVisibility.searchReplace && <SearchReplacePopover />}
      </Toolbar>
    );
  };
  return (
    <div className="rte-menu-bar rte-menu-bar--progressive">
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) hoverOpened.current = false;
          setOpen(nextOpen);
        }}
        modal={false}
      >
        <PopoverAnchor asChild>
          <Toolbar dense className="rte-toolbar--files" aria-label={t.tools}>
            {buttonVisibility.save && <SaveButton />}
            {showExport && buttonVisibility.export && <ExportDropdown />}
            {buttonVisibility.languageToolSidebar && <LanguageToolSidebarButton />}
            <span className="rte-toolbar-spacer" />
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className="rte-category-trigger"
                aria-haspopup="dialog"
                aria-controls={panelId}
                aria-expanded={open && category === item}
                onPointerEnter={(event) => {
                  if (
                    event.pointerType !== "mouse" ||
                    !window.matchMedia("(hover: hover) and (pointer: fine)").matches
                  ) return;
                  clearHoverClose();
                  activeTrigger.current = event.currentTarget;
                  setCategory(item);
                  hoverOpened.current = true;
                  setOpen(true);
                }}
                onPointerLeave={scheduleHoverClose}
                onPointerDownCapture={() => {
                  if (hoverOpened.current) {
                    clearHoverClose();
                  }
                }}
                onClick={(event) => {
                  activeTrigger.current = event.currentTarget;
                  setCategory(item);
                  const isHoverOpen = hoverOpened.current;
                  hoverOpened.current = false;
                  setOpen(isHoverOpen ? true : !open || category !== item);
                }}
              >
                {t[item]}
              </button>
            ))}
            <button
              type="button"
              className="rte-mobile-tools-toggle"
              aria-label={t.tools}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={(event) => {
                activeTrigger.current = event.currentTarget;
                setOpen(!open);
              }}
            >
              <SlidersHorizontal size={18} aria-hidden="true" />
            </button>
          </Toolbar>
        </PopoverAnchor>
        <PopoverContent
          id={panelId}
          aria-label={t.tools}
          className="rte-tools-panel"
          side="bottom"
          align="end"
          collisionPadding={12}
          onOpenAutoFocus={(event) => {
            if (hoverOpened.current) event.preventDefault();
          }}
          onPointerEnter={clearHoverClose}
          onPointerLeave={scheduleHoverClose}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (hoverClosing.current) {
              hoverClosing.current = false;
              return;
            }
            activeTrigger.current?.focus();
          }}
        >
          <div className="rte-tools-header">
            <span>{t.tools}</span>
            <button
              type="button"
              aria-label={t.close}
              onClick={() => {
                hoverOpened.current = false;
                setOpen(false);
              }}
            >
              <X size={18} />
            </button>
          </div>
          <div className="rte-tools-tabs" role="group" aria-label={t.tools}>
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {t[item]}
              </button>
            ))}
          </div>
          <div className="rte-tools-body" role="group" aria-label={t[category]}>
            {renderTools()}
          </div>
        </PopoverContent>
      </Popover>
      <Toolbar dense className="rte-toolbar--formatting" aria-label={t.format}>
        {buttonVisibility.undo && <UndoButton />}
        {buttonVisibility.redo && <RedoButton />}
        <ToolbarDivider />
        {buttonVisibility.bold && <BoldButton />}
        {buttonVisibility.italic && <ItalicButton />}
        {buttonVisibility.underline && <UnderlineButton />}
        {buttonVisibility.bulletList && <BulletListButton />}
        {buttonVisibility.orderedList && <OrderedListButton />}
        <ToolbarDivider />
        {buttonVisibility.heading && (
          <span className="rte-desktop-heading">
            <HeadingDropdown />
          </span>
        )}
      </Toolbar>
    </div>
  );
};

export default memo(MenuBar);
