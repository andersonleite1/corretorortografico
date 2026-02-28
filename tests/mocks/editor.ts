import { vi } from "vitest";

/**
 * Creates a minimal mock of the Tiptap Editor object.
 * Extend the returned mock inside individual tests as needed.
 */
export function createMockEditor(overrides: Record<string, any> = {}) {
  const mockEditor = {
    commands: {
      setContent: vi.fn(),
      applyLanguageToolSuggestion: vi.fn(),
      focus: vi.fn().mockReturnThis(),
      deleteRange: vi.fn().mockReturnThis(),
      insertContent: vi.fn().mockReturnThis(),
      run: vi.fn(),
    },
    chain: vi.fn().mockReturnValue({
      focus: vi.fn().mockReturnThis(),
      deleteRange: vi.fn().mockReturnThis(),
      insertContent: vi.fn().mockReturnThis(),
      insertContentAt: vi.fn().mockReturnThis(),
      setContent: vi.fn().mockReturnThis(),
      run: vi.fn(),
    }),
    state: {
      doc: {
        textBetween: vi.fn().mockReturnValue("selected text"),
      },
      selection: {
        from: 0,
        to: 13,
      },
    },
    getText: vi.fn().mockReturnValue("full editor text"),
    getHTML: vi.fn().mockReturnValue("<p>full editor text</p>"),
    getJSON: vi.fn().mockReturnValue({ type: "doc", content: [] }),
    storage: {
      characterCount: {
        words: vi.fn().mockReturnValue(5),
        characters: vi.fn().mockReturnValue(20),
      },
      languageTool: {
        issues: [],
        status: "idle",
        enabled: false,
      },
    },
    setOptions: vi.fn(),
    isDestroyed: false,
    ...overrides,
  };
  return mockEditor;
}

/**
 * A minimal TiptapContext value for use in tests.
 */
export function createMockTiptapContext(overrides: Record<string, any> = {}) {
  const editor = createMockEditor(overrides.editor);
  return {
    editor,
    contentElement: { current: null },
    isFullScreen: false,
    isResizing: false,
    isSourceMode: false,
    toggleFullScreen: vi.fn(),
    toggleSourceMode: vi.fn(),
    setIsResizing: vi.fn(),
    messages: {
      statusBar: {
        source: "Código-fonte",
        fullscreen: "Tela cheia",
        words: "Palavras",
        characters: "Caracteres",
        toggleHint: "Clique aqui para expandir",
        spellcheck: {
          checking: "Revisando…",
          ready: (count: number) => `Sugestões: ${count}`,
          rateLimited: "Limite atingido",
          error: "Indisponível",
        },
      },
    },
    locale: "pt" as const,
    userPlan: "free" as const,
    isSidebarOpen: false,
    setIsSidebarOpen: vi.fn(),
    isLTSidebarOpen: false,
    setIsLTSidebarOpen: vi.fn(),
    onSaveDocument: vi.fn(),
    isSaving: false,
    isMobile: false,
    exportActions: undefined,
    draftActions: undefined,
    documentTitle: undefined,
    ...overrides,
  };
}
