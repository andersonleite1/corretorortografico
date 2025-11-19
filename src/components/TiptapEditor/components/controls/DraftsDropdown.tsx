import React, { useCallback, useMemo } from "react";
import MenuButton from "../MenuButton";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/DropdownMenu";
import { useTiptapContext } from "../Provider";
import Icon from "../ui/Icon";

const DraftsDropdown = () => {
  const { draftActions, messages } = useTiptapContext();
  const orderedDrafts = useMemo(() => {
    const baseDrafts = draftActions?.drafts ?? [];
    return [...baseDrafts].reverse();
  }, [draftActions?.drafts]);

  const handleSave = useCallback(() => {
    draftActions?.onSaveDraft?.();
  }, [draftActions]);

  const handleLoad = useCallback(
    (id: string) => {
      draftActions?.onLoadDraft?.(id);
    },
    [draftActions]
  );

  const handleDelete = useCallback(
    (event: React.MouseEvent, id: string) => {
      event.preventDefault();
      event.stopPropagation();
      draftActions?.onDeleteDraft?.(id);
    },
    [draftActions]
  );

  if (!draftActions) {
    return null;
  }

  return (
    <MenuButton
      type="dropdown"
      icon="Drafts"
      text={messages.toolbar.drafts}
      hideText={false}
      tooltip={messages.toolbar.drafts}
      dropdownStyle={{ minWidth: "16rem" }}
    >
      <DropdownMenuItem asChild>
        <MenuButton
          text={messages.drafts.save}
          icon="Clipboard"
          hideText={false}
          tooltip={false}
          onClick={handleSave}
          disabled={!draftActions?.onSaveDraft}
        />
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      {orderedDrafts.length === 0 ? (
        <DropdownMenuItem disabled className="text-sm text-gray-500">
          {messages.drafts.empty}
        </DropdownMenuItem>
      ) : (
        orderedDrafts.map((draft) => (
          <DropdownMenuItem
            key={draft.id}
            className="flex items-start gap-3"
            onSelect={(event) => {
              if (!draftActions?.onLoadDraft) {
                event.preventDefault();
                return;
              }
              handleLoad(draft.id);
            }}
            disabled={!draftActions?.onLoadDraft}
          >
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate max-w-[10rem]">
                {draft.title || messages.drafts.untitled}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {draft.date}
              </span>
            </div>
            <button
              type="button"
              onClick={(event) => handleDelete(event, draft.id)}
              className="ml-auto text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
              aria-label={messages.drafts.delete}
              disabled={!draftActions?.onDeleteDraft}
            >
              <Icon name="Trash" size={16} />
            </button>
          </DropdownMenuItem>
        ))
      )}
    </MenuButton>
  );
};

export default DraftsDropdown;
