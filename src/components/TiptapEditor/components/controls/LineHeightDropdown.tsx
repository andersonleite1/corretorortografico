import React, { useCallback, useMemo } from "react";
import { useEditorState } from "@tiptap/react";

import MenuButton from "../MenuButton";
import { DropdownMenuItem } from "../ui/DropdownMenu";
import { useTiptapContext } from "../Provider";
import { LINE_HEIGHT_OPTIONS } from "../../constants/line-height";

const LineHeightDropdown = () => {
  const { editor, messages } = useTiptapContext();

  const currentLineHeight = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (editor.isActive("heading")) {
        return editor.getAttributes("heading").lineHeight as string | undefined;
      }

      return editor.getAttributes("paragraph").lineHeight as string | undefined;
    },
  });

  const options = useMemo(
    () =>
      LINE_HEIGHT_OPTIONS.map((option, index) =>
        index === 0
          ? { ...option, label: messages.lineHeight.default }
          : option,
      ),
    [messages.lineHeight.default],
  );
  const normalizedCurrent = currentLineHeight ?? "";

  const handleSelect = useCallback(
    (value: string) => {
      if (!editor) return;

      if (!value) {
        editor.chain().focus().unsetLineHeight().run();
        return;
      }

      editor.chain().focus().setLineHeight(value).run();
    },
    [editor],
  );

  if (!editor) return null;

  return (
    <MenuButton
      type="dropdown"
      icon="LineHeight"
      tooltip={messages.toolbar.lineHeight}
      hideText
      dropdownClass="rte-lineheight-dropdown"
    >
      {options.map((option) => (
        <DropdownMenuItem
          key={option.label}
          data-active={option.value === normalizedCurrent || undefined}
          onSelect={() => handleSelect(option.value)}
          data-lineheight-option
        >
          {option.label}
        </DropdownMenuItem>
      ))}
    </MenuButton>
  );
};

export default LineHeightDropdown;
