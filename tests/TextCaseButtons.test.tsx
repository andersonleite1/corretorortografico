import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import UppercaseButton from "@/components/TiptapEditor/components/controls/UppercaseButton";
import LowercaseButton from "@/components/TiptapEditor/components/controls/LowercaseButton";
import CapitalizeButton from "@/components/TiptapEditor/components/controls/CapitalizeButton";

// ── Hoisted Mocks ─────────────────────────────────────────────────────────────
const { mockEditor, mockRun } = vi.hoisted(() => {
    const run = vi.fn();
    const editor = {
        state: {
            selection: { empty: false },
        },
        isEditable: true,
        commands: {
            setTextCase: vi.fn().mockImplementation(() => ({ run })),
        },
        chain: () => ({
            focus: () => ({
                setTextCase: vi.fn().mockImplementation(() => ({ run })),
            }),
        }),
    };
    return { mockEditor: editor, mockRun: run };
});

vi.mock("@/components/TiptapEditor/components/Provider", () => ({
    useTiptapContext: () => ({
        editor: mockEditor,
        contentElement: { current: document.createElement("div") },
    }),
}));

vi.mock("@tiptap/react", () => ({
    useEditorState: ({ editor, selector }: any) => {
        return selector({ editor });
    },
}));

vi.mock("@/components/TiptapEditor/components/ui/Icon", () => ({
    default: ({ name }: any) => <span data-testid={`icon-${name}`} />,
}));

vi.mock("@/components/TiptapEditor/components/ui/Tooltip", () => ({
    default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/TiptapEditor/components/MenuButton", () => ({
    default: ({ icon, tooltip, onClick, disabled }: any) => (
        <button onClick={onClick} disabled={disabled} title={tooltip}>
            {icon}
        </button>
    ),
}));

describe("TextCase Buttons", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockEditor.isEditable = true;
        mockEditor.state.selection.empty = false;
    });

    it("UppercaseButton chama o comando correto", () => {
        render(<UppercaseButton />);
        fireEvent.click(screen.getByText("Uppercase"));
        expect(mockEditor.commands.setTextCase).toHaveBeenCalledWith("uppercase");
    });

    it("LowercaseButton chama o comando correto", () => {
        render(<LowercaseButton />);
        fireEvent.click(screen.getByText("Lowercase"));
        expect(mockEditor.commands.setTextCase).toHaveBeenCalledWith("lowercase");
    });

    it("CapitalizeButton chama o comando correto", () => {
        render(<CapitalizeButton />);
        fireEvent.click(screen.getByText("LetterCase"));
        expect(mockEditor.commands.setTextCase).toHaveBeenCalledWith("capitalize");
    });

    it("botões ficam desativados se a seleção estiver vazia", () => {
        mockEditor.state.selection.empty = true;
        const { rerender } = render(<UppercaseButton />);
        expect(screen.getByRole("button")).toBeDisabled();

        rerender(<LowercaseButton />);
        expect(screen.getByRole("button")).toBeDisabled();

        rerender(<CapitalizeButton />);
        expect(screen.getByRole("button")).toBeDisabled();
    });
});
