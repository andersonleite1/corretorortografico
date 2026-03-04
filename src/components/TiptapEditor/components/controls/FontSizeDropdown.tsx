import React, { useCallback, useMemo } from "react";
import { useEditorState } from "@tiptap/react";

import MenuButton from "../MenuButton";
import { DropdownMenuItem } from "../ui/DropdownMenu";
import { useTiptapContext } from "../Provider";
import { FONT_SIZE_OPTIONS } from "../../constants/font-size";

const FontSizeDropdown = () => {
  const { editor, messages } = useTiptapContext();

  const currentSize = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor.getAttributes("textStyle").fontSize as string | undefined,
  });

  const options = useMemo(
    () =>
      FONT_SIZE_OPTIONS.map((option, index) =>
        index === 0 ? { ...option, label: messages.fontSize.default } : option,
      ),
    [messages.fontSize.default],
  );
  const normalizedCurrent = currentSize ?? "";

  const activeOption =
    options.find((option) => option.value === normalizedCurrent) ?? options[0];

  const handleSelect = useCallback(
    (value: string) => {
      if (!editor) return;

      if (!value) {
        editor.chain().focus().unsetFontSize().run();
        return;
      }

      editor.chain().focus().setFontSize(value).run();
    },
    [editor],
  );

  if (!editor) return null;

  return (
    <MenuButton
      type="dropdown"
      text={activeOption.label}
      tooltip={messages.toolbar.fontSize}
      hideText={false}
      buttonStyle={{ minWidth: "6.7rem" }}
      dropdownClass="rte-fontsize-dropdown"
    >
      {options.map((option) => (
        <DropdownMenuItem
          key={option.label}
          data-active={option.value === normalizedCurrent || undefined}
          onSelect={() => handleSelect(option.value)}
          data-fontsize-option
        >
          {option.label}
        </DropdownMenuItem>
      ))}
    </MenuButton>
  );
};

export default FontSizeDropdown;
