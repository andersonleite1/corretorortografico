import React, { memo, useCallback } from "react";
import { BubbleMenu } from "../../BubbleMenu";
import { Toolbar, ToolbarDivider } from "../../ui/Toolbar";
import { useTiptapContext } from "../../Provider";
import MenuButton from "../../MenuButton";
import { useEditorState } from "@tiptap/react";
import CodeDropdown from "./CodeDropdown";
import useCopyToClipboard from "../../../hooks/useCopyToClipboard";
import { getNodeContainer } from "../../../utils/getNodeContainer";
import type { VirtualElement } from "@floating-ui/dom";

export const CodeBlockMenu = () => {
  const { editor, contentElement, messages } = useTiptapContext();
  const { isCopied, copy } = useCopyToClipboard();

  const language = useEditorState({
    editor,
    selector: (ctx) => {
      if (ctx.editor.isActive("codeBlock")) return ctx.editor.getAttributes("codeBlock").language;
      return null;
    },
  });

  const shouldShow = useCallback(({ editor }: any) => {
    return editor.isActive("codeBlock");
  }, []);

  const handleSelect = useCallback(
    (value: string) => editor.commands.updateAttributes("codeBlock", { language: value }),
    [editor]
  );

  const handleCopy = useCallback(() => {
    const node = getNodeContainer(editor, "pre");
    if (node?.textContent) {
      copy(node.textContent);
    }
  }, [editor]);

  const handleDelete = useCallback(() => {
    editor.chain().focus().deleteNode("codeBlock").run();
  }, [editor]);

  const getReferencedVirtualElement = useCallback((): VirtualElement | null => {
    const node = getNodeContainer(editor, "pre") as HTMLElement | null;
    if (!node) {
      return null;
    }

    return {
      getBoundingClientRect: () => node.getBoundingClientRect(),
      contextElement: node,
    };
  }, [editor]);

  return (
    <BubbleMenu
      editor={editor}
      pluginKey={"code-block-bubble"}
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
        <CodeDropdown value={language} onSelect={handleSelect} />
        <ToolbarDivider />
        <MenuButton
          icon={isCopied ? "Check" : "Clipboard"}
          tooltip={messages.codeBlock.copy}
          onClick={handleCopy}
        />
        <MenuButton icon="Trash" tooltip={messages.codeBlock.delete} onClick={handleDelete} />
      </Toolbar>
    </BubbleMenu>
  );
};

export default memo(CodeBlockMenu);
