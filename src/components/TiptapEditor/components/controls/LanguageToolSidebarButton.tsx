"use client";

import React from "react";
import clsx from "clsx";
import { useTiptapContext } from "../Provider";
import { useEditorState } from "@tiptap/react";
import Tooltip from "../ui/Tooltip";
import Icon from "../ui/Icon";

const LanguageToolSidebarButton = () => {
  const {
    isLTSidebarOpen,
    setIsLTSidebarOpen,
    contentElement,
    editor,
    locale,
  } = useTiptapContext();

  // Sincronizar painel com o estado do LanguageTool
  const isLTEnabled = useEditorState({
    editor,
    selector: (ctx: { editor: any }) => {
      const storage = (ctx.editor.storage as any).languageTool;
      return storage?.enabled ?? false;
    },
  });
  const issueCount = useEditorState({
    editor,
    selector: (ctx: { editor: any }) =>
      (ctx.editor.storage as any).languageTool?.issues?.length ?? 0,
  });

  // Sincronizar painel com o estado do corretor:
  // 1. Se ligar o corretor -> Marca o checkbox (abre o painel)
  // 2. Se desligar o corretor -> Desmarca o checkbox (fecha o painel)
  const lastEnabledRef = React.useRef(isLTEnabled);
  React.useEffect(() => {
    if (isLTEnabled !== lastEnabledRef.current) {
      setIsLTSidebarOpen(isLTEnabled);
    }
    lastEnabledRef.current = isLTEnabled;
  }, [isLTEnabled, setIsLTSidebarOpen]);

  const handleToggle = () => {
    const nextState = !isLTSidebarOpen;

    // Se o usuário está marcando o checkbox (abrindo o painel)
    // e o corretor está desligado, nós ligamos o corretor também.
    if (nextState && !isLTEnabled) {
      editor.commands.setLanguageToolEnabled?.(true);
    }

    setIsLTSidebarOpen(nextState);
  };

  const label = locale === "en"
    ? (isLTSidebarOpen ? "Hide suggestions" : `Suggestions (${issueCount})`)
    : locale === "es"
      ? (isLTSidebarOpen ? "Ocultar sugerencias" : `Sugerencias (${issueCount})`)
      : (isLTSidebarOpen ? "Ocultar sugestões" : `Sugestões (${issueCount})`);

  return (
    <Tooltip
      content={label}
      options={{ collisionBoundary: contentElement.current?.parentElement }}
    >
      <button
        type="button"
        className={clsx(
          "rte-toolbar-button rte-lt-results-trigger",
          isLTSidebarOpen
            ? "bg-blue-50 text-blue-700"
            : "hover:bg-blue-50",
        )}
        onClick={handleToggle}
        aria-pressed={isLTSidebarOpen}
        aria-label={label}
      >
        <Icon
          name={isLTSidebarOpen ? "CheckboxChecked" : "CheckboxEmpty"}
          size={20}
          className={clsx(
            isLTSidebarOpen ? "text-blue-700" : "text-neutral-400",
          )}
        />
        <span className="rte-lt-results-trigger__text">{label}</span>
      </button>
    </Tooltip>
  );
};

export default LanguageToolSidebarButton;
