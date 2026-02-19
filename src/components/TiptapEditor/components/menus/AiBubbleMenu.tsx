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

    const { complete, isLoading } = useCompletion({
        api: "/api/ai/rewrite",
        onFinish: (_prompt: string, result: string) => {
            const { from, to } = editor.state.selection;
            editor.chain().focus().deleteRange({ from, to }).insertContent(result).run();
            setOpen(false);
        },
        onError: (err: Error) => {
            console.error("AI Error:", err);
            try {
                const data = JSON.parse(err.message);
                if (data.upgradeUrl) {
                    alert(`${data.message}\n\nAcesse: /pricing`);
                } else {
                    alert("Erro na IA. Tente novamente.");
                }
            } catch {
                alert("Erro na IA. Tente novamente.");
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
        complete("", { body: { text, tone, language: "pt-BR" } });
    };

    return (
        <BubbleMenu
            editor={editor}
            pluginKey="aiBubbleMenu"
            shouldShow={({ state }: { state: EditorState }) => {
                const { from, to } = state.selection;
                return from !== to && !isLoading;
            }}
            options={{
                placement: "bottom-start",
                offset: 6,
            }}
        >
            <div className="relative flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-1.5 pointer-events-auto">
                <button
                    onClick={() => isPro ? setOpen(!open) : window.location.href = "/pricing"}
                    disabled={isLoading}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 ${isPro
                        ? "bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white hover:shadow-indigo-500/20"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                        }`}
                >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    {isPro ? (
                        <>
                            Reescrever IA
                            <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
                        </>
                    ) : "⚡ Pro"}
                </button>

                {open && isPro && (
                    <div className="absolute bottom-full left-0 mb-2 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[100] p-1 animate-in fade-in slide-in-from-bottom-2">
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
            </div>
        </BubbleMenu>
    );
}
