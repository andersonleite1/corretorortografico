import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";

import dynamic from "next/dynamic";
import { saveAs } from "file-saver";
import { FaTimes, FaBug } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { getPost, savePost } from "@/services/post";
import { requestPdfFromHtml } from "@/services/pdfService";
import { getLocalDocumentById } from "@/lib/local-storage";
import { useRouter, useSearchParams } from "next/navigation";
import { type Locale } from "../../../../i18n-config";
import { getEditMessages } from "@/data/edit/messages";

const TiptapEditor = dynamic(() => import("@/components/TiptapEditor"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] bg-gray-100/70 dark:bg-[#111625] animate-pulse rounded-md border border-[#d1d9e0] dark:border-[#3d444d]" />
  ),
});

const TiptapRenderer = dynamic(
  () => import("@/components/TiptapRenderer/ClientRenderer"),
  {
    ssr: false,
  },
);

const BugReportDialog = dynamic(
  () =>
    import("@/components/shared/BugReportDialog").then(
      (mod) => mod.BugReportDialog,
    ),
  {
    ssr: false,
  },
);

const DraftComparison = dynamic(
  () =>
    import("@/components/Drafts/DraftComparison").then(
      (mod) => mod.DraftComparison,
    ),
  {
    ssr: false,
  },
);

const SaveNotification = dynamic(
  () =>
    import("@/components/shared/SaveNotification").then(
      (mod) => mod.SaveNotification,
    ),
  {
    ssr: false,
  },
);

interface PostForm {
  title: string;
  content: string;
}

interface EditFormProps {
  locale: Locale;
  userPlan: "free" | "pro" | "team";
}

import type { TiptapEditorRef } from "@/components/TiptapEditor";

export default function EditForm({ locale, userPlan }: EditFormProps) {
  const editorRef = useRef<TiptapEditorRef>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams.get("docId");
  const [isLoading, setIsLoading] = useState(true);
  const { control, reset, watch, getValues } = useForm<PostForm>();
  const { form: formMessages } = useMemo(
    () => getEditMessages(locale),
    [locale],
  );

  const editorPlaceholder = useMemo(
    () => ({
      paragraph: formMessages.placeholders.content,
      imageCaption: formMessages.placeholders.imageCaption,
    }),
    [formMessages.placeholders.content, formMessages.placeholders.imageCaption],
  );

  const [drafts, setDrafts] = useState<
    { id: string; title: string; content: string; date: string }[]
  >([]);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<{
    url: string;
    blob: Blob;
    fileName: string;
  } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPostPreviewOpen, setIsPostPreviewOpen] = useState(false);
  const [isPreviewHtmlMode, setIsPreviewHtmlMode] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [selectedDraftForComparison, setSelectedDraftForComparison] = useState<{
    content: string | Record<string, unknown>;
    id: string;
  } | null>(null);
  const [draftSavingStatus, setDraftSavingStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);

  const showNotification = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    setNotification({ message, type });
  };

  const handleClear = () => {
    // We don't remove "post" from localStorage because savePost (via watch)
    // will immediately save the empty state anyway.
    // Instead, we reset the form and explicitly clear the editor content.
    reset({ title: "", content: "" });

    const editor = editorRef.current?.getInstance();
    if (editor) {
      editor.commands.setContent("");
    }

    // If there's a docId, navigating back to root clears the selection
    if (docId) {
      router.push(`/${locale}`);
    }

    showNotification(formMessages.modal.cleared);
  };

  const preparePdfExport = () => {
    const editorInstance = editorRef.current?.getInstance();
    const { title, content } = getValues();
    const htmlFromEditor = editorInstance?.getHTML() ?? content;
    const safeHtml = htmlFromEditor?.trim();

    if (!safeHtml) {
      showNotification(formMessages.modal.noContent, "info");
      return null;
    }

    const fallbackName = formMessages.defaults.documentName;
    const baseTitle = (title || fallbackName).trim() || fallbackName;
    const safeTitle = baseTitle.replace(/[\\/:*?"<>|]/g, "-") || fallbackName;

    const htmlDocument = `<!DOCTYPE html>
<html lang="${formMessages.pdfLang}">
<head>
  <meta charset="utf-8" />
</head>
<body>
  ${safeHtml}
</body>
</html>`;

    return {
      fileName: `${safeTitle}.pdf`,
      htmlDocument,
    };
  };

  const handleExportToPDF = async () => {
    const payload = preparePdfExport();
    if (!payload) return;

    setIsExportingPDF(true);

    try {
      const blob = await requestPdfFromHtml(payload.htmlDocument);
      saveAs(blob, payload.fileName);
      showNotification(formMessages.modal.pdfSuccess);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      showNotification(
        error instanceof Error ? error.message : formMessages.modal.pdfError,
        "error",
      );
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePreviewPdf = async () => {
    const payload = preparePdfExport();
    if (!payload) return;

    setIsExportingPDF(true);

    try {
      const blob = await requestPdfFromHtml(payload.htmlDocument);
      const url = URL.createObjectURL(blob);
      setPdfPreview((prev) => {
        if (prev?.url) {
          URL.revokeObjectURL(prev.url);
        }
        return { url, blob, fileName: payload.fileName };
      });
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Erro ao gerar prévia do PDF:", error);
      showNotification(
        error instanceof Error ? error.message : formMessages.modal.pdfError,
        "error",
      );
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleSaveDOC = async () => {
    const postData = localStorage.getItem("post");
    if (!postData) {
      showNotification(formMessages.modal.noContent, "info");
      return;
    }

    const post = JSON.parse(postData);
    const fallbackName = formMessages.defaults.documentName;
    const docTitleRaw = (post.title || fallbackName).trim() || fallbackName;
    const docTitle = docTitleRaw.replace(/[\\/:*?"<>|]/g, "-") || fallbackName;

    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8" />
          <title>${docTitle}</title>
        </head>
        <body>
          ${post.content}
        </body>
      </html>
    `;

    const blob = new Blob([html], {
      type: "application/msword;charset=utf-8",
    });

    saveAs(blob, `${docTitle}.doc`);
    showNotification(formMessages.modal.docSuccess);
  };

  const handleExportToTxt = () => {
    const editorInstance = editorRef.current?.getInstance();
    const { title, content } = getValues();
    const plainText =
      editorInstance?.getText?.().trim() ||
      content
        ?.replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim() ||
      "";

    if (!plainText) {
      showNotification(formMessages.modal.noContent, "info");
      return;
    }

    const fallbackName = formMessages.defaults.documentName;
    const baseTitle = (title || fallbackName).trim() || fallbackName;
    const safeTitle = baseTitle.replace(/[\\/:*?"<>|]/g, "-") || fallbackName;

    const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${safeTitle}.txt`);
    showNotification(formMessages.modal.txtSuccess);
  };

  const clearPdfPreview = useCallback(() => {
    setPdfPreview((prev) => {
      if (prev?.url) {
        URL.revokeObjectURL(prev.url);
      }
      return null;
    });
  }, []);

  const closePdfPreview = useCallback(() => {
    setIsPreviewOpen(false);
    clearPdfPreview();
  }, [clearPdfPreview]);

  const handleDownloadPreviewPdf = useCallback(() => {
    if (!pdfPreview) return;
    saveAs(pdfPreview.blob, pdfPreview.fileName);
  }, [pdfPreview]);

  const handlePreviewPost = useCallback(() => {
    setIsPostPreviewOpen(true);
    setIsPreviewHtmlMode(false);
  }, []);

  const handleDownloadHtml = () => {
    const editorInstance = editorRef.current?.getInstance();
    const { title, content } = getValues();
    const htmlFromEditor = editorInstance?.getHTML() ?? content;
    const safeHtml = htmlFromEditor?.trim();

    if (!safeHtml) {
      showNotification(formMessages.modal.noContent, "info");
      return;
    }

    const fallbackName = formMessages.defaults.documentName;
    const baseTitle = (title || fallbackName).trim() || fallbackName;
    const safeTitle = baseTitle.replace(/[\\/:*?"<>|]/g, "-") || fallbackName;

    const htmlDocument = `<!DOCTYPE html>
<html lang="${formMessages.pdfLang}">
<head>
  <meta charset="utf-8" />
  <title>${baseTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: 0 auto; color: #1a1a1a; }
    h1 { font-size: 2.5rem; margin-bottom: 1.5rem; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
    img { max-width: 100%; height: auto; border-radius: 8px; }
    pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; padding-left: 1rem; color: #666; font-style: italic; }
  </style>
</head>
<body>
  <h1>${baseTitle}</h1>
  ${safeHtml}
</body>
</html>`;

    const blob = new Blob([htmlDocument], { type: "text/html;charset=utf-8" });
    saveAs(blob, `${safeTitle}.html`);
    showNotification(formMessages.modal.docSuccess);
  };

  const getWordCount = useCallback(
    () => editorRef.current?.getInstance()?.storage.characterCount.words() ?? 0,
    [],
  );

  useEffect(() => {
    setIsLoading(true);
    const checkRecovery = (serverData: {
      title?: string;
      content?: unknown;
      updatedAt?: string | number | Date;
    }) => {
      const localDataStr = localStorage.getItem("post");
      if (!localDataStr) return serverData;

      try {
        const localData = JSON.parse(localDataStr);
        // Se o docId bater ou for nulo (pra docs novos) e o timestamp local for maior
        const isSameDoc = localData.docId === docId;
        const serverUpdateAt = serverData?.updatedAt
          ? new Date(serverData.updatedAt).getTime()
          : 0;
        const localUpdatedAt = localData.lastSaved || 0;

        if (isSameDoc && localUpdatedAt > serverUpdateAt) {
          console.log("Recuperando do Local Storage (mais recente)");
          return localData;
        }
      } catch (e) {
        console.error("Erro ao verificar recuperação:", e);
      }
      return serverData;
    };

    if (docId) {
      if (docId.startsWith("local-")) {
        const localDoc = getLocalDocumentById(docId);
        if (localDoc) {
          const recovered = checkRecovery({
            title: localDoc.title,
            content: localDoc.content,
            updatedAt: localDoc.updatedAt,
          });

          reset({ title: recovered.title, content: recovered.content });

          const instance = editorRef.current?.getInstance();
          if (instance) {
            const currentContent = instance.getJSON();
            const newContentString =
              typeof recovered.content === "string"
                ? recovered.content
                : JSON.stringify(recovered.content);
            const currentContentString = JSON.stringify(currentContent);

            if (newContentString !== currentContentString) {
              instance.commands.setContent(recovered.content);
            }
          }
          setIsLoading(false);
          return;
        }
      }

      fetch(`/api/documents/${docId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Documento não encontrado");
          return res.json();
        })
        .then((doc) => {
          let content = doc.content;
          if (
            typeof content === "string" &&
            (content.startsWith("{") || content.startsWith("["))
          ) {
            try {
              content = JSON.parse(content);
            } catch {
              // Fallback
            }
          }

          const recovered = checkRecovery({
            title: doc.title,
            content,
            updatedAt: doc.updatedAt,
          });

          reset({ title: recovered.title, content: recovered.content });

          // FIX: Only set content if it's different to avoid cursor jumps
          const instance = editorRef.current?.getInstance();
          if (instance) {
            const currentContent = instance.getJSON();
            const newContentString =
              typeof recovered.content === "string"
                ? recovered.content
                : JSON.stringify(recovered.content);
            const currentContentString = JSON.stringify(currentContent);

            if (newContentString !== currentContentString) {
              instance.commands.setContent(recovered.content);
            }
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error(error);
          getPost().then((post) => {
            reset({ ...post });
            const instance = editorRef.current?.getInstance();
            if (instance) {
              const currentContent = instance.getJSON();
              const newContentString =
                typeof post.content === "string"
                  ? post.content
                  : JSON.stringify(post.content);
              const currentContentString = JSON.stringify(currentContent);

              if (newContentString !== currentContentString) {
                instance.commands.setContent(post.content || "");
              }
            }
            setIsLoading(false);
          });
        });
    } else {
      getPost()
        .then((post) => {
          reset({ ...post });
          const instance = editorRef.current?.getInstance();
          if (instance) {
            const currentContent = instance.getJSON();
            const newContentString =
              typeof post.content === "string"
                ? post.content
                : JSON.stringify(post.content);
            const currentContentString = JSON.stringify(currentContent);

            if (newContentString !== currentContentString) {
              instance.commands.setContent(post.content || "");
            }
          }
        })
        .catch((err) => {
          console.error("[EditForm] Error loading post:", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    return () => {
      clearPdfPreview();
    };
  }, [clearPdfPreview, reset, docId]);

  useEffect(() => {
    const subscription = watch((values, { type }) => {
      if (type === "change") {
        savePost({ ...values, wordCount: getWordCount() }, docId);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, docId, getWordCount]);

  // Carrega os rascunhos ao iniciar
  useEffect(() => {
    if (docId) {
      fetch(`/api/documents/${docId}/drafts`)
        .then((res) => res.json())
        .then((data) => {
          setDrafts(
            data.map(
              (d: {
                id: string;
                title: string;
                content: string;
                createdAt: string | number | Date;
              }) => ({
                id: d.id,
                title: d.title,
                content: d.content,
                date: new Date(d.createdAt).toLocaleString(
                  locale === "pt" ? "pt-BR" : "en-US",
                ),
              }),
            ),
          );
        })
        .catch(console.error);
    } else {
      const savedDrafts = JSON.parse(localStorage.getItem("drafts") || "[]");
      setDrafts(savedDrafts);
    }
  }, [docId, locale]);

  // Função para salvar o rascunho atual
  const handleSaveDraft = useCallback(
    async (isExplicit = false) => {
      if (!docId) {
        // Fallback para localStorage se não houver docId
        const current = {
          id: uuidv4(),
          title: watch("title") || formMessages.defaults.draftTitle,
          content: watch("content") || "",
          date: new Date().toLocaleString(formMessages.dateLocale),
        };

        try {
          let updatedDrafts = [current, ...drafts]; // Rascunho novo no topo
          if (updatedDrafts.length > 5)
            updatedDrafts = updatedDrafts.slice(0, 5); // Reduzido para 5 para economizar espaço (BUG-05)

          localStorage.setItem("drafts", JSON.stringify(updatedDrafts));
          setDrafts(updatedDrafts);
          if (isExplicit) showNotification(formMessages.modal.draftSaved);
        } catch (e) {
          console.warn("Storage full, cleaning up drafts", e);
          // Limpa tudo menos o mais recente se der erro de quota
          localStorage.removeItem("drafts");
          localStorage.setItem("drafts", JSON.stringify([current]));
          setDrafts([current]);
          if (isExplicit) showNotification(formMessages.modal.draftSaved);
        }
        return;
      }

      try {
        if (!isExplicit) setDraftSavingStatus("saving");

        const content = watch("content");
        const stringifiedContent =
          typeof content === "object" ? JSON.stringify(content) : content;

        const res = await fetch(`/api/documents/${docId}/drafts`, {
          method: "POST",
          headers: {
            "x-diagnose": "true",
          },
          body: JSON.stringify({
            title: watch("title") || undefined,
            content: stringifiedContent,
            isExplicitSave: isExplicit,
          }),
        });

        if (res.ok) {
          if (!isExplicit) {
            setDraftSavingStatus("saved");
            setTimeout(() => {
              setDraftSavingStatus("idle");
            }, 3000);
          }

          await res.json();
          // Refresh drafts list
          const draftsRes = await fetch(`/api/documents/${docId}/drafts`);
          const data = await draftsRes.json();
          setDrafts(
            data.map(
              (d: {
                id: string;
                title: string;
                content: string;
                createdAt: string | number | Date;
              }) => ({
                id: d.id,
                title: d.title,
                content: d.content,
                date: new Date(d.createdAt).toLocaleString(
                  locale === "pt" ? "pt-BR" : "en-US",
                ),
              }),
            ),
          );
          if (isExplicit) showNotification(formMessages.modal.draftSaved);
        } else {
          const errorText = await res.text();
          throw new Error(errorText || "Error saving draft");
        }
      } catch (error) {
        console.error(error);
        if (!isExplicit) {
          setDraftSavingStatus("error");
        } else {
          showNotification(
            error instanceof Error ? error.message : "Erro ao salvar rascunho",
            "error",
          );
        }
      }
    },
    [docId, drafts, formMessages, locale, watch],
  );

  // Auto-save draft on content change (throttled by the API and debounced on frontend)
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;

    const subscription = watch((_values, { name, type }) => {
      if (type === "change") {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          handleSaveDraft(false);
        }, 3000); // 3 seconds debounce
      }
    });
    return () => {
      subscription.unsubscribe();
      clearTimeout(debounceTimer);
    };
  }, [watch, docId, handleSaveDraft]);

  // Função para carregar um rascunho
  const handleLoadDraft = (draftId: string) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) return;

    let content = draft.content;
    // Ensure content is parsed if it's a stringified JSON
    if (
      typeof content === "string" &&
      (content.startsWith("{") || content.startsWith("["))
    ) {
      try {
        content = JSON.parse(content);
      } catch {
        // Fallback to string if parsing fails
      }
    }

    reset({ title: draft.title, content });
    editorRef.current?.getInstance()?.commands.setContent(content);
    showNotification(formMessages.modal.draftLoaded);
  };

  // Função para excluir um rascunho
  const handleDeleteDraft = async (draftId: string) => {
    if (!docId) {
      const updated = drafts.filter((d) => d.id !== draftId);
      localStorage.setItem("drafts", JSON.stringify(updated));
      setDrafts(updated);
      showNotification(formMessages.modal.draftDeleted);
      return;
    }

    // Nota: Precisamos da rota de DELETE ou apenas filtramos se for via API
    // Por simplicidade neste MVP, vamos focar no salvamento/comparação.
    // Mas vamos implementar o filtro local para UX imediata.
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
  };

  const handleCompareDraft = (draftId: string) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (draft) {
      setSelectedDraftForComparison({ content: draft.content, id: draft.id });
      setIsComparisonOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 order-2 min-w-full prose prose-blue dark:prose-invert prose-headings:scroll-m-20 article-content bg-white dark:bg-gray-800 px-2 md:px-8 sm:px-0 animate-pulse">
        {/* ── Title input skeleton ── */}
        <div className="w-full h-[50px] bg-gray-100 dark:bg-gray-700/60 rounded-full shadow border border-[#d1d9e0] dark:border-[#3d444d]" />

        {/* ── Editor container skeleton ── */}
        <div className="w-full rounded-[2rem] border border-[#d1d9e0] dark:border-[#3d444d] bg-white dark:bg-[#0d1017] shadow-sm overflow-hidden">
          {/* Toolbar row 1: undo/redo/save + basic formatting */}
          <div className="h-[44px] border-b border-[#d1d9e0] dark:border-[#3d444d] px-3 flex items-center gap-2">
            <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700" />
            <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700" />
            <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="ml-auto h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>

          {/* Toolbar row 2: paragraph/font/size/spell/export */}
          <div className="h-[40px] border-b border-[#d1d9e0] dark:border-[#3d444d] px-3 flex items-center gap-2">
            <span className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700" />
            <span className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <span className="ml-auto h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>

          {/* Toolbar row 3: view/docs/drafts/AI */}
          <div className="h-[40px] border-b border-[#d1d9e0] dark:border-[#3d444d] px-3 flex items-center gap-2">
            <span className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="ml-auto h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>

          {/* Editor body: text area + sidebar */}
          <div className="flex">
            {/* Main text area */}
            <div className="flex-1 min-h-[320px] p-5">
              <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-700/50 rounded mb-3" />
              <div className="h-4 w-full bg-gray-100 dark:bg-gray-700/50 rounded mb-3" />
              <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-700/50 rounded mb-3" />
              <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-700/50 rounded mb-3" />
            </div>

            {/* Sidebar skeleton */}
            <div className="hidden md:flex flex-col w-[319px] border-l border-[#d1d9e0] dark:border-[#3d444d] p-4 gap-4">
              {/* Tabs */}
              <div className="flex gap-3 border-b border-[#d1d9e0] dark:border-[#3d444d] pb-3">
                <span className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                <span className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              {/* Stats cards */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  <span className="h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  <span className="h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <span className="h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="h-14 bg-gray-100 dark:bg-gray-700/50 rounded-lg" />
                <div className="h-14 bg-gray-100 dark:bg-gray-700/50 rounded-lg" />
                <div className="h-14 bg-gray-100 dark:bg-gray-700/50 rounded-lg" />
                <div className="h-14 bg-gray-100 dark:bg-gray-700/50 rounded-lg" />
              </div>
              {/* CTA button */}
              <div className="mt-auto h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#d1d9e0] dark:border-[#3d444d] px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="h-4 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
              <span className="h-4 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
              <span className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="flex items-center gap-3">
              <span className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <span className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <span className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>

        {/* ── "Reportar Problema" button skeleton ── */}
        <div className="flex justify-center pb-2">
          <span className="h-9 w-40 bg-gray-100 dark:bg-gray-700/50 rounded-full border border-gray-200 dark:border-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 order-2 min-w-full prose prose-blue dark:prose-invert prose-headings:scroll-m-20 article-content bg-white dark:bg-gray-800 px-2 md:px-8 sm:px-0 pb-6">
      <div>
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="w-full px-4 py-2.5 shadow border border-[#d1d9e0] rounded-full bg-white dark:bg-[#0d1017] dark:text-white dark:border-[#3d444d] outline-none"
              placeholder={formMessages.placeholders.title}
            />
          )}
        />
      </div>

      <div>
        <Controller
          control={control}
          name="content"
          render={({ field }) => {
            return (
              <div
                className="w-full rounded-[2rem]"
                style={
                  {
                    "--rte-radius": "2rem",
                    minHeight: "480px",
                  } as CSSProperties
                }
              >
                <TiptapEditor
                  ref={editorRef}
                  ssr={true}
                  output="json"
                  locale={locale}
                  placeholder={editorPlaceholder}
                  contentMinHeight={320}
                  contentMaxHeight={440}
                  onContentChange={field.onChange}
                  initialContent={field.value}
                  exportActions={{
                    onExportDoc: handleSaveDOC,
                    onExportPdf: handleExportToPDF,
                    onExportTxt: handleExportToTxt,
                    onPreviewPdf: handlePreviewPdf,
                    onPreviewPost: handlePreviewPost,
                    onClear: handleClear,
                    isExportingPdf: isExportingPDF,
                  }}
                  draftActions={{
                    drafts: drafts.map(({ id, title, date }) => ({
                      id,
                      title,
                      date,
                    })),
                    onSaveDraft: () => handleSaveDraft(true),
                    onLoadDraft: handleLoadDraft,
                    onDeleteDraft: handleDeleteDraft,
                    onCompareDraft: handleCompareDraft,
                    savingStatus: draftSavingStatus,
                  }}
                  userPlan={userPlan}
                  documentTitle={watch("title")}
                  aria-label={formMessages.aria.content}
                />
              </div>
            );
          }}
        />
      </div>

      {/* ── Botão Reportar Problema ── */}
      <div className="flex justify-center pb-2">
        <button
          id="bug-report-open-btn"
          type="button"
          onClick={() => setIsBugReportOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-gray-200 dark:border-white/10 hover:border-emerald-200 dark:hover:border-emerald-800/60 transition-all duration-200 active:scale-95"
          aria-label="Reportar Problema"
        >
          <FaBug className="text-xs" />
          Reportar Problema
        </button>
      </div>

      {isPreviewOpen && pdfPreview && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-5xl h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formMessages.preview.heading}
              </h3>
              <button
                type="button"
                onClick={closePdfPreview}
                className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                aria-label={formMessages.preview.closeAria}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-gray-800">
              <iframe
                src={pdfPreview.url}
                title={formMessages.preview.iframeTitle}
                className="w-full h-full"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <button
                type="button"
                onClick={closePdfPreview}
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {formMessages.preview.close}
              </button>
              <button
                type="button"
                onClick={handleDownloadPreviewPdf}
                className="px-4 py-2 rounded-md bg-green-400 hover:bg-green-500 text-gray-800 font-semibold"
              >
                {formMessages.preview.download}
              </button>
            </div>
          </div>
        </div>
      )}

      {isPostPreviewOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-[#0d1117] overflow-hidden animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-md">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {formMessages.postPreview.heading}
            </h3>
            <button
              onClick={() => setIsPostPreviewOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <FaTimes className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content Container */}
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#010409] p-4 md:p-12">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-[#0d1117] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-500">
                {/* Visual Decor */}
                <div className="h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                <div className="p-8 md:p-12">
                  {isPreviewHtmlMode ? (
                    <div className="relative">
                      <div className="absolute top-0 right-0 py-1 px-3 bg-gray-800 text-white text-xs rounded-bl-lg font-mono">
                        {formMessages.postPreview.htmlCode}
                      </div>
                      <pre className="p-6 bg-gray-900 text-green-400 rounded-xl overflow-x-auto font-mono text-sm leading-relaxed border border-gray-700">
                        <code>
                          {editorRef.current?.getInstance()?.getHTML() ||
                            watch("content")}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-500 prose-img:rounded-2xl prose-img:shadow-lg">
                      <h1 className="text-4xl md:text-5xl font-black mb-8 text-gray-900 dark:text-white leading-tight">
                        {watch("title") || formMessages.defaults.documentName}
                      </h1>
                      <div className="flex items-center gap-4 mb-10 text-gray-500 dark:text-gray-400">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                          {watch("title")?.charAt(0) || "P"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-200">
                            User
                          </p>
                          <p className="text-xs">
                            {new Date().toLocaleDateString(
                              locale === "pt" ? "pt-BR" : "en-US",
                            )}
                          </p>
                        </div>
                        <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1" />
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                          Post Preview
                        </span>
                      </div>
                      <TiptapRenderer>
                        {editorRef.current?.getInstance()?.getHTML() ||
                          watch("content")}
                      </TiptapRenderer>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer with actions */}
          <div className="py-6 px-10 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0d1117] flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setIsPreviewHtmlMode(!isPreviewHtmlMode)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
              >
                {isPreviewHtmlMode
                  ? formMessages.postPreview.blogPreview
                  : formMessages.postPreview.viewHtml}
              </button>
              <button
                onClick={handleDownloadHtml}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95"
              >
                {formMessages.postPreview.downloadHtml}
              </button>
            </div>

            <button
              onClick={() => setIsPostPreviewOpen(false)}
              className="px-8 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold transition-all active:scale-95"
            >
              {formMessages.postPreview.close}
            </button>
          </div>
        </div>
      )}

      {isComparisonOpen && selectedDraftForComparison && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-5xl h-[85vh]">
            <DraftComparison
              oldContent={selectedDraftForComparison.content}
              newContent={watch("content")}
              onClose={() => setIsComparisonOpen(false)}
              onRestore={() => {
                handleLoadDraft(selectedDraftForComparison.id);
                setIsComparisonOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {isExportingPDF && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-6 bg-white/10 rounded-2xl shadow-lg border border-white/20">
            <h4 className="text-white text-xl font-semibold animate-pulse tracking-wide">
              {formMessages.loading.label}
            </h4>
            <Image
              src="/loading.gif"
              alt={formMessages.loading.alt}
              className="w-20 h-20 drop-shadow-md"
              width={80}
              height={80}
            />
          </div>
        </div>
      )}

      {notification && (
        <SaveNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* ── Diálogo de Reporte de Problemas ── */}
      <BugReportDialog
        isOpen={isBugReportOpen}
        onClose={() => setIsBugReportOpen(false)}
      />
    </div>
  );
}
