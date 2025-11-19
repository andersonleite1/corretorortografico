import React, { useCallback, useMemo } from "react";
import { useEditorState } from "@tiptap/react";

import MenuButton from "../MenuButton";
import { DropdownMenuItem } from "../ui/DropdownMenu";
import { useTiptapContext } from "../Provider";
import { FONT_FAMILY_OPTIONS } from "../../constants/font-family";

const FontFamilyDropdown = () => {
  const { editor, messages } = useTiptapContext();

  const currentFont = useEditorState({
    editor,
    selector: ({ editor }) => editor.getAttributes("textStyle").fontFamily as string | undefined,
  });

  const options = useMemo(
    () =>
      FONT_FAMILY_OPTIONS.map((option, index) =>
        index === 0 ? { ...option, label: messages.fontFamily.default } : option
      ),
    [messages.fontFamily.default]
  );
  const normalizedCurrent = currentFont ?? "";

  const activeOption =
    options.find((option) => option.value === normalizedCurrent) ?? options[0];

  const handleSelect = useCallback(
    (value: string) => {
      if (!editor) return;

      const chain = editor.chain().focus();

      if (!value) {
        chain.unsetFontFamily().run();
        return;
      }

      chain.setFontFamily(value).run();
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <MenuButton
      type="dropdown"
      text={activeOption.label}
      tooltip={messages.toolbar.fontFamily}
      hideText={false}
      buttonStyle={{
        minWidth: "6.4rem",
        fontFamily: activeOption.value || undefined,
      }}
      dropdownClass="rte-fontfamily-dropdown"
    >
      {options.map((option) => (
        <DropdownMenuItem
          key={option.label}
          data-active={option.value === normalizedCurrent || undefined}
          onSelect={() => handleSelect(option.value)}
          style={{ fontFamily: option.value || undefined }}
          data-font-option
        >
          {option.label}
        </DropdownMenuItem>
      ))}
    </MenuButton>
  );
};

export default FontFamilyDropdown;
