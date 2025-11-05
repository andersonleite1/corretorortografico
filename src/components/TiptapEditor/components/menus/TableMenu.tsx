import React, { useCallback } from "react";
import { useTiptapContext } from "../Provider";
import { getNodeContainer } from "../../utils/getNodeContainer";
import { BubbleMenu } from "../BubbleMenu";
import MenuButton from "../MenuButton";
import { Toolbar } from "../ui/Toolbar";
import type { VirtualElement } from "@floating-ui/dom";

const TableMenu = () => {
  const { editor, contentElement } = useTiptapContext();

  const shouldShow = useCallback(({ editor }: any) => {
    return editor.isActive("table");
  }, []);

  const getReferencedVirtualElement = useCallback((): VirtualElement | null => {
    const node = getNodeContainer(editor, "table") as HTMLElement | null;
    if (!node) {
      return null;
    }

    return {
      getBoundingClientRect: () => node.getBoundingClientRect(),
      contextElement: node,
    };
  }, [editor]);

  const addRowOrColumn = useCallback(
    (type: "Row" | "Column", position: "Before" | "After") => {
      const command = `add${type}${position}` as const;
      return () => editor.chain().focus()[command]().run();
    },
    [editor]
  );

  const deleteRowOrColumn = useCallback(
    (type: "Row" | "Column") => {
      const command = `delete${type}` as const;
      return () => editor.chain().focus()[command]().run();
    },
    [editor]
  );

  const toggleHeader = useCallback(
    (type: "Row" | "Column") => {
      const command = `toggleHeader${type}` as const;
      return () => editor.chain().focus()[command]().run();
    },
    [editor]
  );

  const mergeCells = useCallback(() => editor.chain().focus().mergeCells().run(), [editor]);
  const splitCell = useCallback(() => editor.chain().focus().splitCell().run(), [editor]);
  const deleteTable = useCallback(() => editor.chain().focus().deleteTable().run(), [editor]);

  return (
    <BubbleMenu
      editor={editor}
      pluginKey={"table-bubble"}
      shouldShow={shouldShow}
      updateDelay={100}
      appendTo={() =>
        (contentElement.current as HTMLElement | null) ??
        editor.view.dom.parentElement ??
        document.body
      }
      getReferencedVirtualElement={getReferencedVirtualElement}
      options={{
        placement: "top",
        offset: 10,
      }}
    >
      <Toolbar>
        <MenuButton
          icon="RowInsertTop"
          tooltip="Add row above"
          onClick={addRowOrColumn("Row", "Before")}
        />
        <MenuButton
          icon="RowInsertBottom"
          tooltip="Add row below"
          onClick={addRowOrColumn("Row", "After")}
        />
        <MenuButton
          icon="ColInsertLeft"
          tooltip="Add column before"
          onClick={addRowOrColumn("Column", "Before")}
        />
        <MenuButton
          icon="ColInsertRight"
          tooltip="Add column after"
          onClick={addRowOrColumn("Column", "After")}
        />
        <MenuButton icon="SplitCell" tooltip="Split cell" onClick={splitCell} />
        <MenuButton icon="MergeCell" tooltip="Merge cells" onClick={mergeCells} />
      </Toolbar>
      <Toolbar style={{ justifyContent: "center" }}>
        <MenuButton icon="RowHeader" tooltip="Toggle row header" onClick={toggleHeader("Row")} />
        <MenuButton
          icon="ColHeader"
          tooltip="Toggle column header"
          onClick={toggleHeader("Column")}
        />
        <MenuButton icon="RowRemove" tooltip="Delete row" onClick={deleteRowOrColumn("Row")} />
        <MenuButton
          icon="ColRemove"
          tooltip="Delete column"
          onClick={deleteRowOrColumn("Column")}
        />
        <MenuButton icon="Trash" tooltip="Delete table" onClick={deleteTable} />
      </Toolbar>
    </BubbleMenu>
  );
};

export default TableMenu;
