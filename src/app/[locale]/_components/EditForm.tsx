import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";

import dynamic from "next/dynamic";
import { saveAs } from "file-saver";
import { X, Bug } from "lucide-react";
import { getPost, savePost } from "@/services/post";
import { requestPdfFromHtml } from "@/services/pdfService";
import { getLocalDocumentById } from "@/lib/local-storage";
import { useRouter, useSearchParams } from "next/navigation";
import { type Locale } from "../../../../i18n-config";
import { getEditMessages } from "@/data/edit/messages";
import { getCommonMessages } from "@/data/common";
import { generateHTML } from "@tiptap/react";
import getExtensionKit from "@/components/TiptapEditor/kit";

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
  const { control, reset, watch, getValues, setValue } = useForm<PostForm>();
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


  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<{
    url: string;
    blob: Blob;
    fileName: string;
  } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPostPreviewOpen, setIsPostPreviewOpen] = useState(false);
  const [isPreviewHtmlMode, setIsPreviewHtmlMode] = useState(false);

  const [isBugReportOpen, setIsBugReportOpen] = useState(false);

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const [shouldLoadEditor, setShouldLoadEditor] = useState(false);

  const getEditorHtml = useCallback(() => {
    const editorInstance = editorRef.current?.getInstance();
    const htmlFromInstance = editorInstance?.getHTML();

    if (htmlFromInstance && htmlFromInstance !== "<p></p>") {
      return htmlFromInstance;
    }

    let content = getValues("content");
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
        return generateHTML(content as any, getExtensionKit(locale));
      } catch (err) {
        console.error("Error generating HTML from JSON:", err);
        return "";
      }
    }

    return "";
  }, [getValues, locale]);


  useEffect(() => {
    // Schedule editor to load shortly after mount, off the critical rendering path
    // but without waiting for user interaction which worsens INP.
    const timer = setTimeout(() => {
      setShouldLoadEditor(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

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
    const { title } = getValues();
    const htmlFromEditor = getEditorHtml();
    const safeHtml = htmlFromEditor.trim();

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
  <style>
    @font-face {
      font-family: 'Open Sans';
      src: url('/fonts/open-sans-latin-400-normal.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'Open Sans';
      src: url('/fonts/open-sans-latin-700-normal.woff2') format('woff2');
      font-weight: 700;
      font-style: normal;
    }
    @font-face {
      font-family: 'JetBrains Mono';
      src: url('/fonts/jetbrains-mono-latin-400-normal.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
    }
    :root {
      font-family: 'Open Sans', sans-serif;
      line-height: 1.6;
      color: #1f2328;
    }
    body {
      padding: 40px;
      margin: 0;
    }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; line-height: 1.2; }
    p { margin-bottom: 1em; }
    
    /* Tiptap Alignment */
    .has-text-align-center { text-align: center; }
    .has-text-align-right { text-align: right; }
    .has-text-align-justify { text-align: justify; }
    
    /* Typography */
    [style*="font-family"] { font-display: swap; }
    
    /* Marks */
    mark { background-color: #ffcc00; color: black; padding: 0 2px; }
    code { font-family: 'JetBrains Mono', monospace; background: #f0f0f0; padding: 2px 4px; border-radius: 4px; font-size: 0.9em; }
    
    /* Code Blocks */
    pre {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1em 0;
    }
    pre code {
      background: transparent;
      padding: 0;
      color: inherit;
      font-size: 0.85em;
    }

    /* Images & Figures */
    img { max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 1em auto; }
    figure { margin: 1em 0; text-align: center; }
    figcaption { font-size: 0.9em; color: #666; margin-top: 8px; }

    /* Lists */
    ul, ol { padding-left: 1.5em; margin-bottom: 1em; }
    li p { margin: 0; }

    /* Tables */
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f8f9fa; }

    /* Custom line height & font size */
    [style*="line-height"] { display: inline-block; width: 100%; }
  </style>
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
      const originalBlob = await requestPdfFromHtml(payload.htmlDocument);
      const pdfBlob = new Blob([originalBlob], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);
      setPdfPreview((prev) => {
        if (prev?.url) {
          URL.revokeObjectURL(prev.url);
        }
        return { url, blob: pdfBlob, fileName: payload.fileName };
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
    const { title } = getValues();
    const htmlContent = getEditorHtml().trim();
    if (!htmlContent || htmlContent === "<p></p>") {
      showNotification(formMessages.modal.noContent, "info");
      return;
    }

    const fallbackName = formMessages.defaults.documentName;
    const docTitleRaw = (title || fallbackName).trim() || fallbackName;
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
          ${htmlContent}
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
    const { title } = getValues();

    let plainText = "";
    if (editorInstance && !editorInstance.isEmpty) {
      plainText = editorInstance.getText().trim();
    } else {
      const htmlFromEditor = getEditorHtml();
      plainText = htmlFromEditor.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }

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
    const { title } = getValues();
    const htmlFromEditor = getEditorHtml();
    const safeHtml = htmlFromEditor.trim();

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


  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 order-2 min-w-full prose prose-blue dark:prose-invert prose-headings:scroll-m-20 article-content bg-white dark:bg-gray-800 px-2 md:px-8 sm:px-0 animate-pulse">
        {/* Title input skeleton */}
        <div className="w-full h-[50px] bg-gray-100 dark:bg-gray-700/60 rounded-full shadow border border-[#d1d9e0] dark:border-[#3d444d]" />

        {/* Editor container skeleton */}
        <div className="w-full rounded-[2rem] border border-[#d1d9e0] dark:border-[#3d444d] bg-white dark:bg-[#0d1017] shadow-sm overflow-hidden flex flex-col" style={{ minHeight: "480px" }}>
          {/* Toolbar row 1 */}
          <div className="h-[44px] shrink-0 border-b border-[#d1d9e0] dark:border-[#3d444d] px-3 flex items-center gap-2">
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

          {/* Toolbar row 2 */}
          <div className="h-[40px] shrink-0 border-b border-[#d1d9e0] dark:border-[#3d444d] px-3 flex items-center gap-2">
            <span className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="mx-1 h-4 w-px bg-gray-200 dark:bg-gray-700" />
            <span className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <span className="ml-auto h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>

          {/* Toolbar row 3 */}
          <div className="h-[40px] shrink-0 border-b border-[#d1d9e0] dark:border-[#3d444d] px-3 flex items-center gap-2">
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
          <div className="flex flex-1">
            {/* Main text area */}
            <div className="flex-1 min-h-[320px] p-5">
              <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-700/50 rounded mb-3" />
              <div className="h-4 w-full bg-gray-100 dark:bg-gray-700/50 rounded mb-3" />
              <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-700/50 rounded mb-3" />
              <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-700/50 rounded mb-3" />
            </div>

            {/* Sidebar skeleton */}
            <div className="hidden md:flex flex-col w-[319px] shrink-0 border-l border-[#d1d9e0] dark:border-[#3d444d] p-4 gap-4">
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
          <div className="shrink-0 border-t border-[#d1d9e0] dark:border-[#3d444d] px-4 py-2.5 flex items-center justify-between gap-3">
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
                {!shouldLoadEditor ? (
                  <div className="w-full bg-gray-100/70 dark:bg-[#111625] animate-pulse rounded-[2rem] border border-[#d1d9e0] dark:border-[#3d444d]" style={{ minHeight: "480px" }} />
                ) : (
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

                    userPlan={userPlan}
                    documentTitle={watch("title")}
                    aria-label={formMessages.aria.content}
                  />
                )}
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
          aria-label={getCommonMessages(locale).editor.reportBug}
        >
          <Bug className="text-xs" />
          {getCommonMessages(locale).editor.reportBug}
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
                <X className="w-5 h-5" />
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
              <X className="w-6 h-6 text-gray-500" />
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
                          {getEditorHtml()}
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
                        {getEditorHtml()}
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


      {isExportingPDF && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-6 bg-white/10 rounded-2xl shadow-lg border border-white/20">
            <h4 className="text-white text-xl font-semibold animate-pulse tracking-wide">
              {formMessages.loading.label}
            </h4>
            {/* CSS spinner — replaces loading.gif (23 KB) with zero-byte animation */}
            <div
              aria-label={formMessages.loading.alt}
              role="status"
              className="w-20 h-20 rounded-full border-4 border-white/20 border-t-white animate-spin drop-shadow-md"
              style={{ animationDuration: "0.8s" }}
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
