"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  ToolbarButtonId,
  ToneId,
  CustomTone,
  DEFAULT_SETTINGS,
  DEFAULT_TONES,
  TOOLBAR_BUTTON_LABELS,
  TONE_LABELS,
  TONE_DESCRIPTIONS,
  TONE_ICONS,
} from "./editor-settings.constants";

// Re-exporta tudo do constants para não quebrar imports existentes
export type { ToolbarButtonId, ToneId, CustomTone };
export {
  DEFAULT_SETTINGS,
  DEFAULT_TONES,
  TOOLBAR_BUTTON_LABELS,
  TONE_LABELS,
  TONE_DESCRIPTIONS,
  TONE_ICONS,
};

// ---------------------------------------------------------------------------
// Chaves de localStorage (fallback para usuários anônimos)
// ---------------------------------------------------------------------------
const LS_TOOLBAR = "editor_toolbar_settings";
const LS_TONES = "editor_active_tones";
const LS_CUSTOM = "editor_custom_tones";

// ---------------------------------------------------------------------------
// Helpers de localStorage
// ---------------------------------------------------------------------------
function loadFromLocalStorage(): {
  buttonVisibility: Record<ToolbarButtonId, boolean>;
  activeTones: Record<ToneId, boolean>;
  customTones: CustomTone[];
} {
  if (typeof window === "undefined") {
    return {
      buttonVisibility: DEFAULT_SETTINGS,
      activeTones: DEFAULT_TONES,
      customTones: [],
    };
  }
  let buttonVisibility = { ...DEFAULT_SETTINGS };
  let activeTones = { ...DEFAULT_TONES };
  let customTones: CustomTone[] = [];

  try {
    const raw = localStorage.getItem(LS_TOOLBAR);
    if (raw) buttonVisibility = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    /* ignorar JSON inválido */
  }

  try {
    const raw = localStorage.getItem(LS_TONES);
    if (raw) activeTones = { ...DEFAULT_TONES, ...JSON.parse(raw) };
  } catch {
    /* ignorar JSON inválido */
  }

  try {
    const raw = localStorage.getItem(LS_CUSTOM);
    if (raw) customTones = JSON.parse(raw);
  } catch {
    /* ignorar JSON inválido */
  }

  return { buttonVisibility, activeTones, customTones };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
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
  /** true enquanto as configurações estão sendo carregadas do banco */
  isLoadingSettings: boolean;
}

const EditorSettingsContext = createContext<EditorSettingsContextData>({
  buttonVisibility: DEFAULT_SETTINGS,
  toggleButtonVisibility: () => {},
  activeTones: DEFAULT_TONES,
  toggleToneActivation: () => {},
  customTones: [],
  addCustomTone: () => {},
  deleteCustomTone: () => {},
  toggleCustomToneActivation: () => {},
  isSettingsDialogOpen: false,
  setIsSettingsDialogOpen: () => {},
  isLoadingSettings: false,
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const EditorSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [buttonVisibility, setButtonVisibility] = useState<
    Record<ToolbarButtonId, boolean>
  >({ ...DEFAULT_SETTINGS });
  const [activeTones, setActiveTones] = useState<Record<ToneId, boolean>>({
    ...DEFAULT_TONES,
  });
  const [customTones, setCustomTones] = useState<CustomTone[]>([]);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  useEffect(() => {
    const local = loadFromLocalStorage();
    setButtonVisibility(local.buttonVisibility);
    setActiveTones(local.activeTones);
    setCustomTones(local.customTones);
    setIsLoadingSettings(false);
  }, []);

  // -----------------------------------------------------------------------
  // Preferências locais: nenhuma conta ou sincronização remota.
  // -----------------------------------------------------------------------
  const toggleButtonVisibility = (id: ToolbarButtonId) => {
    setButtonVisibility((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(LS_TOOLBAR, JSON.stringify(next));
      return next;
    });
  };

  const toggleToneActivation = (id: ToneId) => {
    setActiveTones((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(LS_TONES, JSON.stringify(next));
      return next;
    });
  };

  const addCustomTone = (tone: Omit<CustomTone, "id" | "isActive">) => {
    setCustomTones((prev) => {
      if (prev.length >= 5) return prev;
      const newTone: CustomTone = {
        ...tone,
        id: `custom-${Date.now()}`,
        isActive: true,
      };
      const next = [...prev, newTone];
      localStorage.setItem(LS_CUSTOM, JSON.stringify(next));
      return next;
    });
  };

  const deleteCustomTone = (id: string) => {
    setCustomTones((prev) => {
      const next = prev.filter((t) => t.id !== id);
      localStorage.setItem(LS_CUSTOM, JSON.stringify(next));
      return next;
    });
  };

  const toggleCustomToneActivation = (id: string) => {
    setCustomTones((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, isActive: !t.isActive } : t,
      );
      localStorage.setItem(LS_CUSTOM, JSON.stringify(next));
      return next;
    });
  };

  return (
    <EditorSettingsContext.Provider
      value={{
        buttonVisibility,
        toggleButtonVisibility,
        activeTones,
        toggleToneActivation,
        customTones,
        addCustomTone,
        deleteCustomTone,
        toggleCustomToneActivation,
        isSettingsDialogOpen,
        setIsSettingsDialogOpen,
        isLoadingSettings,
      }}
    >
      {children}
    </EditorSettingsContext.Provider>
  );
};

export const useEditorSettings = () => useContext(EditorSettingsContext);
