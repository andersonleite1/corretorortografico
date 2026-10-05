import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { saveLocalDocument, getLocalDocumentById } from "@/lib/local-storage";
// Exercise the actual persistence helper rather than a copied legacy draft algorithm.
describe("Editor local document persistence", () => {
  const data = new Map<string, string>();
  beforeEach(() => {
    data.clear();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => data.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        data.set(key, value);
      }),
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it("reopens the saved title and formatted Tiptap content", () => {
    const content = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Texto", marks: [{ type: "bold" }] }],
        },
      ],
    };
    const saved = saveLocalDocument({ title: "Documento", content });
    expect(saved.id).toMatch(/^local-/);
    expect(getLocalDocumentById(saved.id)).toEqual(
      expect.objectContaining({ title: "Documento", content }),
    );
  });
  it("preserves previously saved documents when quota is exceeded", () => {
    const saved = saveLocalDocument({ title: "Original", content: "Texto" });
    const before = data.get("local_documents");
    vi.mocked(localStorage.setItem).mockImplementationOnce(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() =>
      saveLocalDocument({ id: saved.id, title: "Novo", content: "Alterado" }),
    ).toThrow("storage_limit_exceeded");
    expect(data.get("local_documents")).toBe(before);
    expect(getLocalDocumentById(saved.id)?.title).toBe("Original");
  });
});
