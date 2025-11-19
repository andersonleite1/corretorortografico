import React, { useCallback } from "react";
import MenuButton from "../MenuButton";
import { DropdownMenuItem } from "../ui/DropdownMenu";
import { useTiptapContext } from "../Provider";

const InsertDropdown = () => {
  const { editor, messages } = useTiptapContext();

  const insertCodeBlock = () => editor.chain().focus().setCodeBlock().run();

  const insertBlockquote = () => editor.chain().focus().setBlockquote().run();

  const insertYoutube = () => {
    const src = prompt(messages.insert.youtubePrompt, messages.insert.youtubePlaceholder);
    if (src) {
      editor.chain().focus().embedYoutube({ src }).run();
    }
  };

  return (
    <MenuButton
      type="dropdown"
      tooltip={messages.toolbar.insert}
      disabled={!editor.isEditable}
      icon="Plus"
      dropdownStyle={{ minWidth: "8rem" }}
    >
      <DropdownMenuItem asChild>
        <MenuButton
          text={messages.insert.quote}
          hideText={false}
          tooltip={false}
          icon="Quote"
          onClick={insertBlockquote}
        />
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <MenuButton
          text={messages.insert.codeBlock}
          hideText={false}
          tooltip={false}
          icon="CodeBlock"
          onClick={insertCodeBlock}
        />
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <MenuButton
          text={messages.insert.youtube}
          hideText={false}
          tooltip={false}
          icon="Youtube"
          onClick={insertYoutube}
        />
      </DropdownMenuItem>
    </MenuButton>
  );
};

export default InsertDropdown;
