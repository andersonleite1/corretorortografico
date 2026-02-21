"use client";

import React from "react";
import clsx from "clsx";
import { useTiptapContext } from "../Provider";
import { useEditorState } from "@tiptap/react";
import Tooltip from "../ui/Tooltip";
import Icon from "../ui/Icon";

const LanguageToolSidebarButton = () => {
    const { isLTSidebarOpen, setIsLTSidebarOpen, contentElement, editor } = useTiptapContext();

    // Sincronizar painel com o estado do LanguageTool
    const isLTEnabled = useEditorState({
        editor,
        selector: (ctx: { editor: any }) => {
            const storage = (ctx.editor.storage as any).languageTool;
            return storage?.enabled ?? false;
        },
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

    const label = isLTSidebarOpen ? "Fechar Painel de Erros" : "Abrir Painel de Erros";

    return (
        <Tooltip
            content={label}
            options={{ collisionBoundary: contentElement.current?.parentElement }}
        >
            <button
                type="button"
                className={clsx(
                    "rte-toolbar-button",
                    isLTSidebarOpen ? "bg-emerald-50 text-emerald-600" : "hover:bg-emerald-50"
                )}
                onClick={handleToggle}
                aria-pressed={isLTSidebarOpen}
                aria-label={label}
            >
                <Icon
                    name={isLTSidebarOpen ? "CheckboxChecked" : "CheckboxEmpty"}
                    size={20}
                    className={clsx(isLTSidebarOpen ? "text-emerald-600" : "text-neutral-400")}
                />
                <span className="sr-only">{label}</span>
            </button>
        </Tooltip>
    );
};

export default LanguageToolSidebarButton;
