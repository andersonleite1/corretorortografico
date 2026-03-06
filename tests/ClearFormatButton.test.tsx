import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ClearFormatButton from "@/components/TiptapEditor/components/controls/ClearFormatButton";

// ── Hoisted Mocks ─────────────────────────────────────────────────────────────
const { mockEditor, mockRun } = vi.hoisted(() => {
    const run = vi.fn();
    const editor = {
        isEditable: true,
        chain: vi.fn().mockImplementation(() => ({
            focus: vi.fn().mockImplementation(() => ({
                unsetAllMarks: vi.fn().mockImplementation(() => ({
                    clearNodes: vi.fn().mockImplementation(() => ({ run })),
                })),
            })),
        })),
    };
    return { mockEditor: editor, mockRun: run };
});

vi.mock("@/components/TiptapEditor/components/Provider", () => ({
    useTiptapContext: () => ({
        editor: mockEditor,
        messages: {
            toolbar: {
                clearFormat: "Limpar formatação",
            },
        },
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

describe("ClearFormatButton", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockEditor.isEditable = true;
    });

    it("chama unsetAllMarks e clearNodes ao clicar", () => {
        render(<ClearFormatButton />);
        fireEvent.click(screen.getByRole("button"));

        expect(mockEditor.chain).toHaveBeenCalled();
        expect(mockRun).toHaveBeenCalled();
    });

    it("fica desativado se o editor não for editável", () => {
        mockEditor.isEditable = false;
        render(<ClearFormatButton />);
        expect(screen.getByRole("button")).toBeDisabled();
    });
});
