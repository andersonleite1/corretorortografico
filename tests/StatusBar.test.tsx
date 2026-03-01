import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import StatusBar from "@/components/TiptapEditor/components/StatusBar";

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockToggleFullScreen = vi.fn();
const mockToggleSourceMode = vi.fn();

const defaultContextValue = {
  editor: {} as any,
  contentElement: { current: document.createElement("div") },
  isFullScreen: false,
  isSourceMode: false,
  toggleFullScreen: mockToggleFullScreen,
  toggleSourceMode: mockToggleSourceMode,
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
  draftActions: undefined as any,
  isMobile: false,
  documentTitle: undefined as string | undefined,
};

let mockEditorStateReturn = {
  words: 42,
  characters: 210,
  enabled: false,
  status: "idle",
  count: 0,
  message: null,
};

vi.mock("@tiptap/react", () => ({
  useEditorState: ({ selector }: { selector: (ctx: any) => any }) =>
    selector({
      editor: {
        storage: {
          characterCount: {
            words: () => mockEditorStateReturn.words,
            characters: () => mockEditorStateReturn.characters,
          },
          languageTool: {
            enabled: mockEditorStateReturn.enabled,
            status: mockEditorStateReturn.status,
            issues: { length: mockEditorStateReturn.count },
            message: mockEditorStateReturn.message,
          },
        },
      },
    }),
}));

vi.mock("@/components/TiptapEditor/components/Provider", () => ({
  useTiptapContext: () => defaultContextValue,
}));

vi.mock(
  "@/components/providers/EditorSettingsProvider",
  async (importOriginal) => {
    const original = (await importOriginal()) as any;
    return {
      ...original,
      useEditorSettings: () => ({
        buttonVisibility: {
          sourceCode: true,
          fullScreen: true,
          shortcuts: true,
          browserSpellcheck: false,
        },
      }),
    };
  },
);

// Mock MenuButton so we don't depend on Tooltip/Ref issues
vi.mock("@/components/TiptapEditor/components/MenuButton", () => ({
  default: ({ text, onClick, tooltip }: any) => (
    <button onClick={onClick} title={tooltip}>
      {text}
    </button>
  ),
}));

// Mock ShortcutsDialog
vi.mock("@/components/shared/ShortcutsDialog", () => ({
  ShortcutsDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="shortcuts-dialog">Atalhos</div> : null,
}));

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("StatusBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEditorStateReturn = {
      words: 42,
      characters: 210,
      enabled: false,
      status: "idle",
      count: 0,
      message: null,
    };
    defaultContextValue.isMobile = false;
    defaultContextValue.draftActions = undefined;
  });

  it("exibe a contagem de palavras", () => {
    render(<StatusBar />);
    expect(screen.getByText(/42/)).toBeInTheDocument();
    expect(screen.getByText(/Palavras/)).toBeInTheDocument();
  });

  it("exibe a contagem de caracteres", () => {
    render(<StatusBar />);
    expect(screen.getByText(/210/)).toBeInTheDocument();
    expect(screen.getByText(/Caracteres/)).toBeInTheDocument();
  });

  it("botão de code-source chama toggleSourceMode", () => {
    render(<StatusBar />);
    fireEvent.click(screen.getByText("Código-fonte"));
    expect(mockToggleSourceMode).toHaveBeenCalled();
  });

  it("botão de tela cheia chama toggleFullScreen", () => {
    render(<StatusBar />);
    fireEvent.click(screen.getByText("Tela cheia"));
    expect(mockToggleFullScreen).toHaveBeenCalled();
  });

  it("botão de atalhos abre ShortcutsDialog", () => {
    render(<StatusBar />);
    const keyboardButton = screen.getByTitle("Atalhos de Teclado");
    fireEvent.click(keyboardButton);
    expect(screen.getByTestId("shortcuts-dialog")).toBeInTheDocument();
  });

  it("botão de atalhos não exibido em mobile", () => {
    defaultContextValue.isMobile = true;
    render(<StatusBar />);
    expect(screen.queryByTitle("Atalhos de Teclado")).not.toBeInTheDocument();
  });

  it("não exibe label de LanguageTool quando enabled=false", () => {
    render(<StatusBar />);
    expect(screen.queryByText("Revisando…")).not.toBeInTheDocument();
    expect(screen.queryByText(/Sugestões:/)).not.toBeInTheDocument();
  });

  it('exibe "Revisando…" quando LanguageTool status=checking e enabled=true', () => {
    mockEditorStateReturn.enabled = true;
    mockEditorStateReturn.status = "checking";
    render(<StatusBar />);
    expect(screen.getByText("Revisando…")).toBeInTheDocument();
  });

  it('exibe "Sugestões: N" quando LanguageTool status=ready e enabled=true', () => {
    mockEditorStateReturn.enabled = true;
    mockEditorStateReturn.status = "ready";
    mockEditorStateReturn.count = 7;
    render(<StatusBar />);
    expect(screen.getByText("Sugestões: 7")).toBeInTheDocument();
  });

  it('exibe "Limite atingido" quando LanguageTool status=rate_limited e enabled=true', () => {
    mockEditorStateReturn.enabled = true;
    mockEditorStateReturn.status = "rate_limited";
    render(<StatusBar />);
    expect(screen.getByText("Limite atingido")).toBeInTheDocument();
  });

  it('exibe "Indisponível" quando LanguageTool status=error e enabled=true', () => {
    mockEditorStateReturn.enabled = true;
    mockEditorStateReturn.status = "error";
    render(<StatusBar />);
    expect(screen.getByText("Indisponível")).toBeInTheDocument();
  });

  describe("Status de rascunho", () => {
    it('exibe "Salvando…" quando savingStatus="saving"', () => {
      defaultContextValue.draftActions = {
        savingStatus: "saving",
        drafts: [],
        onSaveDraft: vi.fn(),
        onLoadDraft: vi.fn(),
        onDeleteDraft: vi.fn(),
        onCompareDraft: vi.fn(),
      } as any;
      render(<StatusBar />);
      expect(screen.getByText("Salvando rascunho...")).toBeInTheDocument();
    });

    it('exibe "Salvo" quando savingStatus="saved"', () => {
      defaultContextValue.draftActions = {
        savingStatus: "saved",
        drafts: [],
        onSaveDraft: vi.fn(),
        onLoadDraft: vi.fn(),
        onDeleteDraft: vi.fn(),
        onCompareDraft: vi.fn(),
      } as any;
      render(<StatusBar />);
      expect(screen.getByText("Rascunho salvo")).toBeInTheDocument();
    });

    it('exibe "Erro ao salvar" quando savingStatus="error"', () => {
      defaultContextValue.draftActions = {
        savingStatus: "error",
        drafts: [],
        onSaveDraft: vi.fn(),
        onLoadDraft: vi.fn(),
        onDeleteDraft: vi.fn(),
        onCompareDraft: vi.fn(),
      } as any;
      render(<StatusBar />);
      expect(screen.getByText("Erro no rascunho")).toBeInTheDocument();
    });

    it('não exibe status quando savingStatus="idle"', () => {
      defaultContextValue.draftActions = {
        savingStatus: "idle",
        drafts: [],
        onSaveDraft: vi.fn(),
        onLoadDraft: vi.fn(),
        onDeleteDraft: vi.fn(),
        onCompareDraft: vi.fn(),
      } as any;
      render(<StatusBar />);
      expect(screen.queryByText("Salvando...")).not.toBeInTheDocument();
      expect(screen.queryByText("Rascunho salvo")).not.toBeInTheDocument();
    });
  });

  describe("Status de Sincronização", () => {
    it('exibe "Sincronizado" quando documentTitle está presente', () => {
      defaultContextValue.documentTitle = "Meu Documento";
      render(<StatusBar />);
      expect(screen.getByText("Sincronizado")).toBeInTheDocument();
    });

    it('exibe "Local" quando não há documentTitle nem docId', () => {
      defaultContextValue.documentTitle = undefined;
      // Note: window.location.search mock is tricky, but let's assume it's empty by default
      render(<StatusBar />);
      expect(screen.getByText("Local")).toBeInTheDocument();
    });
  });
});
