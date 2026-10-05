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
const { mockEditor, mockRouter } = vi.hoisted(() => ({
  mockRouter: { push: vi.fn(), replace: vi.fn() },
  mockEditor: {
    getJSON: vi.fn().mockReturnValue({ type: "doc", content: [] }),
    setOptions: vi.fn(),
    options: { editorProps: { attributes: {} } },
    on: vi.fn(),
    off: vi.fn(),
    isEmpty: false,
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
  saveLocalDocument: vi
    .fn()
    .mockReturnValue({ id: "local-123", updatedAt: "2026-10-04T12:00:00Z" }),
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
  useRouter: () => mockRouter,
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
    mockEditor.isEmpty = false;
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

  it("salva localmente após 1,5s mesmo com plano legado Pro e ID remoto", async () => {
    (useSearchParams as any).mockReturnValue(
      new URLSearchParams("docId=existing-doc"),
    );
    render(
      <TiptapProvider editorOptions={{}} userPlan="pro">
        <div />
      </TiptapProvider>,
    );
    const { saveLocalDocument } = await import("@/lib/local-storage");
    expect(saveLocalDocument).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(1499);
    });
    expect(saveLocalDocument).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(saveLocalDocument).toHaveBeenCalledWith(
      expect.objectContaining({ id: undefined }),
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("reschedules saves without serializing on each update", async () => {
    render(
      <TiptapProvider editorOptions={{}}>
        <div />
      </TiptapProvider>,
    );
    const { saveLocalDocument } = await import("@/lib/local-storage");
    const update = mockEditor.on.mock.calls.find(
      (call) => call[0] === "update",
    )![1];
    act(() => {
      vi.advanceTimersByTime(1000);
      update();
    });
    expect(mockEditor.getJSON).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1499);
    });
    expect(saveLocalDocument).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(saveLocalDocument).toHaveBeenCalledOnce();
  });

  it("does not create an empty untitled document automatically", async () => {
    mockEditor.isEmpty = true;
    render(
      <TiptapProvider editorOptions={{}}>
        <div />
      </TiptapProvider>,
    );
    const { saveLocalDocument } = await import("@/lib/local-storage");
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(saveLocalDocument).not.toHaveBeenCalled();
  });

  it("flushes changes before leaving without waiting for debounce", async () => {
    render(
      <TiptapProvider editorOptions={{}}>
        <div />
      </TiptapProvider>,
    );
    const { saveLocalDocument } = await import("@/lib/local-storage");
    act(() => {
      window.dispatchEvent(new Event("beforeunload"));
    });
    expect(saveLocalDocument).toHaveBeenCalledOnce();
  });

  it("cancels navigation if storage fails", async () => {
    const { saveLocalDocument } = await import("@/lib/local-storage");
    vi.mocked(saveLocalDocument).mockImplementationOnce(() => {
      throw new Error("quota");
    });
    render(
      <TiptapProvider editorOptions={{}}>
        <div />
      </TiptapProvider>,
    );
    const event = new Event("editordetexto:before-leave", { cancelable: true });
    act(() => {
      window.dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(true);
    expect(toast.error).toHaveBeenCalled();
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
