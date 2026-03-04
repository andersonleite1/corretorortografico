export interface LocalDocument {
  id: string;
  title: string;
  content: any; // Tiptap JSON content
  updatedAt: string;
  createdAt: string;
}

const LOCAL_DOCS_KEY = "local_documents";

export const getLocalDocuments = (): LocalDocument[] => {
  if (typeof window === "undefined") return [];
  const docs = localStorage.getItem(LOCAL_DOCS_KEY);
  if (!docs) return [];
  try {
    return JSON.parse(docs);
  } catch (error) {
    console.error("Error parsing local documents:", error);
    return [];
  }
};

export const saveLocalDocument = (
  doc: Partial<LocalDocument> & { content: any },
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
