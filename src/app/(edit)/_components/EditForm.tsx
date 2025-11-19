import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import TiptapEditor, { type TiptapEditorRef } from "@/components/TiptapEditor";
import Modal from "@/components/shared/Modal";
import { saveAs } from "file-saver";
import { FaTimes } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { getPost, savePost } from "@/services/post";
import { requestPdfFromHtml } from "@/services/pdfService";
import { useRouter } from "next/navigation";
import { type Locale } from "../../../../i18n-config";
import { getEditMessages } from "@/data/edit/messages";


interface PostForm {
  title: string;
  content: string;
}

interface EditFormProps {
  locale: Locale;
}

export default function EditForm({ locale }: EditFormProps) {
  const editorRef = useRef<TiptapEditorRef>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { control, reset, watch, getValues } = useForm<PostForm>();
  const { form: formMessages } = useMemo(() => getEditMessages(locale), [locale]);

  const [drafts, setDrafts] = useState<{ id: string; title: string; content: string; date: string }[]>([]);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<{
    url: string;
    blob: Blob;
    fileName: string;
  } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleClear = () => {
    localStorage.removeItem("post");
    showModal(formMessages.modal.cleared);
    setTimeout(() => window.location.reload(), 1000);
  };

  const preparePdfExport = () => {
    const editorInstance = editorRef.current?.getInstance();
    const { title, content } = getValues();
    const htmlFromEditor = editorInstance?.getHTML() ?? content;
    const safeHtml = htmlFromEditor?.trim();

    if (!safeHtml) {
      showModal(formMessages.modal.noContent);
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
      showModal(formMessages.modal.pdfSuccess);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      showModal(error instanceof Error ? error.message : formMessages.modal.pdfError);
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
      showModal(error instanceof Error ? error.message : formMessages.modal.pdfError);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleSaveDOC = async () => {
    const postData = localStorage.getItem("post");
    if (!postData) {
      showModal(formMessages.modal.noContent);
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
    showModal(formMessages.modal.docSuccess);
  };

  const handleExportToTxt = () => {
    const editorInstance = editorRef.current?.getInstance();
    const { title, content } = getValues();
    const plainText =
      editorInstance?.getText?.().trim() ||
      content?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ||
      "";

    if (!plainText) {
      showModal(formMessages.modal.noContent);
      return;
    }

    const fallbackName = formMessages.defaults.documentName;
    const baseTitle = (title || fallbackName).trim() || fallbackName;
    const safeTitle = baseTitle.replace(/[\\/:*?"<>|]/g, "-") || fallbackName;

    const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${safeTitle}.txt`);
    showModal(formMessages.modal.txtSuccess);
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
    router.push("/post-csr");
  }, [router]);

  // Estado para gerenciar a Modal
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = (message: string) => {
    setModalMessage(message);
    setIsModalOpen(true);
    // fecha automaticamente apos 4 segundos
    setTimeout(() => {
      setIsModalOpen(false);
    }, 4000);
  };

  const getWordCount = useCallback(
    () => editorRef.current?.getInstance()?.storage.characterCount.words() ?? 0,
    [editorRef.current]
  );

  useEffect(() => {
    getPost().then((post) => {
      reset({ ...post });
      setIsLoading(false);
    });

    return () => {
      clearPdfPreview();
    };
  }, [clearPdfPreview, reset]);

  useEffect(() => {
    const subscription = watch((values, { type }) => {
      if (type === "change") {
        savePost({ ...values, wordCount: getWordCount() });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    const content = watch("content");
    if (content !== editorRef.current?.getInstance()?.getHTML()) {
      editorRef.current?.getInstance()?.commands.setContent(content);
    }
  }, [watch("content")]);


  // Carrega os rascunhos ao iniciar
  useEffect(() => {
    const savedDrafts = JSON.parse(localStorage.getItem("drafts") || "[]");
    setDrafts(savedDrafts);
  }, []);

  // Função para salvar o rascunho atual
  const handleSaveDraft = () => {
    const current = {
      id: uuidv4(),
      title: watch("title") || formMessages.defaults.draftTitle,
      content: watch("content") || "",
      date: new Date().toLocaleString(formMessages.dateLocale),
    };

    let updatedDrafts = [...drafts, current];

    // Limita a 10 rascunhos
    if (updatedDrafts.length > 10) {
      updatedDrafts = updatedDrafts.slice(-10);
    }

    localStorage.setItem("drafts", JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
    showModal(formMessages.modal.draftSaved);
  };

  // Função para carregar um rascunho
  const handleLoadDraft = (draftId: string) => {
    console.log('fui chamado');

    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) return;

    console.log('title: ', draft.title);
    console.log('content: ', draft.content);

    // Atualiza o estado do formulário
    reset({ title: draft.title, content: draft.content });

    // Atualiza o conteúdo visível do Tiptap
    editorRef.current?.getInstance()?.commands.setContent(draft.content);

    showModal(formMessages.modal.draftLoaded);
  };

  // Função para excluir um rascunho
  const handleDeleteDraft = (draftId: string) => {
    const updated = drafts.filter((d) => d.id !== draftId);
    localStorage.setItem("drafts", JSON.stringify(updated));
    setDrafts(updated);
    showModal(formMessages.modal.draftDeleted);
  };


  if (isLoading) {
    const toolbarItems = Array.from({ length: 6 });
    return (
      <div className="flex flex-col gap-6 order-2 min-w-full h-screen prose prose-blue dark:prose-invert prose-headings:scroll-m-20 article-content bg-white dark:bg-gray-800 px-4 md:px-8 animate-pulse">
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          message={modalMessage}
        />

        <div>
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="w-full h-11 bg-gray-100 dark:bg-gray-700 rounded-md shadow border border-[#d1d9e0] dark:border-[#3d444d]" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-full rounded-md shadow border border-[#d1d9e0] dark:border-[#3d444d] bg-gray-100/70 dark:bg-[#111625] min-h-[480px]">
            <div className="h-12 border-b border-[#d1d9e0] dark:border-[#3d444d] px-4 flex items-center gap-3">
              {toolbarItems.map((_, index) => (
                <span
                  key={index}
                  className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded"
                />
              ))}
              <span className="ml-auto h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 min-h-[268px]" />
            <div className="border-t border-[#d1d9e0] dark:border-[#3d444d] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <span className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="flex items-center gap-3">
                <span className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                <span className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 order-2 min-w-full prose prose-blue dark:prose-invert prose-headings:scroll-m-20 article-content bg-white dark:bg-gray-800 px-2 md:px-8 sm:px-0 min-h-screen pb-12">
      <div>
        <label className="inline-block font-medium dark:text-white mb-2">
          {formMessages.labels.title}
        </label>
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="w-full px-4 py-2.5 shadow border border-[#d1d9e0] rounded-md bg-white dark:bg-[#0d1017] dark:text-white dark:border-[#3d444d] outline-none"
              placeholder={formMessages.placeholders.title}
            />
          )}
        />
      </div>

      <div>
        <label className="inline-block font-medium dark:text-white mb-2">
          {formMessages.labels.content}
        </label>
        <Controller
          control={control}
          name="content"
          render={({ field }) => (
            <TiptapEditor
              ref={editorRef}
              ssr={true}
              output="html"
              locale={locale}
              placeholder={{
                paragraph: formMessages.placeholders.content,
                imageCaption: formMessages.placeholders.imageCaption,
              }}
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
                drafts: drafts.map(({ id, title, date }) => ({ id, title, date })),
                onSaveDraft: handleSaveDraft,
                onLoadDraft: handleLoadDraft,
                onDeleteDraft: handleDeleteDraft,
              }}
              aria-label={formMessages.aria.content}
            />
          )}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={modalMessage}
      />

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

      {isExportingPDF && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-6 bg-white/10 rounded-2xl shadow-lg border border-white/20">
            <h4 className="text-white text-xl font-semibold animate-pulse tracking-wide">
              {formMessages.loading.label}
            </h4>
            <img
              src="/loading.gif"
              alt={formMessages.loading.alt}
              className="w-20 h-20 drop-shadow-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}
