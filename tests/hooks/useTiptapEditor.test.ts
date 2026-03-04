import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import useTiptapEditor from "@/components/TiptapEditor/hooks/useTiptapEditor";
import { useEditor } from "@tiptap/react";

// Mock @tiptap/react's useEditor
vi.mock("@tiptap/react", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useEditor: vi.fn(),
  };
});

// Mock useForceUpdate
vi.mock("@/components/TiptapEditor/hooks/useForceUpdate", () => ({
  default: () => vi.fn(),
}));

describe("useTiptapEditor", () => {
  const mockEditor = {
    isEditable: true,
    setOptions: vi.fn(),
    destroy: vi.fn(),
    isFocused: false,
    getHTML: vi.fn().mockReturnValue("<p>Old Content</p>"),
    getJSON: vi.fn().mockReturnValue({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Old Content" }],
        },
      ],
    }),
    commands: {
      setContent: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useEditor as any).mockReturnValue(mockEditor);
  });

  it("should update content when initialContent changes and editor is not focused", () => {
    const { rerender } = renderHook(
      ({ content }) => useTiptapEditor({ content, extensions: [] }),
      {
        initialProps: { content: "<p>Old Content</p>" },
      },
    );

    // It might be called on first render depending on how useEditor is mocked/implemented,
    // so we clear it before rerendering to test the "update" behavior.
    mockEditor.commands.setContent.mockClear();

    // Change content prop
    rerender({ content: "<p>New Content</p>" });

    expect(mockEditor.commands.setContent).toHaveBeenCalledWith(
      "<p>New Content</p>",
      { emitUpdate: false },
    );
  });

  it("should not update content when editor is focused", () => {
    const focusedEditor = { ...mockEditor, isFocused: true };
    (useEditor as any).mockReturnValue(focusedEditor);

    const { rerender } = renderHook(
      ({ content }) => useTiptapEditor({ content, extensions: [] }),
      {
        initialProps: { content: "<p>Old Content</p>" },
      },
    );

    rerender({ content: "<p>New Content</p>" });

    expect(focusedEditor.commands.setContent).not.toHaveBeenCalled();
  });

  it("should not update content when initialContent is the same", () => {
    const { rerender } = renderHook(
      ({ content }) => useTiptapEditor({ content, extensions: [] }),
      {
        initialProps: { content: "<p>Same Content</p>" },
      },
    );

    mockEditor.getHTML.mockReturnValue("<p>Same Content</p>");
    mockEditor.commands.setContent.mockClear();

    rerender({ content: "<p>Same Content</p>" });

    expect(mockEditor.commands.setContent).not.toHaveBeenCalled();
  });
});
