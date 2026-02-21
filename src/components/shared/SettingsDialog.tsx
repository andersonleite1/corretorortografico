"use client";

import React from "react";
import { Icon } from "../TiptapEditor/components/ui/Icon";
import { useEditorSettings, TOOLBAR_BUTTON_LABELS, ToolbarButtonId } from "@/components/providers/EditorSettingsProvider";

export const SettingsDialog = () => {
    const { isSettingsDialogOpen, setIsSettingsDialogOpen, buttonVisibility, toggleButtonVisibility } = useEditorSettings();

    if (!isSettingsDialogOpen) return null;

    const buttonIds = Object.keys(TOOLBAR_BUTTON_LABELS) as ToolbarButtonId[];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-8 overflow-hidden" onClick={() => setIsSettingsDialogOpen(false)}>
            <div
                className="w-full max-w-2xl bg-white dark:bg-[#1c1c1e] rounded-[24px] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header do Diálogo */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Configurações</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Personalize a exibição dos botões na barra de ferramentas.</p>
                    </div>
                    <button
                        onClick={() => setIsSettingsDialogOpen(false)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 transition-colors"
                    >
                        <Icon name="Close" size={24} />
                    </button>
                </div>

                {/* Abas e Conteúdo */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="space-y-6">
                        <div className="border-b border-gray-100 dark:border-white/5 pb-2">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Barra de Ferramentas</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Selecione quais botões você deseja exibir no cabeçalho do editor.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {buttonIds.map((id) => (
                                <label
                                    key={id}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={buttonVisibility[id]}
                                        onChange={() => toggleButtonVisibility(id)}
                                        className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 bg-white dark:bg-black/20 dark:border-white/10 cursor-pointer"
                                    />
                                    <span className="text-[15px] font-medium text-gray-700 dark:text-gray-300 select-none">
                                        {TOOLBAR_BUTTON_LABELS[id]}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Rodapé do Diálogo */}
                <div className="px-8 py-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex items-center justify-end">
                    <button
                        onClick={() => setIsSettingsDialogOpen(false)}
                        className="px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-full hover:opacity-90 transition-opacity"
                    >
                        Concluído
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SettingsDialog;
