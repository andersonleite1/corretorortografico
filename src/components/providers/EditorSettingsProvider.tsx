"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ToolbarButtonId =
    | "undo" | "redo" | "save" | "bold" | "italic" | "underline" | "moreMark"
    | "textColor" | "textHighlight" | "align" | "bulletList" | "orderedList"
    | "lineHeight" | "link" | "table" | "codeBlock" | "insert" | "heading"
    | "fontFamily" | "fontSize" | "languageTool" | "languageToolSidebar"
    | "browserSpellcheck" | "export" | "preview" | "documents" | "drafts"
    | "importPdf" | "copyEditor" | "clearEditor";

export const DEFAULT_SETTINGS: Record<ToolbarButtonId, boolean> = {
    undo: true, redo: true, save: true, bold: true, italic: true, underline: true, moreMark: true,
    textColor: true, textHighlight: true, align: true, bulletList: true, orderedList: true,
    lineHeight: true, link: true, table: true, codeBlock: true, insert: true, heading: true,
    fontFamily: true, fontSize: true, languageTool: true, languageToolSidebar: true,
    browserSpellcheck: true, export: true, preview: true, documents: true, drafts: true,
    importPdf: true, copyEditor: true, clearEditor: true
};

export const TOOLBAR_BUTTON_LABELS: Record<ToolbarButtonId, string> = {
    undo: "Desfazer",
    redo: "Refazer",
    save: "Salvar",
    bold: "Negrito",
    italic: "Itálico",
    underline: "Sublinhado",
    moreMark: "Mais Formatações",
    textColor: "Cor do Texto",
    textHighlight: "Cor de Fundo",
    align: "Alinhamento",
    bulletList: "Lista com Marcadores",
    orderedList: "Lista Numerada",
    lineHeight: "Espaçamento de Linhas",
    link: "Inserir Link",
    table: "Inserir Tabela",
    codeBlock: "Bloco de Código",
    insert: "Inserir Outros",
    heading: "Cabeçalhos",
    fontFamily: "Fonte",
    fontSize: "Tamanho da Fonte",
    languageTool: "Corretor (LanguageTool)",
    languageToolSidebar: "Painel do Corretor",
    browserSpellcheck: "Corretor do Navegador",
    export: "Exportar",
    preview: "Visualizar",
    documents: "Meus Documentos",
    drafts: "Rascunhos",
    importPdf: "Importar PDF",
    copyEditor: "Copiar Texto",
    clearEditor: "Limpar Editor"
};

interface EditorSettingsContextData {
    buttonVisibility: Record<ToolbarButtonId, boolean>;
    toggleButtonVisibility: (id: ToolbarButtonId) => void;
    isSettingsDialogOpen: boolean;
    setIsSettingsDialogOpen: (open: boolean) => void;
}

const EditorSettingsContext = createContext<EditorSettingsContextData>({
    buttonVisibility: DEFAULT_SETTINGS,
    toggleButtonVisibility: () => { },
    isSettingsDialogOpen: false,
    setIsSettingsDialogOpen: () => { },
});

export const EditorSettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [buttonVisibility, setButtonVisibility] = useState<Record<ToolbarButtonId, boolean>>(DEFAULT_SETTINGS);
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("editor_toolbar_settings");
        if (saved) {
            try {
                setButtonVisibility({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
            } catch (e) {
                console.error("Failed to parse editor settings");
            }
        }
    }, []);

    const toggleButtonVisibility = (id: ToolbarButtonId) => {
        setButtonVisibility((prev) => {
            const nextSettings = { ...prev, [id]: !prev[id] };
            localStorage.setItem("editor_toolbar_settings", JSON.stringify(nextSettings));
            return nextSettings;
        });
    };

    return (
        <EditorSettingsContext.Provider value={{ buttonVisibility, toggleButtonVisibility, isSettingsDialogOpen, setIsSettingsDialogOpen }}>
            {children}
        </EditorSettingsContext.Provider>
    );
};

export const useEditorSettings = () => useContext(EditorSettingsContext);
