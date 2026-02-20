"use client";

import React from "react";
import clsx from "clsx";
import { useTiptapContext } from "../Provider";
import Tooltip from "../ui/Tooltip";
import Icon from "../ui/Icon";

const LanguageToolSidebarButton = () => {
    const { isLTSidebarOpen, setIsLTSidebarOpen, contentElement } = useTiptapContext();

    const handleToggle = () => {
        setIsLTSidebarOpen(!isLTSidebarOpen);
    };

    const label = isLTSidebarOpen ? "Fechar Painel de Erros" : "Abrir Painel de Erros";

    return (
        <Tooltip
            content={label}
            options={{ collisionBoundary: contentElement.current?.parentElement }}
        >
            <button
                type="button"
                className={clsx("rte-toolbar-button", isLTSidebarOpen && "rte-toolbar-button--active")}
                onClick={handleToggle}
                aria-pressed={isLTSidebarOpen}
                aria-label={label}
            >
                <Icon name="Eye" size={16} />
                <span className="sr-only">{label}</span>
            </button>
        </Tooltip>
    );
};

export default LanguageToolSidebarButton;
