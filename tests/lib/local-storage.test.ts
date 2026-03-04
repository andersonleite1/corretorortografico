import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveLocalDocument,
  getLocalDocuments,
  deleteLocalDocument,
  getLocalDocumentById,
} from "@/lib/local-storage";

describe("lib/local-storage", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    vi.clearAllMocks();
  });

  it("should return empty array if no documents exist", () => {
    (localStorage.getItem as any).mockReturnValue(null);
    expect(getLocalDocuments()).toEqual([]);
  });

  it("should save a new document and return it", () => {
    (localStorage.getItem as any).mockReturnValue(null);
    const doc = { title: "Test Doc", content: { type: "doc" } };
    const saved = saveLocalDocument(doc);

    expect(saved.id).toBeDefined();
    expect(saved.title).toBe("Test Doc");
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "local_documents",
      expect.stringContaining("Test Doc"),
    );
  });

  it("should update an existing document", () => {
    const existingDoc = {
      id: "local-123",
      title: "Old Title",
      content: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    (localStorage.getItem as any).mockReturnValue(
      JSON.stringify([existingDoc]),
    );

    const updated = saveLocalDocument({
      id: "local-123",
      title: "New Title",
      content: {},
    });
    expect(updated.title).toBe("New Title");
    expect(updated.id).toBe("local-123");
  });

  it("should find a document by id", () => {
    const doc = { id: "local-123", title: "Test", content: {} };
    (localStorage.getItem as any).mockReturnValue(JSON.stringify([doc]));

    const found = getLocalDocumentById("local-123");
    expect(found?.title).toBe("Test");
  });

  it("should delete a document", () => {
    const doc = { id: "local-123", title: "Test", content: {} };
    (localStorage.getItem as any).mockReturnValue(JSON.stringify([doc]));

    deleteLocalDocument("local-123");
    expect(localStorage.setItem).toHaveBeenCalledWith("local_documents", "[]");
  });

  it("should throw error if storage quota is exceeded", () => {
    (localStorage.setItem as any).mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => saveLocalDocument({ content: {} })).toThrow(
      "storage_limit_exceeded",
    );
  });
});
