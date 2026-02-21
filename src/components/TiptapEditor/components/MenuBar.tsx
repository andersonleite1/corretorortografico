import React, { memo } from "react";

import { Toolbar, ToolbarDivider } from "./ui/Toolbar";
import { useTiptapContext } from "./Provider";

import BoldButton from "./controls/BoldButton";
import ItalicButton from "./controls/ItalicButton";
import UndoButton from "./controls/UndoButton";
import RedoButton from "./controls/RedoButton";
import UnderlineButton from "./controls/UnderlineButton";
import SaveButton from "./controls/SaveButton";
import AlignPopover from "./controls/AlignPopover";
import HeadingDropdown from "./controls/HeadingDropdown";
import BlockquoteButton from "./controls/BlockquoteButton";
import BulletListButton from "./controls/BulletListButton";
import OrderedListButton from "./controls/OrderedList";
import MoreMarkDropdown from "./controls/MoreMarkPopover";
import LinkButton from "./controls/LinkButton";
import CodeBlockButton from "./controls/CodeBlockButton";
import ImageButton from "./controls/ImageButton2";
import YoutubeButton from "./controls/YoutubeButton";
import TextColorButton from "./controls/TextColorButton";
import TextHighlightButton from "./controls/TextHighlightButton";
import InsertDropdown from "./controls/InsertDropdown";
import TableButton from "@/components/TiptapEditor/components/controls/TableButton";
import FontFamilyDropdown from "./controls/FontFamilyDropdown";
import FontSizeDropdown from "./controls/FontSizeDropdown";
import LineHeightDropdown from "./controls/LineHeightDropdown";
import LanguageToolToggleButton from "./controls/LanguageToolToggleButton";
import LanguageToolSidebarButton from "./controls/LanguageToolSidebarButton";
import BrowserSpellcheckButton from "./controls/BrowserSpellcheckButton";
import ExportDropdown from "./controls/ExportDropdown";
import PreviewDropdown from "./controls/PreviewDropdown";
import DraftsDropdown from "./controls/DraftsDropdown";
import DocumentsButton from "./controls/DocumentsButton";
import ClearEditorButton from "./controls/ClearEditorButton";
import ImportPdfButton from "./controls/ImportPdfButton";
import CopyEditorButton from "./controls/CopyEditorButton";

const MenuBar = () => {
  const { exportActions, draftActions } = useTiptapContext();
  const showExport = Boolean(
    exportActions?.onExportDoc || exportActions?.onExportPdf || exportActions?.onExportTxt
  );
  const showPreview = Boolean(exportActions?.onPreviewPdf || exportActions?.onPreviewPost);
  const showDrafts = Boolean(draftActions);
  const hasExtraMenus = showExport || showPreview || showDrafts;

  return (
    <div className="rte-menu-bar">
      <Toolbar dense>
        <UndoButton />
        <RedoButton />
        <SaveButton />
        {/* <ClearFormatButton /> */}

        <ToolbarDivider />

        <BoldButton />
        <ItalicButton />
        <UnderlineButton />
        <MoreMarkDropdown />

        <ToolbarDivider />

        <TextColorButton />
        <TextHighlightButton />

        <ToolbarDivider />

        <AlignPopover />
        <BulletListButton />
        <OrderedListButton />
        <LineHeightDropdown />

        <ToolbarDivider />

        {/* <BlockquoteButton /> */}
        <LinkButton />
        <TableButton />
        {/* <ImageButton /> */}
        {/* <YoutubeButton /> */}
        <CodeBlockButton />
        <InsertDropdown />

        <ToolbarDivider />

        <HeadingDropdown />
        <FontFamilyDropdown />
        <FontSizeDropdown />
        <LanguageToolToggleButton />
        <LanguageToolSidebarButton />
        <BrowserSpellcheckButton />

        <ToolbarDivider />

        {showExport && <ExportDropdown />}
        {showPreview && <PreviewDropdown />}
        <DocumentsButton />
        {showDrafts && <DraftsDropdown />}
        <ImportPdfButton />

        <CopyEditorButton />
        {exportActions?.onClear && <ClearEditorButton />}

        {/* {hasExtraMenus && <ToolbarDivider />} */}
      </Toolbar>
    </div>
  );
};

export default memo(MenuBar);
