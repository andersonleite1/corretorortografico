export interface LocalDocument {
  id: string;
  title: string;
  content: unknown; // Preserve Tiptap JSON and legacy HTML.
  updatedAt: string;
  createdAt: string;
}

const LOCAL_DOCS_KEY = "local_documents";

export const getLocalDocuments = (): LocalDocument[] => {
  if (typeof window === "undefined") return [];
  const docs = localStorage.getItem(LOCAL_DOCS_KEY);
  if (!docs) return [];
  const parsed: unknown = JSON.parse(docs);
  if (
    !Array.isArray(parsed) ||
    !parsed.every(
      (doc) => doc && typeof doc === "object" && typeof doc.id === "string",
    )
  ) {
    throw new Error("storage_read_failed");
  }
  return parsed as LocalDocument[];
};

export const saveLocalDocument = (
  doc: Partial<LocalDocument> & { content: unknown },
) => {
  const docs = getLocalDocuments();
  const now = new Date().toISOString();

  let savedDoc: LocalDocument;

  if (doc.id) {
    const index = docs.findIndex((d) => d.id === doc.id);
    if (index !== -1) {
      savedDoc = {
        ...docs[index],
        ...doc,
        updatedAt: now,
      } as LocalDocument;
      docs[index] = savedDoc;
    } else {
      savedDoc = {
        id: doc.id,
        title: doc.title || "Sem título",
        content: doc.content,
        createdAt: now,
        updatedAt: now,
      };
      docs.unshift(savedDoc);
    }
  } else {
    savedDoc = {
      id: `local-${Math.random().toString(36).substring(2, 11)}`,
      title: doc.title || "Sem título",
      content: doc.content,
      createdAt: now,
      updatedAt: now,
    };
    docs.unshift(savedDoc);
  }

  try {
    localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(docs));
  } catch (error) {
    console.error("Error saving to localStorage (quota exceeded?):", error);
    throw new Error("storage_limit_exceeded");
  }

  return savedDoc;
};

export const deleteLocalDocument = (id: string) => {
  const docs = getLocalDocuments();
  const filtered = docs.filter((d) => d.id !== id);
  localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(filtered));
};

export const getLocalDocumentById = (id: string) => {
  const docs = getLocalDocuments();
  return docs.find((d) => d.id === id);
};

/** Plain text only: no HTML from browser storage is injected into the page. */
export function getLocalDocumentText(content: unknown): string {
  if (typeof content === "string") {
    if (/^\s*[\[{]/.test(content)) {
      try {
        return getLocalDocumentText(JSON.parse(content));
      } catch {
        /* Legacy plain text. */
      }
    }
    if (typeof DOMParser !== "undefined")
      return (
        new DOMParser()
          .parseFromString(content, "text/html")
          .body.textContent?.replace(/\s+/g, " ")
          .trim() || ""
      );
    return content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (!content || typeof content !== "object") return "";
  const node = content as { text?: unknown; content?: unknown[] };
  if (typeof node.text === "string") return node.text;
  return (
    node.content
      ?.map(getLocalDocumentText)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim() || ""
  );
}
