"use client";

import { useMemo, useState } from "react";
import { useTiptapContext } from "./Provider";
import { Icon } from "./ui/Icon";
import clsx from "clsx";
import { useEditorState } from "@tiptap/react";
import { LanguageToolIssue } from "@/types/languageTool";

export const LanguageToolSidebar = ({ isOpen }: { isOpen: boolean }) => {
    const { editor, setIsLTSidebarOpen } = useTiptapContext();
    const [activeTab, setActiveTab] = useState<"resumo" | "detalhes">("resumo");

    const ltState = useEditorState({
        editor,
        selector: (ctx) => {
            const storage = (ctx.editor.storage as any).languageTool;
            return {
                issues: (storage?.issues as LanguageToolIssue[]) || [],
                status: storage?.status || "idle",
                enabled: storage?.enabled ?? false,
            };
        },
    });

    const stats = useMemo(() => {
        const issues = ltState.issues;
        const countByType = {
            spelling: issues.filter(i => i.issueType?.toLowerCase().includes("spelling") || i.issueType === "misspelling").length,
            grammar: issues.filter(i => i.issueType?.toLowerCase().includes("grammar") || !i.issueType?.toLowerCase().includes("spelling")).length,
            style: issues.filter(i => i.issueType?.toLowerCase().includes("style") || i.issueType?.toLowerCase().includes("typographical")).length,
        };

        // If something maps to multiple, we might want to be more precise, but for now let's use common categories
        // Better categorization based on ruleId or issueType
        const spelling = issues.filter(i => i.issueType === "misspelling" || i.issueType === "unclassified").length;
        const grammar = issues.filter(i => i.issueType === "grammar" || i.issueType === "concordance").length;
        const style = issues.filter(i => i.issueType === "typographical" || i.issueType === "style").length;

        const words = editor.storage.characterCount.words();
        const chars = editor.storage.characterCount.characters();
        const readingTime = Math.max(1, Math.ceil(words / 200));

        return {
            spelling,
            grammar,
            style,
            words,
            chars,
            readingTime,
            total: issues.length
        };
    }, [ltState.issues, editor]);

    const handleApplySuggestion = (from: number, to: number, text: string) => {
        editor.commands.applyLanguageToolSuggestion({ from, to, text });
    };

    const handleFixAll = () => {
        const issuesWithSuggestions = ltState.issues.filter(i => i.replacements && i.replacements.length > 0);

        if (issuesWithSuggestions.length === 0) return;

        // Sort issues from end to start to avoid position shifting
        const sortedIssues = [...issuesWithSuggestions].sort((a, b) => b.from - a.from);

        const chain = editor.chain().focus();
        sortedIssues.forEach(issue => {
            chain.insertContentAt({ from: issue.from, to: issue.to }, issue.replacements[0]);
        });
        chain.run();
    };

    if (!isOpen) return null;

    return (
        <div className="rte-lt-sidebar animate-in slide-in-from-right duration-300">
            <div className="rte-lt-sidebar__tabs">
                <button
                    className={clsx("rte-lt-sidebar__tab", activeTab === "resumo" && "rte-lt-sidebar__tab--active")}
                    onClick={() => setActiveTab("resumo")}
                >
                    Resumo
                </button>
                <button
                    className={clsx("rte-lt-sidebar__tab", activeTab === "detalhes" && "rte-lt-sidebar__tab--active")}
                    onClick={() => setActiveTab("detalhes")}
                >
                    Dados detalhados
                </button>
            </div>

            <div className="rte-lt-sidebar__content">
                {activeTab === "resumo" ? (
                    <div className="animate-in fade-in duration-300">
                        <div className="rte-lt-sidebar__section-title">Categorias</div>

                        <div className="rte-lt-sidebar__progress-item">
                            <div className="header">
                                <div className="label-wrap">
                                    <span className="dot bg-[#ef4444]" />
                                    Ortografia
                                </div>
                                <span className="count">{stats.spelling}</span>
                            </div>
                            <div className="bar-bg">
                                <div
                                    className="bar-fill bg-[#ef4444]"
                                    style={{ width: `${Math.min(100, (stats.spelling / Math.max(1, stats.total)) * 100)}%` }}
                                />
                            </div>
                        </div>

                        <div className="rte-lt-sidebar__progress-item">
                            <div className="header">
                                <div className="label-wrap">
                                    <span className="dot bg-[#f59e0b]" />
                                    Gramática
                                </div>
                                <span className="count">{stats.grammar}</span>
                            </div>
                            <div className="bar-bg">
                                <div
                                    className="bar-fill bg-[#f59e0b]"
                                    style={{ width: `${Math.min(100, (stats.grammar / Math.max(1, stats.total)) * 100)}%` }}
                                />
                            </div>
                        </div>

                        <div className="rte-lt-sidebar__progress-item">
                            <div className="header">
                                <div className="label-wrap">
                                    <span className="dot bg-[#8b5cf6]" />
                                    Estilo/Pontuação
                                </div>
                                <span className="count">{stats.style}</span>
                            </div>
                            <div className="bar-bg">
                                <div
                                    className="bar-fill bg-[#8b5cf6]"
                                    style={{ width: `${Math.min(100, (stats.style / Math.max(1, stats.total)) * 100)}%` }}
                                />
                            </div>
                        </div>

                        <div className="rte-lt-sidebar__stat-grid">
                            <div className="rte-lt-sidebar__stat-box">
                                <span className="label">Caracteres</span>
                                <span className="value">{stats.chars}</span>
                            </div>
                            <div className="rte-lt-sidebar__stat-box">
                                <span className="label">Palavras</span>
                                <span className="value">{stats.words}</span>
                            </div>
                            <div className="rte-lt-sidebar__stat-box">
                                <span className="label">Tempo de Leitura</span>
                                <span className="value">{stats.readingTime} min</span>
                            </div>
                            <div className="rte-lt-sidebar__stat-box">
                                <span className="label">Status</span>
                                <span className="status-link">Sugestões prontas</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-300">
                        {ltState.issues.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-sm text-gray-500">Nenhum erro encontrado. Bom trabalho!</p>
                            </div>
                        ) : (
                            ltState.issues.map((issue) => (
                                <div
                                    key={issue.id}
                                    className={clsx(
                                        "rte-lt-sidebar__card",
                                        issue.issueType === "misspelling" ? "rte-lt-sidebar__card--spelling" :
                                            issue.issueType === "typographical" ? "rte-lt-sidebar__card--style" :
                                                "rte-lt-sidebar__card--grammar"
                                    )}
                                >
                                    <div className="lt-issue__title">
                                        <span className={clsx(
                                            "dot",
                                            issue.issueType === "misspelling" ? "bg-[#ef4444]" :
                                                issue.issueType === "typographical" ? "bg-[#8b5cf6]" :
                                                    "bg-[#f59e0b]"
                                        )} />
                                        {issue.ruleDescription || "Sugestão"}
                                    </div>
                                    <div className="lt-issue__desc">{issue.message}</div>
                                    {issue.sentence && (
                                        <div className="lt-issue__sentence" dangerouslySetInnerHTML={{ __html: issue.sentence.replace(/<fixed>(.*?)<\/fixed>/g, "<strong>$1</strong>") }} />
                                    )}
                                    <div className="lt-issue__suggestions">
                                        {issue.replacements.slice(0, 3).map((rep, idx) => (
                                            <button
                                                key={idx}
                                                className="lt-issue__suggestion"
                                                onClick={() => handleApplySuggestion(issue.from, issue.to, rep)}
                                            >
                                                {rep}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <div className="rte-lt-sidebar__footer">
                <div className="rte-lt-sidebar__tip">
                    <span className="label">DICA RÁPIDA</span>
                    <span className="title">Corrija tudo de uma vez</span>
                    <p className="desc">Aplica a primeira sugestão de cada erro detectado automaticamente.</p>
                </div>
                <button
                    className="rte-lt-sidebar__fix-all"
                    onClick={handleFixAll}
                    disabled={ltState.issues.length === 0}
                >
                    <Icon name="Check" size={18} />
                    Corrigir todos
                </button>
            </div>
        </div>
    );
};

export default LanguageToolSidebar;
