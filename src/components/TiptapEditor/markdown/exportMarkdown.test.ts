import { describe, expect, it } from "vitest";
import { exportMarkdownDocument } from "./exportMarkdown";

describe("exportMarkdownDocument", () => {
  it("exporta títulos, formatação, listas e código", () => {
    const result = exportMarkdownDocument({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Título" }] },
        { type: "paragraph", content: [{ type: "text", text: "texto", marks: [{ type: "bold" }] }] },
        { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "item" }] }] }] },
        { type: "codeBlock", attrs: { language: "ts" }, content: [{ type: "text", text: "const ok = true;" }] },
      ],
    });

    expect(result.markdown).toContain("# Título");
    expect(result.markdown).toContain("**texto**");
    expect(result.markdown).toContain("- item");
    expect(result.markdown).toContain("```ts");
  });

  it("sinaliza recursos que precisam de fallback HTML", () => {
    const result = exportMarkdownDocument({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "marcado", marks: [{ type: "highlight" }] }] }],
    });

    expect(result.warnings.some((warning) => warning.code === "html-fallback")).toBe(true);
    expect(result.markdown).toContain("<mark>");
  });
});
