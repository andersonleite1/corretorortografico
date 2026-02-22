"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ToolbarButtonId =
    | "undo" | "redo" | "save" | "bold" | "italic" | "underline" | "moreMark"
    | "textColor" | "textHighlight" | "align" | "bulletList" | "orderedList"
    | "lineHeight" | "link" | "table" | "codeBlock" | "insert" | "heading"
    | "fontFamily" | "fontSize" | "languageTool" | "languageToolSidebar"
    | "browserSpellcheck" | "export" | "preview" | "documents" | "drafts"
    | "importPdf" | "copyEditor" | "clearEditor" | "sourceCode" | "fullScreen";

export type ToneId =
    | "formal" | "casual" | "academic" | "creative" | "simplified" | "romantic"
    | "narrative" | "instagram" | "whatsapp" | "tweet" | "professional" | "persuasive"
    | "friendly" | "prompt";

export interface CustomTone {
    id: string;
    name: string;
    description: string;
    instructions: string;
    isActive: boolean;
}

export const DEFAULT_SETTINGS: Record<ToolbarButtonId, boolean> = {
    undo: true, redo: true, save: true, bold: true, italic: true, underline: true, moreMark: true,
    textColor: true, textHighlight: true, align: true, bulletList: true, orderedList: true,
    lineHeight: true, link: true, table: true, codeBlock: true, insert: true, heading: true,
    fontFamily: true, fontSize: true, languageTool: true, languageToolSidebar: true,
    browserSpellcheck: true, export: true, preview: true, documents: true, drafts: true,
    importPdf: true, copyEditor: true, clearEditor: true, sourceCode: true, fullScreen: true
};

export const DEFAULT_TONES: Record<ToneId, boolean> = {
    formal: true, casual: true, academic: true, creative: true, simplified: true,
    romantic: true, narrative: true, instagram: true, whatsapp: true, tweet: true,
    professional: true, persuasive: true, friendly: true, prompt: true
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
    clearEditor: "Limpar Editor",
    sourceCode: "Código-fonte",
    fullScreen: "Tela cheia"
};

export const TONE_LABELS: Record<ToneId, string> = {
    formal: "FORMAL",
    casual: "CASUAL",
    academic: "ACADÊMICO",
    creative: "CRIATIVO",
    simplified: "SIMPLIFICADO",
    romantic: "ROMÂNTICO",
    narrative: "NARRATIVO",
    instagram: "INSTAGRAM",
    whatsapp: "WHATSAPP",
    tweet: "TWEET",
    professional: "PROFISSIONAL",
    persuasive: "PERSUASIVO",
    friendly: "AMIGÁVEL",
    prompt: "Prompt IA"
};

export const TONE_DESCRIPTIONS: Record<ToneId, string> = {
    formal: "Profissional e sério",
    casual: "Descontraído e informal",
    academic: "Erudito e estruturado",
    creative: "Original e imaginativo",
    simplified: "Simples e direto",
    romantic: "Emotivo e apaixonado",
    narrative: "Para contar histórias",
    instagram: "Estilo social e envolvente",
    whatsapp: "Direto e conversacional",
    tweet: "Conciso e impactante",
    professional: "Focado em negócios",
    persuasive: "Convincente e focado",
    friendly: "Acolhedor e gentil",
    prompt: "Dedicado a agentes LLM"
};

export const TONE_ICONS: Record<ToneId, string> = {
    formal: "👔",
    casual: "👕",
    academic: "🎓",
    creative: "🎨",
    simplified: "💡",
    romantic: "❤️",
    narrative: "📖",
    instagram: "📸",
    whatsapp: "💬",
    tweet: "🐦",
    professional: "💼",
    persuasive: "🎯",
    friendly: "😊",
    prompt: "🤖"
};

interface EditorSettingsContextData {
    buttonVisibility: Record<ToolbarButtonId, boolean>;
    toggleButtonVisibility: (id: ToolbarButtonId) => void;
    activeTones: Record<ToneId, boolean>;
    toggleToneActivation: (id: ToneId) => void;
    customTones: CustomTone[];
    addCustomTone: (tone: Omit<CustomTone, "id" | "isActive">) => void;
    deleteCustomTone: (id: string) => void;
    toggleCustomToneActivation: (id: string) => void;
    isSettingsDialogOpen: boolean;
    setIsSettingsDialogOpen: (open: boolean) => void;
}

const EditorSettingsContext = createContext<EditorSettingsContextData>({
    buttonVisibility: DEFAULT_SETTINGS,
    toggleButtonVisibility: () => { },
    activeTones: DEFAULT_TONES,
    toggleToneActivation: () => { },
    customTones: [],
    addCustomTone: () => { },
    deleteCustomTone: () => { },
    toggleCustomToneActivation: () => { },
    isSettingsDialogOpen: false,
    setIsSettingsDialogOpen: () => { },
});

export const EditorSettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [buttonVisibility, setButtonVisibility] = useState<Record<ToolbarButtonId, boolean>>(DEFAULT_SETTINGS);
    const [activeTones, setActiveTones] = useState<Record<ToneId, boolean>>(DEFAULT_TONES);
    const [customTones, setCustomTones] = useState<CustomTone[]>([]);
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

    useEffect(() => {
        const savedButtons = localStorage.getItem("editor_toolbar_settings");
        if (savedButtons) {
            try {
                setButtonVisibility({ ...DEFAULT_SETTINGS, ...JSON.parse(savedButtons) });
            } catch (e) {
                console.error("Failed to parse editor button settings");
            }
        }

        const savedTones = localStorage.getItem("editor_active_tones");
        if (savedTones) {
            try {
                setActiveTones({ ...DEFAULT_TONES, ...JSON.parse(savedTones) });
            } catch (e) {
                console.error("Failed to parse editor tone settings");
            }
        }

        const savedCustomTones = localStorage.getItem("editor_custom_tones");
        if (savedCustomTones) {
            try {
                setCustomTones(JSON.parse(savedCustomTones));
            } catch (e) {
                console.error("Failed to parse editor custom tones");
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

    const toggleToneActivation = (id: ToneId) => {
        setActiveTones((prev) => {
            const nextSettings = { ...prev, [id]: !prev[id] };
            localStorage.setItem("editor_active_tones", JSON.stringify(nextSettings));
            return nextSettings;
        });
    };

    const addCustomTone = (tone: Omit<CustomTone, "id" | "isActive">) => {
        setCustomTones((prev) => {
            if (prev.length >= 5) return prev;
            const newTone: CustomTone = {
                ...tone,
                id: `custom-${Date.now()}`,
                isActive: true
            };
            const next = [...prev, newTone];
            localStorage.setItem("editor_custom_tones", JSON.stringify(next));
            return next;
        });
    };

    const deleteCustomTone = (id: string) => {
        setCustomTones((prev) => {
            const next = prev.filter(t => t.id !== id);
            localStorage.setItem("editor_custom_tones", JSON.stringify(next));
            return next;
        });
    };

    const toggleCustomToneActivation = (id: string) => {
        setCustomTones((prev) => {
            const next = prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t);
            localStorage.setItem("editor_custom_tones", JSON.stringify(next));
            return next;
        });
    };

    return (
        <EditorSettingsContext.Provider value={{
            buttonVisibility,
            toggleButtonVisibility,
            activeTones,
            toggleToneActivation,
            customTones,
            addCustomTone,
            deleteCustomTone,
            toggleCustomToneActivation,
            isSettingsDialogOpen,
            setIsSettingsDialogOpen
        }}>
            {children}
        </EditorSettingsContext.Provider>
    );
};

export const useEditorSettings = () => useContext(EditorSettingsContext);
