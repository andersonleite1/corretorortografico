import React, { useMemo } from "react";
import * as Diff from "diff";
import { jsonToPlainText } from "../TiptapEditor/utils/jsonToPlainText";
import { FaHistory, FaCheck, FaTimes } from "react-icons/fa";

interface DraftComparisonProps {
    oldContent: any; // JSON or String
    newContent: any; // JSON or String
    onRestore?: () => void;
    onClose: () => void;
}

export const DraftComparison = ({ oldContent, newContent, onRestore, onClose }: DraftComparisonProps) => {
    const diffs = useMemo(() => {
        const oldText = jsonToPlainText(oldContent);
        const newText = jsonToPlainText(newContent);
        return Diff.diffWords(oldText, newText);
    }, [oldContent, newContent]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#0d1117] overflow-hidden rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 animate-in zoom-in duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <FaHistory size={18} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Comparação de Versão</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Compare as mudanças entre o rascunho e o conteúdo atual</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {onRestore && (
                        <button
                            onClick={onRestore}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 active:scale-95"
                        >
                            <FaCheck size={14} />
                            Restaurar esta versão
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 font-serif leading-relaxed text-xl whitespace-pre-wrap selection:bg-blue-100 dark:selection:bg-blue-900/50">
                <div className="max-w-4xl mx-auto">
                    {diffs.map((part, index) => {
                        let className = "text-gray-700 dark:text-gray-300 transition-colors";
                        if (part.added) {
                            className = "bg-green-100/80 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-1 rounded-sm border-b-2 border-green-500/30 font-medium decoration-green-500/30";
                        } else if (part.removed) {
                            className = "bg-red-100/80 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1 rounded-sm border-b-2 border-red-500/30 line-through decoration-red-500/50";
                        }

                        return (
                            <span key={index} className={className}>
                                {part.value}
                            </span>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 border-t dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-center gap-8 text-xs font-medium uppercase tracking-wider text-gray-500">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-green-400 rounded-full shadow-sm shadow-green-500/50" />
                    <span>Texto Adicionado</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-red-400 rounded-full shadow-sm shadow-red-500/50" />
                    <span className="line-through">Texto Removido</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                    <span>Sem Alterações</span>
                </div>
            </div>
        </div>
    );
};
