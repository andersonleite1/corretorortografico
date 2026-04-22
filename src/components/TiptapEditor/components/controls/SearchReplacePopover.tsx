import React, { useState, useEffect } from "react";
import MenuButton from "../MenuButton";
import { useTiptapContext } from "../Provider";
import Icon from "../ui/Icon";

const SearchReplacePopover = () => {
  const { editor } = useTiptapContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!editor) return;
    (editor.commands as any).setSearchTerm(searchTerm);
  }, [searchTerm, editor]);

  useEffect(() => {
    if (!editor) return;
    (editor.commands as any).setReplaceTerm(replaceTerm);
  }, [replaceTerm, editor]);

  const handleNext = () => {
    (editor.commands as any).nextSearchResult?.();
  };

  const handlePrev = () => {
    (editor.commands as any).previousSearchResult?.();
  };

  const isDisabled = !editor.isEditable;

  return (
    <MenuButton
      type="popover"
      icon="Search"
      hideArrow
      tooltip="Localizar e Substituir (Ctrl+F)"
      disabled={isDisabled}
    >
      <div className="p-3 w-72 flex flex-col gap-2 rounded-md shadow-md bg-white dark:bg-zinc-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 w-full text-sm p-1.5 border rounded dark:bg-zinc-700 dark:border-zinc-600 focus:outline-none focus:border-blue-500"
            placeholder="Localizar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        {isExpanded && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 w-full text-sm p-1.5 border rounded dark:bg-zinc-700 dark:border-zinc-600 focus:outline-none focus:border-blue-500"
              placeholder="Substituir por..."
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center justify-between mt-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-500 hover:underline flex items-center"
          >
            {isExpanded ? "Ocultar Substituir" : "Mostrar Substituir"}
          </button>
          
          <div className="flex gap-1">
            {isExpanded ? (
              <>
                <button
                  onClick={() => (editor.commands as any).replace()}
                  className="px-2 py-1 text-xs border rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                  disabled={!searchTerm}
                >
                  Subst.
                </button>
                <button
                  onClick={() => (editor.commands as any).replaceAll()}
                  className="px-2 py-1 text-xs border rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                  disabled={!searchTerm}
                >
                  Tudo
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </MenuButton>
  );
};

export default SearchReplacePopover;
