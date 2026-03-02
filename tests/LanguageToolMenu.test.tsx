import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LanguageToolMenu } from "@/components/TiptapEditor/components/menus/LanguageToolMenu";

// ── Hoisted State ─────────────────────────────────────────────────────────────
const { mockIssues, mockState, mockDOM } = vi.hoisted(() => ({
  mockIssues: [
    {
      id: "issue-1",
      from: 0,
      to: 5,
      message: "Possível erro de ortografia",
      ruleDescription: "Ortografia",
      issueType: "misspelling",
      replacements: ["Olá", "Ola"],
    },
  ],
  mockState: {
    issues: [] as any[],
    enabled: true,
  },
  mockDOM: {
    // we'll mock the editor DOM to dispatch events from it
    el: document.createElement("div"),
  },
}));

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockApply = vi.fn();
const mockIgnore = vi.fn();

const mockEditor = {
  commands: {
    applyLanguageToolSuggestion: mockApply,
    ignoreLanguageToolIssue: mockIgnore,
  },
  view: {
    dom: mockDOM.el,
    dispatch: vi.fn(),
    state: { tr: {} },
  },
  state: {
    selection: { from: 100, to: 100 },
  },
};

vi.mock("@/components/TiptapEditor/components/Provider", () => ({
  useTiptapContext: () => ({
    editor: mockEditor,
    messages: {
      languageTool: {
        fallbackRule: "Regra",
        empty: "Nenhum erro",
        noSuggestions: "Sem sugestões",
        ignore: "Ignorar",
      },
    },
  }),
}));

vi.mock("@tiptap/react", () => ({
  useEditorState: ({ selector }: { selector: (ctx: any) => any }) => {
    return selector({
      editor: {
        storage: {
          languageTool: {
            issues: mockState.issues,
            enabled: mockState.enabled,
          },
        },
      },
    });
  },
}));

let currentShouldShow: any = null;

// Mock the internal BubbleMenu so we don't need Tiptap's portal logic and can assert props
vi.mock("@/components/TiptapEditor/components/BubbleMenu", () => ({
  BubbleMenu: ({ children, shouldShow }: any) => {
    currentShouldShow = shouldShow;
    // We render children only if shouldShow returns true to simulate the real behavior
    const show = shouldShow ? shouldShow({ editor: mockEditor }) : false;
    return show ? <div data-testid="mock-bubble-menu">{children}</div> : null;
  },
}));

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("LanguageToolMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.issues = [...mockIssues];
    mockState.enabled = true;
    currentShouldShow = null;
    mockDOM.el = document.createElement("div");
    document.body.appendChild(mockDOM.el);
    mockEditor.view.dom = mockDOM.el;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  const createFakeErrorElement = (id: string) => {
    const el = document.createElement("span");
    el.className = "lt-error";
    el.setAttribute("data-lt-id", id);
    mockDOM.el.appendChild(el);
    return el;
  };

  it("não renderiza o menu quando não há erro hovered/focado", () => {
    render(<LanguageToolMenu />);
    expect(screen.queryByTestId("mock-bubble-menu")).not.toBeInTheDocument();
  });

  it("exibe o menu ao passar o mouse sobre um elemento de erro (mousemove)", async () => {
    render(<LanguageToolMenu />);

    const errorEl = createFakeErrorElement("issue-1");
    // Simulate mousemove on the editor DOM where event listener is attached
    fireEvent.mouseMove(errorEl);

    await waitFor(() => {
      expect(screen.getByTestId("mock-bubble-menu")).toBeInTheDocument();
      expect(
        screen.getByText("Possível erro de ortografia"),
      ).toBeInTheDocument();
    });
  });

  it("permite aplicar uma sugestão de correção", async () => {
    render(<LanguageToolMenu />);

    const errorEl = createFakeErrorElement("issue-1");
    fireEvent.mouseMove(errorEl);

    await waitFor(() => {
      expect(screen.getByText("Olá")).toBeInTheDocument();
    });

    const applyBtn = screen.getByText("Olá");
    fireEvent.click(applyBtn);

    expect(mockApply).toHaveBeenCalledWith({ from: 0, to: 5, text: "Olá" });
    expect(mockIgnore).toHaveBeenCalledWith("issue-1");

    // The menu should close (shouldShow evaluates to false because hover logic was reset)
    await waitFor(() => {
      expect(currentShouldShow()).toBe(false);
    });
  });

  it("permite ignorar um erro através do botão ignorar", async () => {
    render(<LanguageToolMenu />);

    const errorEl = createFakeErrorElement("issue-1");
    fireEvent.mouseMove(errorEl);

    await waitFor(() => {
      expect(screen.getByText("Ignorar")).toBeInTheDocument();
    });

    const ignoreBtn = screen.getByText("Ignorar");
    fireEvent.click(ignoreBtn);

    expect(mockIgnore).toHaveBeenCalledWith("issue-1");
    // State is reset
    await waitFor(() => {
      expect(currentShouldShow()).toBe(false);
    });
  });

  it("não exibe o menu se LanguageTool estiver desabilitado", async () => {
    mockState.enabled = false;
    render(<LanguageToolMenu />);

    const errorEl = createFakeErrorElement("issue-1");
    fireEvent.mouseMove(errorEl);

    await waitFor(() => {
      expect(screen.queryByTestId("mock-bubble-menu")).not.toBeInTheDocument();
    });
  });

  it("abre o menu ao clicar num erro (mousedown)", async () => {
    render(<LanguageToolMenu />);

    const errorEl = createFakeErrorElement("issue-1");
    fireEvent.mouseDown(errorEl);

    await waitFor(() => {
      expect(screen.getByTestId("mock-bubble-menu")).toBeInTheDocument();
    });
  });
});
