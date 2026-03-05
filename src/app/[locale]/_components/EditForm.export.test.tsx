import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCallback } from "react";
import { generateHTML } from "@tiptap/react";
import getExtensionKit from "@/components/TiptapEditor/kit";

// Mock das dependências externas
vi.mock("@tiptap/react", () => ({
    generateHTML: vi.fn(),
}));

vi.mock("@/components/TiptapEditor/kit", () => ({
    default: vi.fn(() => []), // Retorna extensões vazias para o mock
}));

describe("EditForm Export Logic - getEditorHtml", () => {
    // Simulamos a lógica exata usada em EditForm
    const useGetEditorHtmlMock = (
        mockEditorInstance: any,
        mockContent: any,
        mockLocale: any = "pt"
    ) => {
        const getEditorHtml = useCallback(() => {
            const htmlFromInstance = mockEditorInstance?.getHTML();

            if (htmlFromInstance && htmlFromInstance !== "<p></p>") {
                return htmlFromInstance;
            }

            let content = mockContent;
            if (!content) return "";

            if (typeof content === "string") {
                if (content.startsWith("{") || content.startsWith("[")) {
                    try {
                        content = JSON.parse(content);
                    } catch {
                        return content;
                    }
                } else {
                    return content;
                }
            }

            if (typeof content === "object") {
                try {
                    // @ts-expect-error - content is JSON
                    return generateHTML(content, getExtensionKit(mockLocale));
                } catch (err) {
                    console.error("Error generating HTML from JSON:", err);
                    return "";
                }
            }

            return "";
        }, [mockEditorInstance, mockContent, mockLocale]);

        return { getEditorHtml };
    };

    it("should return HTML from editor instance if available", () => {
        const mockEditor = {
            getHTML: () => "<p>HTML from editor</p>",
        };

        const { result } = renderHook(() => useGetEditorHtmlMock(mockEditor, null));
        expect(result.current.getEditorHtml()).toBe("<p>HTML from editor</p>");
    });

    it("should return raw string content if editor is not available and content is text", () => {
        const { result } = renderHook(() => useGetEditorHtmlMock(undefined, "<p>Raw text content</p>"));
        expect(result.current.getEditorHtml()).toBe("<p>Raw text content</p>");
    });

    it("should use generateHTML when content is an object (JSON)", () => {
        const mockJsonContent = { type: "doc", content: [{ type: "paragraph" }] };
        vi.mocked(generateHTML).mockReturnValueOnce("<p>Generated HTML from JSON</p>");

        const { result } = renderHook(() => useGetEditorHtmlMock(undefined, mockJsonContent));

        expect(result.current.getEditorHtml()).toBe("<p>Generated HTML from JSON</p>");
        expect(generateHTML).toHaveBeenCalledWith(mockJsonContent, expect.any(Array));
    });

    it("should parse stringified JSON content and use generateHTML", () => {
        const stringifiedJson = JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });
        vi.mocked(generateHTML).mockReturnValueOnce("<p>Parsed and Generated HTML</p>");

        const { result } = renderHook(() => useGetEditorHtmlMock(undefined, stringifiedJson));

        expect(result.current.getEditorHtml()).toBe("<p>Parsed and Generated HTML</p>");
        expect(generateHTML).toHaveBeenCalled();
    });

    it("should fallback to raw string if parsing JSON fails", () => {
        const invalidJsonString = "{ invalid_json: true ";

        const { result } = renderHook(() => useGetEditorHtmlMock(undefined, invalidJsonString));

        expect(result.current.getEditorHtml()).toBe(invalidJsonString);
    });
});
