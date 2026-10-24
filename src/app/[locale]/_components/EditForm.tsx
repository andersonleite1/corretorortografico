"use client";

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
import { X } from "lucide-react";
import { getPost, savePost } from "@/services/post";
import { getLocalDocumentById } from "@/lib/local-storage";
import { useRouter, useSearchParams } from "next/navigation";
import { type Locale } from "../../../../i18n-config";
import { getEditMessages } from "@/data/edit/messages";
import { getAcquisitionContent } from "@/data/acquisition";
import { useId } from "react";

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

async function saveFile(blob: Blob, fileName: string) {
  const { saveAs } = await import("file-saver");
  saveAs(blob, fileName);
}

export default function EditForm({ locale, userPlan }: EditFormProps) {
  const t = getAcquisitionContent(locale);
  const titleId = useId();
  const editorRef = useRef<TiptapEditorRef>(null);
  const markdownInputRef = useRef<HTMLInputElement>(null);
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
      paragraph: t.writePlaceholder,
      imageCaption: formMessages.placeholders.imageCaption,
    }),
    [t.writePlaceholder, formMessages.placeholders.imageCaption],
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

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const [shouldLoadEditor, setShouldLoadEditor] = useState(false);

  const handleExportMarkdown = useCallback(async () => {
    const content = editorRef.current?.getInstance()?.getJSON();
    if (!content) return;
    const { exportMarkdownDocument } =
      await import("@/components/TiptapEditor/markdown/exportMarkdown");
    const result = exportMarkdownDocument(content);
    const title = getValues("title")?.trim() || "documento";
    const safeTitle = title.replace(/[\\/:*?"<>|]/g, "-") || "documento";
    await saveFile(
      new Blob([result.markdown], { type: "text/markdown;charset=utf-8" }),
      `${safeTitle}.md`,
    );
  }, [getValues]);

  const handleImportMarkdown = useCallback(async () => {
    const file = markdownInputRef.current?.files?.[0];
    if (!file) return;
    try {
      const { importMarkdown } = await import("@/lib/markdown-import");
      const result = await importMarkdown({
        fileName: file.name,
        content: await file.text(),
      });
      const [{ generateJSON }, getExtensionKit] = await Promise.all([
        import("@tiptap/react"),
        import("@/components/TiptapEditor/kit").then((module) => module.default),
      ]);
      const content = generateJSON(result.html, getExtensionKit(locale));
      setValue("content", content as any, { shouldDirty: true });
      editorRef.current?.getInstance()?.commands.setContent(content);
      const baseName = file.name.replace(/\.md$/i, "").trim();
      if (!getValues("title") && baseName)
        setValue("title", baseName, { shouldDirty: true });
      showNotification("Markdown importado com sucesso.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao importar Markdown";
      showNotification(message, "error");
    } finally {
      if (markdownInputRef.current) markdownInputRef.current.value = "";
    }
  }, [getValues, locale, setValue]);

  const requestMarkdownImport = useCallback(() => {
    markdownInputRef.current?.click();
  }, []);

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
      // Export actions are only available after the editor has mounted, so its
      // instance should provide HTML before this serialized fallback is needed.
      return "";
    }

    return "";
  }, [getValues]);

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

  const preparePdfExport = async () => {
    const { title } = getValues();
    const htmlFromEditor = await getEditorHtml();
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
    const payload = await preparePdfExport();
    if (!payload) return;

    setIsExportingPDF(true);

    try {
      const { requestPdfFromHtml } = await import("@/services/pdfService");
      const blob = await requestPdfFromHtml(payload.htmlDocument);
      await saveFile(blob, payload.fileName);
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
    const payload = await preparePdfExport();
    if (!payload) return;

    setIsExportingPDF(true);

    try {
      const { requestPdfFromHtml } = await import("@/services/pdfService");
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

    try {
      const { createWordDocument } = await import("@/lib/docx-export");
      await saveFile(createWordDocument(htmlContent, docTitle), `${docTitle}.docx`);
    } catch {
      showNotification(t.exportError, "error");
      return;
    }
    showNotification(formMessages.modal.docSuccess);
  };

  const handleExportToTxt = async () => {
    const editorInstance = editorRef.current?.getInstance();
    const { title } = getValues();

    let plainText = "";
    if (editorInstance && !editorInstance.isEmpty) {
      plainText = editorInstance.getText().trim();
    } else {
      const htmlFromEditor = getEditorHtml();
      plainText = htmlFromEditor
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    if (!plainText) {
      showNotification(formMessages.modal.noContent, "info");
      return;
    }

    const fallbackName = formMessages.defaults.documentName;
    const baseTitle = (title || fallbackName).trim() || fallbackName;
    const safeTitle = baseTitle.replace(/[\\/:*?"<>|]/g, "-") || fallbackName;

    const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
    await saveFile(blob, `${safeTitle}.txt`);
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

  const handleDownloadPreviewPdf = useCallback(async () => {
    if (!pdfPreview) return;
    await saveFile(pdfPreview.blob, pdfPreview.fileName);
  }, [pdfPreview]);

  const handlePreviewPost = useCallback(() => {
    setIsPostPreviewOpen(true);
    setIsPreviewHtmlMode(false);
  }, []);

  const handleDownloadHtml = async () => {
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
    await saveFile(blob, `${safeTitle}.html`);
    showNotification(formMessages.modal.docSuccess);
  };

  const getWordCount = useCallback(
    () => editorRef.current?.getInstance()?.storage.characterCount.words() ?? 0,
    [],
  );

  useEffect(() => {
    setIsLoading(true);
    let cancelled = false;
    const loadDraft = async () => {
      try {
        let post;

        if (docId?.startsWith("local-")) {
          try {
            const localDoc = getLocalDocumentById(docId);
            if (localDoc) {
              post = { title: localDoc.title, content: localDoc.content };
            }
          } catch (error) {
            // A malformed browser draft must not prevent the editor from opening.
            console.error("[EditForm] Could not read local document:", error);
          }
        }

        if (!post) post = await getPost();
        if (cancelled) return;

        reset({ title: post?.title ?? "", content: post?.content ?? "" });
        const instance = editorRef.current?.getInstance();
        if (instance && post?.content) {
          instance.commands.setContent(post.content);
        }
      } catch (error) {
        console.error("[EditForm] Error loading local draft:", error);
        if (!cancelled) reset({ title: "", content: "" });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadDraft();

    return () => {
      cancelled = true;
      clearPdfPreview();
    };
  }, [clearPdfPreview, reset, docId]);

  useEffect(() => {
    const updateTitle = (event: Event) => {
      const detail = (event as CustomEvent<{ id: string; title: string }>)
        .detail;
      if (detail.id === docId)
        setValue("title", detail.title, { shouldDirty: true });
    };
    const removeActive = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== docId) return;
      reset({ title: "", content: "" });
      editorRef.current?.getInstance()?.commands.clearContent();
      savePost({ title: "", content: "" });
      router.replace(locale === "pt" ? "/" : `/${locale}`, { scroll: false });
    };
    window.addEventListener("editordetexto:rename-document", updateTitle);
    window.addEventListener("editordetexto:delete-document", removeActive);
    return () => {
      window.removeEventListener("editordetexto:rename-document", updateTitle);
      window.removeEventListener("editordetexto:delete-document", removeActive);
    };
  }, [docId, locale, reset, router, setValue]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pending: Partial<PostForm> | null = null;
    const flush = () => {
      clearTimeout(timer);
      if (!pending) return;
      savePost({ ...pending, wordCount: getWordCount() }, docId);
      pending = null;
    };
    const subscription = watch((values, { type }) => {
      if (type !== "change") return;
      pending = { ...values };
      clearTimeout(timer);
      timer = setTimeout(flush, 1500);
    });
    const flushWhenHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("beforeunload", flush);
    window.addEventListener("editordetexto:before-leave", flush);
    document.addEventListener("visibilitychange", flushWhenHidden);
    return () => {
      subscription.unsubscribe();
      flush();
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("editordetexto:before-leave", flush);
      document.removeEventListener("visibilitychange", flushWhenHidden);
    };
  }, [watch, docId, getWordCount]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 order-2 min-w-full prose prose-blue dark:prose-invert prose-headings:scroll-m-20 article-content px-2 md:px-8 sm:px-0 animate-pulse">
        {/* Title input skeleton */}
        <div className="w-full h-[50px] bg-gray-100 dark:bg-gray-700/60 rounded-full shadow border border-[#d1d9e0] dark:border-[#3d444d]" />

        {/* Editor container skeleton */}
        <div
          className="w-full rounded-[2rem] border border-[#d1d9e0] dark:border-[#3d444d] bg-white dark:bg-[#0d1017] shadow-sm overflow-hidden flex flex-col"
          style={{ minHeight: "480px" }}
        >
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

      </div>
    );
  }

  return (
    <>
      <input
        ref={markdownInputRef}
        type="file"
        accept=".md,text/markdown"
        className="hidden"
        onChange={() => void handleImportMarkdown()}
        aria-label="Importar arquivo Markdown"
      />
      <div className="flex flex-col gap-6 order-2 min-w-full prose prose-blue dark:prose-invert prose-headings:scroll-m-20 article-content px-2 md:px-8 sm:px-0 pb-6">
        <div className="editor-title-field">
          <label htmlFor={titleId}>{t.titleLabel}</label>
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <input
                {...field}
                id={titleId}
                value={field.value || ""}
                type="text"
                className="w-full px-4 py-2.5 shadow border border-[#d1d9e0] rounded-full bg-white dark:bg-[#0d1017] dark:text-white dark:border-[#3d444d] outline-none"
                placeholder={t.titlePlaceholder}
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
                    <div
                      className="w-full bg-gray-100/70 dark:bg-[#111625] animate-pulse rounded-[2rem] border border-[#d1d9e0] dark:border-[#3d444d]"
                      style={{ minHeight: "480px" }}
                    />
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
                        onExportMarkdown: handleExportMarkdown,
                        onExportPdf: handleExportToPDF,
                        onExportTxt: handleExportToTxt,
                        onPreviewPdf: handlePreviewPdf,
                        onPreviewPost: handlePreviewPost,
                        onClear: handleClear,
                        isExportingPdf: isExportingPDF,
                      }}
                      onImportMarkdown={requestMarkdownImport}
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
                          <code>{getEditorHtml()}</code>
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
                        <TiptapRenderer>{getEditorHtml()}</TiptapRenderer>
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

      </div>
    </>
  );
}
