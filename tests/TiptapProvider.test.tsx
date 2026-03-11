import React, { useContext, forwardRef } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act, fireEvent } from "@testing-library/react";
import {
  TiptapProvider,
  useTiptapContext,
} from "@/components/TiptapEditor/components/Provider";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { useEditorSettings } from "@/components/providers/EditorSettingsProvider";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useUserPlan } from "@/components/providers/PlanProvider";

// ── Hoisted Mocks ─────────────────────────────────────────────────────────────
const { mockEditor } = vi.hoisted(() => ({
  mockEditor: {
    getJSON: vi.fn().mockReturnValue({ type: "doc", content: [] }),
    setOptions: vi.fn(),
    storage: { languageTool: { enabled: false } },
    commands: { setLanguageToolEnabled: vi.fn() },
    getText: vi.fn().mockReturnValue(""),
    getHTML: vi.fn().mockReturnValue(""),
  },
}));

vi.mock("@/components/TiptapEditor/hooks/useTiptapEditor", () => ({
  default: () => mockEditor,
}));

vi.mock("@/lib/local-storage", () => ({
  saveLocalDocument: vi.fn().mockReturnValue({ id: "local-123" }),
  getLocalDocuments: vi.fn().mockReturnValue([]),
  deleteLocalDocument: vi.fn(),
  getLocalDocumentById: vi.fn(),
}));

// Mock Tiptap EditorContent with forwardRef if needed (Provider uses ref)
vi.mock("@tiptap/react", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    EditorContent: forwardRef((props: any, ref: any) => (
      <div ref={ref} data-testid="editor-content" />
    )),
  };
});

// Mock sub-components
vi.mock("@/components/TiptapEditor/components/SideBar", () => ({
  default: () => <div data-testid="sidebar" />,
}));
vi.mock("@/components/TiptapEditor/components/LanguageToolSidebar", () => ({
  default: () => <div data-testid="lt-sidebar" />,
}));
vi.mock("@/components/shared/SettingsDialog", () => ({
  SettingsDialog: () => <div data-testid="settings-dialog" />,
}));
vi.mock("@/components/SourceEditor/Editor", () => ({
  default: () => <div data-testid="codemirror" />,
}));
vi.mock("@/components/shared/SaveNotification", () => ({
  default: ({ message }: any) => (
    <div data-testid="save-notification">{message}</div>
  ),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/providers/SidebarProvider", () => ({
  useSidebar: vi.fn(),
}));

vi.mock("@/components/providers/EditorSettingsProvider", () => ({
  EditorSettingsProvider: ({ children }: any) => <>{children}</>,
  useEditorSettings: vi.fn(),
}));
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/components/providers/PlanProvider", () => ({
  useUserPlan: vi.fn().mockReturnValue({ plan: "free", isLoading: false }),
}));

// ── Setup ─────────────────────────────────────────────────────────────────────
const mockUseSidebar = {
  isSidebarOpen: false,
  setIsSidebarOpen: vi.fn(),
  isLTSidebarOpen: false,
  setIsLTSidebarOpen: vi.fn(),
  isMobile: false,
  setIsDocumentsDialogOpen: vi.fn(),
};

const mockUseEditorSettings = {
  buttonVisibility: { browserSpellcheck: true },
};

describe("TiptapProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    (useSidebar as any).mockReturnValue(mockUseSidebar);
    (useEditorSettings as any).mockReturnValue(mockUseEditorSettings);
    (useSearchParams as any).mockReturnValue(new URLSearchParams());

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: "doc-123" }),
      }),
    );

    (useUserPlan as any).mockReturnValue({ plan: "free", isLoading: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("tenta salvar automaticamente a cada 30 segundos se for usuário Pro e tiver docId", async () => {
    (useSearchParams as any).mockReturnValue(
      new URLSearchParams("docId=existing-doc"),
    );
    (useUserPlan as any).mockReturnValue({ plan: "pro", isLoading: false });

    render(
      <TiptapProvider editorOptions={{}} userPlan="pro">
        <div />
      </TiptapProvider>,
    );

    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/documents",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("salva localmente para usuários do plano free", async () => {
    const TestComponent = () => {
      const { onSaveDocument } = useTiptapContext();
      return <button onClick={onSaveDocument}>Save</button>;
    };

    const { getByText } = render(
      <TiptapProvider editorOptions={{}} userPlan="free">
        <TestComponent />
      </TiptapProvider>,
    );

    const { saveLocalDocument } = await import("@/lib/local-storage");

    await act(async () => {
      fireEvent.click(getByText("Save"));
    });

    // Não deve chamar o fetch
    expect(global.fetch).not.toHaveBeenCalled();
    // Deve chamar o utilitário de storage local
    expect(saveLocalDocument).toHaveBeenCalled();
  });

  it("escuta atalhos de teclado globais (ex: Ctrl+O)", async () => {
    render(
      <TiptapProvider editorOptions={{}}>
        <div />
      </TiptapProvider>,
    );

    const event = new KeyboardEvent("keydown", {
      key: "o",
      ctrlKey: true,
      cancelable: true,
      bubbles: true,
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(mockUseSidebar.setIsDocumentsDialogOpen).toHaveBeenCalledWith(true);
  });
});
