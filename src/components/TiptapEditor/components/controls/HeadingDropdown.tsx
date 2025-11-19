import React, { useCallback, useMemo } from "react";
import { useEditorState } from "@tiptap/react";
import MenuButton from "../MenuButton";
import { DropdownMenuItem } from "../ui/DropdownMenu";
import { useTiptapContext } from "../Provider";

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;

type Heading = "p" | `h${(typeof HEADING_LEVELS)[number]}`;

const HeadingDropdown = () => {
  const { editor, messages } = useTiptapContext();
  const { paragraph, h1, h2, h3, h4, menu } = messages.headings;

  const current = useEditorState({
    editor,
    selector: (ctx) => {
      const { editor } = ctx;
      if (editor.isActive("paragraph")) return "p" as Heading;

      const headingLevel = HEADING_LEVELS.find((level) => editor.isActive("heading", { level }));
      if (headingLevel) return `h${headingLevel}` as Heading;

      return null;
    },
  });

  const options = useMemo(
    () => [
      {
        value: "p",
        label: paragraph,
      },
      {
        value: "h1",
        label: h1,
      },
      {
        value: "h2",
        label: h2,
      },
      {
        value: "h3",
        label: h3,
      },
      {
        value: "h4",
        label: h4,
      },
    ],
    [paragraph, h1, h2, h3, h4]
  );

  const onSelect = useCallback(
    (value: Heading) => {
      if (value.startsWith("h")) {
        editor
          .chain()
          .focus()
          .setHeading({ level: +value[1] as any })
          .run();
      } else {
        editor.chain().focus().setParagraph().run();
      }
    },
    [editor]
  );

  const currentLabel = options.find((item) => item.value === current)?.label || menu;

  return (
    <MenuButton
      type="dropdown"
      text={currentLabel}
      tooltip={messages.toolbar.heading}
      hideText={false}
      disabled={!editor.isEditable || !current}
      buttonStyle={{ minWidth: "6.5rem" }}
      dropdownClass="rte-heading-dropdown"
    >
      {options.map((item) => (
        <DropdownMenuItem
          key={item.value}
          data-active={item.value === current || undefined}
          data-heading={item.value}
          onSelect={() => onSelect(item.value as Heading)}
        >
          {item.label}
        </DropdownMenuItem>
      ))}
    </MenuButton>
  );
};

export default HeadingDropdown;
