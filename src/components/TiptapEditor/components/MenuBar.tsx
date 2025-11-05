import React, { memo } from "react";

import { Toolbar, ToolbarDivider } from "./ui/Toolbar";
import { useTiptapContext } from "./Provider";

import BoldButton from "./controls/BoldButton";
import ItalicButton from "./controls/ItalicButton";
import UndoButton from "./controls/UndoButton";
import RedoButton from "./controls/RedoButton";
import ClearFormatButton from "./controls/ClearFormatButton";
import UnderlineButton from "./controls/UnderlineButton";
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
import ExportDropdown from "./controls/ExportDropdown";

const MenuBar = () => {
  const { exportActions } = useTiptapContext();
  const showExport = Boolean(
    exportActions?.onExportDoc || exportActions?.onExportPdf
  );

  return (
    <div className="rte-menu-bar">
      <Toolbar dense>
        <UndoButton />
        <RedoButton />
        {/* <ClearFormatButton /> */}

        <ToolbarDivider />

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
        <ToolbarDivider />

        <InsertDropdown />
        <HeadingDropdown />
        <FontFamilyDropdown />
        <FontSizeDropdown />

        {showExport && (
          <>
            <ToolbarDivider />
            <ExportDropdown />
          </>
        )}
      </Toolbar>
    </div>
  );
};

export default memo(MenuBar);
