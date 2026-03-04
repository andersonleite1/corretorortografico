import { mock } from "@/sample";

export const getPost = (): Promise<any> => {
  return new Promise<any>((resolve) => {
    setTimeout(() => {
      if (typeof window !== "undefined") {
        try {
          const data = localStorage.getItem("post");
          resolve(data ? JSON.parse(data) : mock);
          if (!data) savePost(mock);
        } catch {
          resolve(mock);
        }
      }

      return resolve(mock);
    }, 200);
  });
};

export const savePost = (data: any, docId?: string | null) => {
  if (typeof window === "undefined") return;

  try {
    // If it's a string, we check trim. If it's an object (JSON), we assume it's valid if it exists.
    const hasContent =
      typeof data?.content === "string"
        ? data.content.trim().length > 0
        : !!data?.content && Object.keys(data.content).length > 0;
    const value = hasContent
      ? { ...mock, ...data }
      : { ...mock, title: "", content: "", wordCount: 0 };

    localStorage.setItem(
      "post",
      JSON.stringify({
        ...value,
        docId: docId || null,
        lastSaved: new Date().getTime(),
      }),
    );
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};
