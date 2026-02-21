import React, { useCallback, useMemo } from "react";
import MenuButton from "../MenuButton";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/DropdownMenu";
import { useTiptapContext } from "../Provider";
import Icon from "../ui/Icon";
import { FaHistory, FaPlus, FaTrash, FaEye } from "react-icons/fa";

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
      dropdownStyle={{ minWidth: "20rem", padding: "0.5rem" }}
    >
      <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
        <FaHistory size={12} />
        Histórico de Versões
      </div>

      <DropdownMenuItem asChild>
        <button
          onClick={handleSave}
          disabled={!draftActions?.onSaveDraft}
          className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FaPlus size={12} />
          </div>
          Criar Nova Versão
        </button>
      </DropdownMenuItem>

      <DropdownMenuSeparator className="my-2 bg-gray-100 dark:bg-gray-800" />

      <div className="max-h-[300px] overflow-y-auto">
        {orderedDrafts.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">{messages.drafts.empty}</p>
          </div>
        ) : (
          orderedDrafts.map((draft) => (
            <DropdownMenuItem
              key={draft.id}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
              onSelect={(event) => {
                if (!draftActions?.onLoadDraft) {
                  event.preventDefault();
                  return;
                }
                handleLoad(draft.id);
              }}
              disabled={!draftActions?.onLoadDraft}
            >
              <div className="flex-1 flex flex-col text-left overflow-hidden">
                <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {draft.title || messages.drafts.untitled}
                </span>
                <span className="text-[11px] text-gray-400 font-medium">
                  {draft.date}
                </span>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    draftActions?.onCompareDraft?.(draft.id);
                  }}
                  className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                  title="Comparar Versão"
                  disabled={!draftActions?.onCompareDraft}
                >
                  <FaEye size={14} />
                </button>
                <button
                  type="button"
                  onClick={(event) => handleDelete(event, draft.id)}
                  className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                  aria-label={messages.drafts.delete}
                  disabled={!draftActions?.onDeleteDraft}
                >
                  <FaTrash size={12} />
                </button>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </div>
    </MenuButton>
  );
};

export default DraftsDropdown;
