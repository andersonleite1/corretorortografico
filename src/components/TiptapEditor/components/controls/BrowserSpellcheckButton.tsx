import React, { useCallback } from "react";
import clsx from "clsx";
import { useTiptapContext } from "../Provider";
import { useEditorSettings } from "@/components/providers/EditorSettingsProvider";
import Tooltip from "../ui/Tooltip";
import Icon from "../ui/Icon";

const BrowserSpellcheckButton = () => {
    const {
        messages,
        contentElement
    } = useTiptapContext();
    const { buttonVisibility, toggleButtonVisibility } = useEditorSettings();

    const isBrowserSpellcheckEnabled = buttonVisibility.browserSpellcheck;

    const handleToggle = useCallback(() => {
        toggleButtonVisibility("browserSpellcheck");
    }, [toggleButtonVisibility]);

    const tooltipLabel = isBrowserSpellcheckEnabled
        ? messages.browserSpellcheck.disableTooltip
        : messages.browserSpellcheck.enableTooltip;

    const iconName = isBrowserSpellcheckEnabled ? "CheckboxChecked" : "CheckboxEmpty";

    return (
        <div className="rte-toggle-group">
            <Tooltip
                content={tooltipLabel}
                options={{ collisionBoundary: contentElement.current?.parentElement }}
            >
                <button
                    type="button"
                    className={clsx(
                        "rte-button",
                        isBrowserSpellcheckEnabled ? "rte-button--active" : ""
                    )}
                    onClick={handleToggle}
                    aria-pressed={isBrowserSpellcheckEnabled}
                    aria-label={tooltipLabel}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        color: isBrowserSpellcheckEnabled ? '#059669' : 'inherit',
                        backgroundColor: isBrowserSpellcheckEnabled ? '#ecfdf5' : 'transparent'
                    }}
                >
                    <Icon
                        name={iconName}
                        size={18}
                        className={clsx(isBrowserSpellcheckEnabled ? "text-emerald-600" : "text-neutral-400")}
                    />
                    <span className="rte-button__text" style={{
                        fontSize: '13px',
                        fontWeight: 500,
                    }}>
                        {messages.browserSpellcheck.label}
                    </span>
                </button>
            </Tooltip>
        </div>
    );
};

export default BrowserSpellcheckButton;
