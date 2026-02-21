"use client";

import React, { useState } from "react";
import { Icon } from "../TiptapEditor/components/ui/Icon";
import { useEditorSettings, TOOLBAR_BUTTON_LABELS, ToolbarButtonId, ToneId, TONE_LABELS, TONE_DESCRIPTIONS, TONE_ICONS } from "@/components/providers/EditorSettingsProvider";

export const SettingsDialog = () => {
    const { isSettingsDialogOpen, setIsSettingsDialogOpen, buttonVisibility, toggleButtonVisibility, activeTones, toggleToneActivation } = useEditorSettings();
    const [activeTab, setActiveTab] = useState<"tones" | "toolbar" | "general">("tones");

    if (!isSettingsDialogOpen) return null;

    const buttonIds = Object.keys(TOOLBAR_BUTTON_LABELS) as ToolbarButtonId[];
    const toneIds = Object.keys(TONE_LABELS) as ToneId[];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-8 overflow-hidden" onClick={() => setIsSettingsDialogOpen(false)}>
            <div
                className="w-full max-w-3xl bg-white dark:bg-[#1c1c1e] rounded-[24px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header do Diálogo */}
                <div className="px-8 py-6 pb-2 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                            <Icon name="Settings" size={24} className="text-blue-500" />
                            Configurações
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsSettingsDialogOpen(false)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 transition-colors"
                    >
                        <Icon name="Close" size={24} />
                    </button>
                </div>

                {/* Abas */}
                <div className="flex items-center gap-6 px-8 border-b border-gray-100 dark:border-white/5">
                    <button
                        onClick={() => setActiveTab("tones")}
                        className={`py-4 text-[15px] font-medium border-b-2 transition-colors -mb-[1px] ${activeTab === "tones" ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}`}
                    >
                        Opções de Tom e Estilo
                    </button>
                    <button
                        onClick={() => setActiveTab("toolbar")}
                        className={`py-4 text-[15px] font-medium border-b-2 transition-colors -mb-[1px] ${activeTab === "toolbar" ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}`}
                    >
                        Barra de Ferramentas
                    </button>
                    <button
                        onClick={() => setActiveTab("general")}
                        className={`py-4 text-[15px] font-medium border-b-2 transition-colors -mb-[1px] ${activeTab === "general" ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"}`}
                    >
                        Conf. Gerais
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {activeTab === "tones" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {toneIds.map((id) => {
                                    const isActive = activeTones[id];
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => toggleToneActivation(id)}
                                            className={`flex flex-col items-center justify-center text-center p-6 rounded-2xl border transition-all duration-200 outline-none ${isActive
                                                ? "border-blue-300 bg-blue-50/50 dark:border-blue-500/30 dark:bg-blue-500/10 shadow-sm"
                                                : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50 dark:border-white/5 dark:bg-black/20 dark:hover:border-white/10"
                                                }`}
                                        >
                                            <div className="text-3xl mb-3">{TONE_ICONS[id]}</div>
                                            <h4 className={`text-sm font-bold tracking-wider mb-2 uppercase ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>
                                                {TONE_LABELS[id]}
                                            </h4>
                                            <p className={`text-xs ${isActive ? "text-blue-500/80 dark:text-blue-400/80" : "text-gray-500 dark:text-gray-400"}`}>
                                                {TONE_DESCRIPTIONS[id]}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === "toolbar" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
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
                    )}

                    {activeTab === "general" && (
                        <div className="space-y-6 animate-in fade-in duration-300 flex flex-col items-center justify-center py-12 text-center">
                            <Icon name="Settings" size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Configurações Gerais</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                                As configurações gerais estarão disponíveis em breve.
                            </p>
                        </div>
                    )}
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

