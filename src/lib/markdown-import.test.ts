import { describe, expect, it } from "vitest";
import { importMarkdown } from "./markdown-import";

describe("importMarkdown", () => {
  it("converte Markdown GFM em HTML seguro", async () => {
    const result = await importMarkdown({
      fileName: "artigo.md",
      content: "# Título\n\n**forte**\n\n- [x] concluído",
    });

    expect(result.mode).toBe("normalized");
    expect(result.html).toContain("<h1>Título</h1>");
    expect(result.html).toContain("<strong>forte</strong>");
    expect(result.html).toContain('data-type="taskList"');
  });

  it("rejeita extensão inválida e arquivo vazio", async () => {
    await expect(
      importMarkdown({ fileName: "artigo.txt", content: "texto" }),
    ).rejects.toThrow("invalid-markdown-extension");
    await expect(importMarkdown({ content: "   " })).rejects.toThrow(
      "empty-markdown-file",
    );
  });

  it("faz fallback para texto quando o parser falha", async () => {
    const result = await importMarkdown({
      content: "<script>alert('xss')</script>",
    });

    expect(result.html).not.toContain("<script>");
  });
});
