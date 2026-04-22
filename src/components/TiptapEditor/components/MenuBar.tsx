import React, { memo } from "react";

import { Toolbar, ToolbarDivider } from "./ui/Toolbar";
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

const MenuBar = () => {
  const { exportActions } = useTiptapContext();
  const { buttonVisibility } = useEditorSettings();

  const showExport = Boolean(
    exportActions?.onExportDoc ||
    exportActions?.onExportPdf ||
    exportActions?.onExportTxt,
  );
  const showPreview = Boolean(
    exportActions?.onPreviewPdf || exportActions?.onPreviewPost,
  );

  return (
    <div className="rte-menu-bar">
      <Toolbar dense>
        {buttonVisibility.undo && <UndoButton />}
        {buttonVisibility.redo && <RedoButton />}
        {buttonVisibility.save && <SaveButton />}
        {buttonVisibility.clearFormat && <ClearFormatButton />}

        <ToolbarDivider />

        {buttonVisibility.bold && <BoldButton />}
        {buttonVisibility.italic && <ItalicButton />}
        {buttonVisibility.underline && <UnderlineButton />}
        {buttonVisibility.uppercase && <UppercaseButton />}
        {buttonVisibility.lowercase && <LowercaseButton />}
        {buttonVisibility.capitalize && <CapitalizeButton />}
        {buttonVisibility.moreMark && <MoreMarkDropdown />}

        <ToolbarDivider />

        {buttonVisibility.textColor && <TextColorButton />}
        {buttonVisibility.textHighlight && <TextHighlightButton />}

        <ToolbarDivider />

        {buttonVisibility.align && <AlignPopover />}
        {buttonVisibility.bulletList && <BulletListButton />}
        {buttonVisibility.orderedList && <OrderedListButton />}
        {buttonVisibility.lineHeight && <LineHeightDropdown />}

        <ToolbarDivider />

        {/* <BlockquoteButton /> */}
        {buttonVisibility.table && <TableButton />}
        {/* <ImageButton /> */}
        {/* <YoutubeButton /> */}
        {buttonVisibility.codeBlock && <CodeBlockButton />}
        {buttonVisibility.insert && <InsertDropdown />}
        {buttonVisibility.link && <LinkButton />}

        <ToolbarDivider />

        {buttonVisibility.heading && <HeadingDropdown />}
        {buttonVisibility.fontFamily && <FontFamilyDropdown />}
        {buttonVisibility.fontSize && <FontSizeDropdown />}
        {buttonVisibility.languageTool && <LanguageToolToggleButton />}
        {buttonVisibility.languageToolSidebar && <LanguageToolSidebarButton />}

        <ToolbarDivider />

        {showExport && buttonVisibility.export && <ExportDropdown />}
        {showPreview && buttonVisibility.preview && <PreviewDropdown />}
        {buttonVisibility.documents && <DocumentsButton />}
        {buttonVisibility.importPdf && <ImportPdfButton />}

        {buttonVisibility.copyEditor && <CopyEditorButton />}
        {buttonVisibility.copyEditor && <PasteEditorButton />}
        {exportActions?.onClear && buttonVisibility.clearEditor && (
          <ClearEditorButton />
        )}
        {buttonVisibility.searchReplace && <SearchReplacePopover />}
        <SettingsButton />

        <ToolbarDivider />
        {buttonVisibility.aiRewrite && <AiRewriteButton />}
      </Toolbar>
    </div>
  );
};

export default memo(MenuBar);
