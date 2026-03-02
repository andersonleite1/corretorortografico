"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useUser } from "@clerk/nextjs";
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
  const { isSignedIn, isLoaded: isClerkLoaded } = useUser();

  const [buttonVisibility, setButtonVisibility] = useState<
    Record<ToolbarButtonId, boolean>
  >({ ...DEFAULT_SETTINGS });
  const [activeTones, setActiveTones] = useState<Record<ToneId, boolean>>({
    ...DEFAULT_TONES,
  });
  const [customTones, setCustomTones] = useState<CustomTone[]>([]);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  // Ref para debounce de sincronização com o banco
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref para rastrear o último estado de autenticação que iniciamos o carregamento
  // Previne chamadas duplicadas quando há re-renders, mas permite corretamente
  // detectar mudanças reais (ex: login/logout).
  const loadedForSignedIn = useRef<boolean | null | undefined>(null);
  const [clerkTimeout, setClerkTimeout] = useState(false);

  // Timeout para evitar skeleton infinito se Clerk demorar a responder
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isClerkLoaded) {
        console.warn(
          "[EditorSettings] Clerk demorou mais de 2s para carregar. Usando defaults.",
        );
        setClerkTimeout(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isClerkLoaded]);

  // -----------------------------------------------------------------------
  // Carregamento inicial das configurações
  // -----------------------------------------------------------------------
  useEffect(() => {
    // Aguardar Clerk resolver o estado de auth (ou timeout)
    if (!isClerkLoaded && !clerkTimeout) return;

    // Evitar recarregar se já carregamos para este mesmo estado de auth
    if (loadedForSignedIn.current === isSignedIn) return;
    loadedForSignedIn.current = isSignedIn;

    if (isSignedIn) {
      // Usuário autenticado — carrega do banco (isolamento multi-tenant)
      setIsLoadingSettings(true);
      fetch("/api/editor-settings")
        .then((res) => {
          if (!res.ok)
            throw new Error(
              `HTTP ${res.status}: Falha ao carregar configurações`,
            );
          return res.json();
        })
        .then((data) => {
          setButtonVisibility({
            ...DEFAULT_SETTINGS,
            ...(data.toolbarSettings ?? {}),
          });
          setActiveTones({ ...DEFAULT_TONES, ...(data.activeTones ?? {}) });
          setCustomTones(
            Array.isArray(data.customTones) ? data.customTones : [],
          );
        })
        .catch((err) => {
          console.error(
            "[EditorSettings] Erro ao carregar do banco, usando localStorage como fallback:",
            err,
          );
          // Fallback para localStorage em caso de erro de rede
          const local = loadFromLocalStorage();
          setButtonVisibility(local.buttonVisibility);
          setActiveTones(local.activeTones);
          setCustomTones(local.customTones);
        })
        .finally(() => setIsLoadingSettings(false));
    } else {
      // Usuário anônimo — usa apenas localStorage
      const local = loadFromLocalStorage();
      setButtonVisibility(local.buttonVisibility);
      setActiveTones(local.activeTones);
      setCustomTones(local.customTones);
      // Garante que não ficamos travados em loading se formos anônimos
      setIsLoadingSettings(false);
    }
  }, [isClerkLoaded, isSignedIn]);

  // -----------------------------------------------------------------------
  // Sincronização com o banco (debounced — 600ms após a última alteração)
  // -----------------------------------------------------------------------
  const syncToDatabase = useCallback(
    (payload: {
      toolbarSettings?: Record<ToolbarButtonId, boolean>;
      activeTones?: Record<ToneId, boolean>;
      customTones?: CustomTone[];
    }) => {
      if (!isSignedIn) return;

      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        fetch("/api/editor-settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch((err) =>
          console.error(
            "[EditorSettings] Erro ao sincronizar com o banco:",
            err,
          ),
        );
      }, 600);
    },
    [isSignedIn],
  );

  // -----------------------------------------------------------------------
  // Ações — escrevem no localStorage (imediato) + sincronizam banco (debounce)
  // -----------------------------------------------------------------------
  const toggleButtonVisibility = (id: ToolbarButtonId) => {
    setButtonVisibility((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(LS_TOOLBAR, JSON.stringify(next));
      syncToDatabase({ toolbarSettings: next });
      return next;
    });
  };

  const toggleToneActivation = (id: ToneId) => {
    setActiveTones((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(LS_TONES, JSON.stringify(next));
      syncToDatabase({ activeTones: next });
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
      syncToDatabase({ customTones: next });
      return next;
    });
  };

  const deleteCustomTone = (id: string) => {
    setCustomTones((prev) => {
      const next = prev.filter((t) => t.id !== id);
      localStorage.setItem(LS_CUSTOM, JSON.stringify(next));
      syncToDatabase({ customTones: next });
      return next;
    });
  };

  const toggleCustomToneActivation = (id: string) => {
    setCustomTones((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, isActive: !t.isActive } : t,
      );
      localStorage.setItem(LS_CUSTOM, JSON.stringify(next));
      syncToDatabase({ customTones: next });
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
