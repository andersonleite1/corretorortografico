import React, { useCallback } from "react";
import { useTiptapContext } from "../Provider";
import { getNodeContainer } from "../../utils/getNodeContainer";
import { BubbleMenu } from "../BubbleMenu";
import MenuButton from "../MenuButton";
import { Toolbar } from "../ui/Toolbar";
import type { VirtualElement } from "@floating-ui/dom";

const TableMenu = () => {
  const { editor, contentElement, messages } = useTiptapContext();

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
    [editor],
  );

  const deleteRowOrColumn = useCallback(
    (type: "Row" | "Column") => {
      const command = `delete${type}` as const;
      return () => editor.chain().focus()[command]().run();
    },
    [editor],
  );

  const toggleHeader = useCallback(
    (type: "Row" | "Column") => {
      const command = `toggleHeader${type}` as const;
      return () => editor.chain().focus()[command]().run();
    },
    [editor],
  );

  const mergeCells = useCallback(
    () => editor.chain().focus().mergeCells().run(),
    [editor],
  );
  const splitCell = useCallback(
    () => editor.chain().focus().splitCell().run(),
    [editor],
  );
  const deleteTable = useCallback(
    () => editor.chain().focus().deleteTable().run(),
    [editor],
  );

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
          tooltip={messages.table.addRowAbove}
          onClick={addRowOrColumn("Row", "Before")}
        />
        <MenuButton
          icon="RowInsertBottom"
          tooltip={messages.table.addRowBelow}
          onClick={addRowOrColumn("Row", "After")}
        />
        <MenuButton
          icon="ColInsertLeft"
          tooltip={messages.table.addColumnLeft}
          onClick={addRowOrColumn("Column", "Before")}
        />
        <MenuButton
          icon="ColInsertRight"
          tooltip={messages.table.addColumnRight}
          onClick={addRowOrColumn("Column", "After")}
        />
        <MenuButton
          icon="SplitCell"
          tooltip={messages.table.splitCell}
          onClick={splitCell}
        />
        <MenuButton
          icon="MergeCell"
          tooltip={messages.table.mergeCells}
          onClick={mergeCells}
        />
      </Toolbar>
      <Toolbar style={{ justifyContent: "center" }}>
        <MenuButton
          icon="RowHeader"
          tooltip={messages.table.toggleRowHeader}
          onClick={toggleHeader("Row")}
        />
        <MenuButton
          icon="ColHeader"
          tooltip={messages.table.toggleColumnHeader}
          onClick={toggleHeader("Column")}
        />
        <MenuButton
          icon="RowRemove"
          tooltip={messages.table.deleteRow}
          onClick={deleteRowOrColumn("Row")}
        />
        <MenuButton
          icon="ColRemove"
          tooltip={messages.table.deleteColumn}
          onClick={deleteRowOrColumn("Column")}
        />
        <MenuButton
          icon="Trash"
          tooltip={messages.table.deleteTable}
          onClick={deleteTable}
        />
      </Toolbar>
    </BubbleMenu>
  );
};

export default TableMenu;
