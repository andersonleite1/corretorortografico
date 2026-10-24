import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LanguageToolSidebar } from "@/components/TiptapEditor/components/LanguageToolSidebar";

// ── Hoisted State ─────────────────────────────────────────────────────────────
const { mockIssues, mockState } = vi.hoisted(() => ({
  mockIssues: [
    {
      id: "issue-1",
      from: 0,
      to: 5,
      message: "Possível erro de ortografia",
      ruleDescription: "Ortografia",
      issueType: "misspelling",
      replacements: ["Olá", "Ola"],
      category: "spellcheck",
    },
    {
      id: "issue-2",
      from: 6,
      to: 12,
      message: "Erro gramatical detectado",
      ruleDescription: "Gramática",
      issueType: "grammar",
      replacements: ["corretamente"],
      category: "grammar",
    },
    {
      id: "issue-3",
      from: 13,
      to: 20,
      message: "Sugestão estilística",
      ruleDescription: "Estilo",
      issueType: "typographical",
      replacements: [],
      category: "style",
    },
  ],
  mockState: {
    issues: [] as any[],
    status: "ready",
    enabled: true,
    words: 100,
    characters: 500,
  },
}));

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockApply = vi.fn();
const mockInsertContentAt = vi.fn().mockReturnThis();
const mockRun = vi.fn();
const mockChain = vi.fn(() => ({
  focus: vi.fn().mockReturnThis(),
  insertContentAt: mockInsertContentAt,
  run: mockRun,
}));

const mockEditor = {
  commands: {
    applyLanguageToolSuggestion: mockApply,
  },
  chain: mockChain,
  storage: {
    characterCount: {
      words: vi.fn().mockReturnValue(100),
      characters: vi.fn().mockReturnValue(500),
    },
  },
};

vi.mock("@/components/TiptapEditor/components/Provider", () => ({
  useTiptapContext: () => ({
    editor: mockEditor,
    setIsLTSidebarOpen: vi.fn(),
  }),
}));

vi.mock("@tiptap/react", () => ({
  useEditorState: ({ selector }: { selector: (ctx: any) => any }) => {
    return selector({
      editor: {
        storage: {
          languageTool: {
            issues: mockState.issues,
            status: mockState.status,
            enabled: mockState.enabled,
          },
          characterCount: {
            words: () => mockState.words,
            characters: () => mockState.characters,
          },
        },
      },
    });
  },
}));

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("LanguageToolSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.issues = [...mockIssues];
    mockState.status = "ready";
    mockState.enabled = true;
    mockState.words = 100;
    mockState.characters = 500;
  });

  it("não renderiza nada quando isOpen=false", () => {
    render(<LanguageToolSidebar isOpen={false} />);
    expect(screen.queryByText("Resumo")).not.toBeInTheDocument();
  });

  it('renderiza aba "Resumo" por padrão', () => {
    render(<LanguageToolSidebar isOpen={true} />);
    expect(screen.getByText("Resumo")).toBeInTheDocument();
    expect(screen.getByText("Ortografia")).toBeInTheDocument();
    expect(screen.getByText("Gramática")).toBeInTheDocument();
  });

  it("exibe contagens corretas de Ortografia, Gramática e Estilo", () => {
    render(<LanguageToolSidebar isOpen={true} />);
    // Check text content of elements that should contain the counts
    // The counts are inside span.count
    const countElements = document.querySelectorAll(".count");
    const counts = Array.from(countElements).map((el) => el.textContent);
    // 1 of each type
    expect(counts).toContain("1");
  });

  it("exibe estatísticas de palavras e caracteres", () => {
    render(<LanguageToolSidebar isOpen={true} />);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("exibe tempo de leitura estimado", () => {
    render(<LanguageToolSidebar isOpen={true} />);
    expect(screen.getByText("1 min")).toBeInTheDocument();
  });

  it('alterna para aba "Dados Detalhados" ao clicar', async () => {
    render(<LanguageToolSidebar isOpen={true} />);
    fireEvent.click(screen.getByText("Dados detalhados"));
    await waitFor(() => {
      expect(
        screen.getByText("Possível erro de ortografia"),
      ).toBeInTheDocument();
    });
  });

  it("renderiza cards de issues com sugestões clicáveis", async () => {
    render(<LanguageToolSidebar isOpen={true} />);
    fireEvent.click(screen.getByText("Dados detalhados"));
    await waitFor(() => {
      expect(screen.getByText("Olá")).toBeInTheDocument();
      expect(screen.getByText("Ola")).toBeInTheDocument();
    });
  });

  it("chama applyLanguageToolSuggestion ao clicar em uma sugestão", async () => {
    render(<LanguageToolSidebar isOpen={true} />);
    fireEvent.click(screen.getByText("Dados detalhados"));
    await waitFor(() => screen.getByText("Olá"));
    fireEvent.click(screen.getByText("Olá"));
    expect(mockApply).toHaveBeenCalledWith({ from: 0, to: 5, text: "Olá" });
  });

  it("exibe no máximo 3 sugestões por issue", async () => {
    // Add more replacements to issue-1
    mockState.issues[0].replacements = ["S1", "S2", "S3", "S4"];
    render(<LanguageToolSidebar isOpen={true} />);
    fireEvent.click(screen.getByText("Dados detalhados"));
    await waitFor(() => screen.getByText("S1"));

    const suggestionButtons = screen
      .getAllByRole("button")
      .filter((btn) =>
        ["S1", "S2", "S3", "S4"].includes(btn.textContent || ""),
      );
    expect(suggestionButtons.length).toBe(3);
  });

  it('"Aplicar sugestões" aplica a primeira sugestão de cada issue com replacements', async () => {
    render(<LanguageToolSidebar isOpen={true} />);
    fireEvent.click(screen.getByRole("button", { name: /Aplicar sugestões/ }));
    await waitFor(() => {
      expect(mockInsertContentAt).toHaveBeenCalled();
      expect(mockRun).toHaveBeenCalled();
    });
  });

  it('exibe "Nenhum erro encontrado" quando não há issues', async () => {
    mockState.issues = [];
    render(<LanguageToolSidebar isOpen={true} />);
    fireEvent.click(screen.getByText("Dados detalhados"));
    await waitFor(() => {
      expect(screen.getByText(/Nenhum erro encontrado/)).toBeInTheDocument();
    });
  });
});
