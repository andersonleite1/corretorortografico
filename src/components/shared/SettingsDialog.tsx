"use client";

import React, { useState } from "react";
import { Icon } from "../TiptapEditor/components/ui/Icon";
import { useEditorSettings, TOOLBAR_BUTTON_LABELS, ToolbarButtonId, ToneId, TONE_LABELS, TONE_DESCRIPTIONS, TONE_ICONS } from "@/components/providers/EditorSettingsProvider";

export const SettingsDialog = () => {
    const {
        isSettingsDialogOpen,
        setIsSettingsDialogOpen,
        buttonVisibility,
        toggleButtonVisibility,
        activeTones,
        toggleToneActivation,
        customTones,
        addCustomTone,
        deleteCustomTone,
        toggleCustomToneActivation
    } = useEditorSettings();
    const [activeTab, setActiveTab] = useState<"tones" | "toolbar" | "general">("tones");
    const [isCreateToneDialogOpen, setIsCreateToneDialogOpen] = useState(false);

    // Estados do formulário de novo tom
    const [newToneName, setNewToneName] = useState("");
    const [newToneDescription, setNewToneDescription] = useState("");
    const [newToneInstructions, setNewToneInstructions] = useState("");

    if (!isSettingsDialogOpen) return null;

    const buttonIds = Object.keys(TOOLBAR_BUTTON_LABELS) as ToolbarButtonId[];
    const toneIds = Object.keys(TONE_LABELS) as ToneId[];

    const handleCreateTone = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newToneName.trim() || !newToneDescription.trim() || !newToneInstructions.trim()) return;

        addCustomTone({
            name: newToneName,
            description: newToneDescription.slice(0, 20),
            instructions: newToneInstructions
        });

        // Limpar e fechar
        setNewToneName("");
        setNewToneDescription("");
        setNewToneInstructions("");
        setIsCreateToneDialogOpen(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-8 overflow-hidden" onClick={() => setIsSettingsDialogOpen(false)}>
            {/* Diálogo Principal */}
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

                                {customTones.map((tone) => (
                                    <div
                                        key={tone.id}
                                        className={`relative group flex flex-col items-center justify-center text-center p-6 rounded-2xl border transition-all duration-200 ${tone.isActive
                                            ? "border-blue-300 bg-blue-50/50 dark:border-blue-500/30 dark:bg-blue-500/10 shadow-sm"
                                            : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50 dark:border-white/5 dark:bg-black/20 dark:hover:border-white/10"
                                            }`}
                                    >
                                        <button
                                            onClick={() => toggleCustomToneActivation(tone.id)}
                                            className="absolute inset-0 z-0"
                                        />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteCustomTone(tone.id); }}
                                            className="absolute top-3 right-3 p-1.5 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        >
                                            <Icon name="Trash" size={14} />
                                        </button>
                                        <div className="text-3xl mb-3 z-10">✨</div>
                                        <h4 className={`text-sm font-bold tracking-wider mb-2 uppercase z-10 ${tone.isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>
                                            {tone.name}
                                        </h4>
                                        <p className={`text-xs z-10 ${tone.isActive ? "text-blue-500/80 dark:text-blue-400/80" : "text-gray-500 dark:text-gray-400"}`}>
                                            {tone.description}
                                        </p>
                                    </div>
                                ))}

                                {customTones.length < 5 && (
                                    <button
                                        onClick={() => setIsCreateToneDialogOpen(true)}
                                        className="flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 dark:border-white/10 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/5 transition-all group"
                                        title="Cadastrar tom personalizado"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
                                            <Icon name="Plus" size={24} className="text-gray-400 group-hover:text-blue-500" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            Novo Tom
                                        </span>
                                    </button>
                                )}
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

            {/* Modal de Criação de Tom (Z-Index maior para ficar por cima) */}
            {isCreateToneDialogOpen && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={(e) => { e.stopPropagation(); setIsCreateToneDialogOpen(false); }}
                >
                    <div
                        className="w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-[24px] shadow-3xl p-8 transform transition-all animate-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Cadastrar tom personalizado</h3>
                        <form onSubmit={handleCreateTone} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nome do tom</label>
                                <input
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                                    placeholder="Ex: Divertido, Técnico..."
                                    value={newToneName}
                                    onChange={(e) => setNewToneName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Breve descrição</label>
                                <input
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                                    placeholder="Máximo 20 caracteres"
                                    maxLength={20}
                                    value={newToneDescription}
                                    onChange={(e) => setNewToneDescription(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Instruções específicas</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm min-h-[120px] resize-none"
                                    placeholder="Instruções para a IA seguir ao reescrever o texto..."
                                    value={newToneInstructions}
                                    onChange={(e) => setNewToneInstructions(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateToneDialogOpen(false)}
                                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                                >
                                    Criar Tom
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsDialog;

