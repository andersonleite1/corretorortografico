import React, { memo, useState, useId, useRef } from "react";
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
import DocumentsButton from "./controls/DocumentsButton";
import ClearEditorButton from "./controls/ClearEditorButton";
import ImportPdfButton from "./controls/ImportPdfButton";
import CopyEditorButton from "./controls/CopyEditorButton";
import PasteEditorButton from "./controls/PasteEditorButton";
import SettingsButton from "./controls/SettingsButton";
import AiRewriteButton from "./controls/AiRewriteButton";
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
        {buttonVisibility.languageToolSidebar && <LanguageToolSidebarButton />}
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
        <SettingsButton />
        {buttonVisibility.aiRewrite && (
          <span className="rte-tools-ai">
            <AiRewriteButton />
          </span>
        )}
      </Toolbar>
    );
  };
  return (
    <div className="rte-menu-bar rte-menu-bar--progressive">
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverAnchor asChild>
          <Toolbar dense className="rte-toolbar--files" aria-label={t.myTexts}>
            {buttonVisibility.save && <SaveButton />}
            {buttonVisibility.documents && <DocumentsButton />}
            {showExport && buttonVisibility.export && <ExportDropdown />}
            <span className="rte-toolbar-spacer" />
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className="rte-category-trigger"
                aria-haspopup="dialog"
                aria-controls={panelId}
                aria-expanded={open && category === item}
                onClick={(event) => {
                  activeTrigger.current = event.currentTarget;
                  setCategory(item);
                  setOpen(!open || category !== item);
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
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            activeTrigger.current?.focus();
          }}
        >
          <div className="rte-tools-header">
            <span>{t.tools}</span>
            <button
              type="button"
              aria-label={t.close}
              onClick={() => setOpen(false)}
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
        {buttonVisibility.aiRewrite && (
          <span className="rte-toolbar-ai">
            <AiRewriteButton />
          </span>
        )}
      </Toolbar>
    </div>
  );
};

export default memo(MenuBar);
