"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "../TiptapEditor/components/ui/Icon";

type Tab = "arquivo" | "formatacao" | "paragrafo" | "insercao" | "revisao";

interface ShortcutEntry {
    label: string;
    keys: string[];
    note?: string;
}

/** Detects macOS to decide whether to show ⌘ or Ctrl */
function isMac(): boolean {
    if (typeof navigator === "undefined") return false;
    return /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}

/** Translates a key token into a readable label */
function renderKey(key: string, mac: boolean): string {
    switch (key) {
        case "Ctrl": return mac ? "⌘" : "Ctrl";
        case "Shift": return "⇧";
        case "Alt": return mac ? "⌥" : "Alt";
        case "Delete": return "Del";
        default: return key;
    }
}

const Kbd = ({ keys }: { keys: string[] }) => {
    const mac = isMac();
    return (
        <span className="flex items-center gap-0.5 flex-shrink-0">
            {keys.map((key, i) => (
                <kbd
                    key={i}
                    className="inline-flex items-center justify-center min-w-[26px] h-6 px-1.5 text-[11px] font-semibold bg-white dark:bg-white/10 border border-gray-200 dark:border-white/15 rounded-md shadow-sm text-gray-700 dark:text-gray-200 font-mono"
                >
                    {renderKey(key, mac)}
                </kbd>
            ))}
        </span>
    );
};

const ShortcutRow = ({ shortcut }: { shortcut: ShortcutEntry }) => (
    <div className="flex items-center justify-between gap-4 py-2.5 px-1 border-b border-gray-50 dark:border-white/5 last:border-0 group hover:bg-gray-50/80 dark:hover:bg-white/5 rounded-lg px-3 transition-colors">
        <div className="flex-1 min-w-0">
            <span className="text-sm text-gray-700 dark:text-gray-300">{shortcut.label}</span>
            {shortcut.note && (
                <span className="ml-2 text-[11px] text-gray-400 dark:text-gray-500 italic">{shortcut.note}</span>
            )}
        </div>
        <Kbd keys={shortcut.keys} />
    </div>
);

const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "arquivo", label: "Arquivo", icon: "Save" },
    { id: "formatacao", label: "Formatação", icon: "Bold" },
    { id: "paragrafo", label: "Parágrafo", icon: "AlignLeft" },
    { id: "insercao", label: "Inserção", icon: "Plus" },
    { id: "revisao", label: "Revisão", icon: "CheckboxChecked" },
];

const SHORTCUTS: Record<Tab, ShortcutEntry[]> = {
    arquivo: [
        { label: "Desfazer", keys: ["Ctrl", "Z"] },
        { label: "Refazer", keys: ["Ctrl", "Y"] },
        { label: "Salvar Documento", keys: ["Ctrl", "S"] },
        { label: "Rascunhos", keys: ["Ctrl", "⇧", "S"] },
        { label: "Meus Documentos", keys: ["Ctrl", "O"] },
        { label: "Copiar Tudo", keys: ["Ctrl", "⇧", "C"] },
        { label: "Limpar Editor", keys: ["Ctrl", "⇧", "Del"] },
        { label: "Importar PDF", keys: ["Ctrl", "⇧", "I"], note: "Pode conflitar com DevTools" },
        { label: "Exportar", keys: ["Ctrl", "P"] },
        { label: "Pré-visualizar", keys: ["Ctrl", "⇧", "P"] },
        { label: "Configurações", keys: ["Ctrl", ","] },
        { label: "Reescrever com IA", keys: ["Ctrl", "J"] },
    ],
    formatacao: [
        { label: "Negrito", keys: ["Ctrl", "B"] },
        { label: "Itálico", keys: ["Ctrl", "I"] },
        { label: "Sublinhado", keys: ["Ctrl", "U"] },
        { label: "Tachado", keys: ["Ctrl", "⇧", "X"] },
        { label: "Código Inline", keys: ["Ctrl", "E"] },
        { label: "Subscrito", keys: ["Ctrl", "="] },
        { label: "Sobrescrito", keys: ["Ctrl", "⇧", "+"] },
        { label: "Cor de Fundo (Highlight)", keys: ["Ctrl", "⇧", "H"] },
        { label: "Limpar Formatação", keys: ["Ctrl", "\\"] },
    ],
    paragrafo: [
        { label: "Título H1", keys: ["Ctrl", "Alt", "1"] },
        { label: "Título H2", keys: ["Ctrl", "Alt", "2"] },
        { label: "Título H3", keys: ["Ctrl", "Alt", "3"] },
        { label: "Título H4", keys: ["Ctrl", "Alt", "4"] },
        { label: "Título H5", keys: ["Ctrl", "Alt", "5"] },
        { label: "Título H6", keys: ["Ctrl", "Alt", "6"] },
        { label: "Alinhar à Esquerda", keys: ["Ctrl", "⇧", "L"] },
        { label: "Centralizar", keys: ["Ctrl", "⇧", "E"] },
        { label: "Alinhar à Direita", keys: ["Ctrl", "⇧", "R"] },
        { label: "Justificar", keys: ["Ctrl", "⇧", "J"] },
        { label: "Lista com Marcadores", keys: ["Ctrl", "⇧", "8"] },
        { label: "Lista Numerada", keys: ["Ctrl", "⇧", "7"] },
        { label: "Bloco de Citação", keys: ["Ctrl", "⇧", "9"] },
    ],
    insercao: [
        { label: "Inserir Link", keys: ["Ctrl", "K"] },
        { label: "Inserir Imagem", keys: ["Ctrl", "Alt", "I"] },
        { label: "Inserir Tabela", keys: ["Ctrl", "Alt", "T"] },
        { label: "Bloco de Código", keys: ["Ctrl", "Alt", "C"] },
    ],
    revisao: [
        { label: "Verificação Gramatical (Toggle)", keys: ["F7"] },
        { label: "Painel de Verificação Gramatical", keys: ["⇧", "F7"] },
    ],
};

interface ShortcutsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ShortcutsDialog = ({ isOpen, onClose }: ShortcutsDialogProps) => {
    const [activeTab, setActiveTab] = useState<Tab>("arquivo");
    const mac = useMemo(() => isMac(), []);

    if (!isOpen) return null;

    const modKey = mac ? "⌘" : "Ctrl";

    /** Replace "Ctrl" display token with platform key in rendered rows */
    const resolvedShortcuts = SHORTCUTS[activeTab].map((s) => ({
        ...s,
        keys: s.keys.map((k) => (k === "Ctrl" ? modKey : k)),
    }));

    return (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-8 overflow-hidden"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl bg-white dark:bg-[#1c1c1e] rounded-[24px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 py-6 pb-2 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        <Icon name="Keyboard" size={24} className="text-blue-500" />
                        Atalhos de Teclado
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 transition-colors"
                    >
                        <Icon name="Close" size={24} />
                    </button>
                </div>

                {/* Platform hint */}
                <div className="px-8 pb-2">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        {mac
                            ? "Neste Mac, use ⌘ (Command) no lugar de Ctrl."
                            : "No Windows/Linux, use Ctrl. Em macOS, os mesmos atalhos usam ⌘ (Command)."}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 px-6 border-b border-gray-100 dark:border-white/5 overflow-x-auto">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 py-3.5 px-3 text-[13px] font-medium border-b-2 transition-colors -mb-[1px] whitespace-nowrap ${activeTab === tab.id
                                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                }`}
                        >
                            <Icon name={tab.icon as any} size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-300">
                    <div className="space-y-0.5">
                        {resolvedShortcuts.map((shortcut, i) => (
                            <ShortcutRow key={i} shortcut={shortcut} />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex items-center justify-between">
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                        Baseado em padrões do Google Docs e Microsoft Word.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShortcutsDialog;
