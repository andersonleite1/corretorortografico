"use client";

import { type Editor } from "@tiptap/react";
import { type EditorState } from "@tiptap/pm/state";
import { useCompletion } from "@ai-sdk/react";
import { ChevronDown, Loader2, Wand2 } from "lucide-react";
import { useState } from "react";
import { useTiptapContext } from "../Provider";
import { BubbleMenu } from "../BubbleMenu";

type Tone = "professional" | "casual" | "concise" | "expanded" | "creative";

const TONES: { value: Tone; label: string }[] = [
    { value: "professional", label: "Profissional" },
    { value: "casual", label: "Casual" },
    { value: "concise", label: "Conciso" },
    { value: "expanded", label: "Expandido" },
    { value: "creative", label: "Criativo" },
];

interface Props { }

export function AiBubbleMenu({ }: Props) {
    const { editor, userPlan } = useTiptapContext();
    const isPro = userPlan !== "free";
    const [open, setOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const { complete, completion, isLoading, setCompletion } = useCompletion({
        api: "/api/ai/rewrite",
        streamProtocol: "text",
        onError: (err: Error) => {
            setShowPreview(false);
            console.error("AI Error:", err);
            try {
                const data = JSON.parse(err.message);
                if (data.upgradeUrl) {
                    alert(`${data.message || data.error}\n\nAcesse: /pricing`);
                } else {
                    alert(data.error || data.message || "Erro na IA. Tente novamente.");
                }
            } catch {
                alert(`Erro na IA: ${err.message}`);
            }
        },
    });

    const handleRewrite = (tone: Tone) => {
        const text = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to,
            " "
        );
        if (!text.trim()) return;
        setCompletion("");
        setShowPreview(true);
        setOpen(false);
        complete("", { body: { text, tone, language: "pt-BR" } });
    };

    const handleAccept = () => {
        const { from, to } = editor.state.selection;
        editor.chain().focus().deleteRange({ from, to }).insertContent(completion).run();
        setCompletion("");
        setShowPreview(false);
        setOpen(false);
    };

    const handleDiscard = () => {
        setCompletion("");
        setShowPreview(false);
    };

    return (
        <BubbleMenu
            editor={editor}
            pluginKey="aiBubbleMenu"
            shouldShow={({ state }: { state: EditorState }) => {
                const { from, to } = state.selection;
                return from !== to && (!isLoading || showPreview);
            }}
            options={{
                placement: "bottom-start",
                offset: 8,
            }}
            appendTo={() => document.body}
        >
            <div className="relative flex flex-col gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-1.5 pointer-events-auto min-w-[180px]">
                {!showPreview ? (
                    <>
                        <button
                            onClick={() => setOpen(!open)}
                            disabled={isLoading}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 ${isPro
                                ? "bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white hover:shadow-indigo-500/20"
                                : "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                }`}
                        >
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                            Reescrever IA
                            <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
                            {!isPro && <span className="ml-1 px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-[10px] uppercase tracking-tighter">Pro</span>}
                        </button>

                        {open && (
                            <div className="absolute top-full left-0 mt-2 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[10000] p-1 animate-in fade-in slide-in-from-top-2 text-wrap">
                                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    Escolha o tom
                                </div>
                                {TONES.map((t) => (
                                    <button
                                        key={t.value}
                                        onClick={() => { setOpen(false); handleRewrite(t.value); }}
                                        className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-200 transition-colors"
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col gap-3 p-1 max-w-sm animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-2 pt-1">
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Sugestão da IA</span>
                            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />}
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-xs leading-relaxed text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 max-h-48 overflow-y-auto scrollbar-thin">
                            {completion || (isLoading && "Gerando sugestão...")}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleAccept}
                                disabled={isLoading && !completion}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                            >
                                Aceitar
                            </button>
                            <button
                                onClick={handleDiscard}
                                className="flex-1 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 text-[11px] font-bold py-2 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
                            >
                                Descartar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </BubbleMenu>
    );
}
