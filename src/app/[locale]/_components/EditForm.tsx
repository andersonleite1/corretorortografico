import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import TiptapEditor, { type TiptapEditorRef } from "@/components/TiptapEditor";
import Modal from "@/components/shared/Modal";
import { saveAs } from "file-saver";
import { FaTimes } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { getPost, savePost } from "@/services/post";
import { requestPdfFromHtml } from "@/services/pdfService";
import { useRouter, useSearchParams } from "next/navigation";
import { type Locale } from "../../../../i18n-config";
import { getEditMessages } from "@/data/edit/messages";
import { DraftComparison } from "@/components/Drafts/DraftComparison";


interface PostForm {
  title: string;
  content: string;
}

interface EditFormProps {
  locale: Locale;
  userPlan: "free" | "pro" | "team";
}

export default function EditForm({ locale, userPlan }: EditFormProps) {
  const editorRef = useRef<TiptapEditorRef>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams.get("docId");
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
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [selectedDraftForComparison, setSelectedDraftForComparison] = useState<{ content: any, id: string } | null>(null);
  const [draftSavingStatus, setDraftSavingStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const handleClear = () => {
    localStorage.removeItem("post");
    reset({ title: "", content: "" });
    editorRef.current?.getInstance()?.commands.setContent("");
    router.push(`/${locale}`);
    showModal(formMessages.modal.cleared);
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
    setIsLoading(true);
    if (docId) {
      fetch(`/api/documents/${docId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Documento não encontrado");
          return res.json();
        })
        .then((doc) => {
          let content = doc.content;
          if (typeof content === "string" && (content.startsWith("{") || content.startsWith("["))) {
            try {
              content = JSON.parse(content);
            } catch (e) {
              // Fallback
            }
          }
          reset({ title: doc.title, content });
          setIsLoading(false);
        })
        .catch((error) => {
          console.error(error);
          // Se não encontrar, continua com o post do localStorage ou mock
          getPost().then((post) => {
            reset({ ...post });
            setIsLoading(false);
          });
        });
    } else {
      getPost().then((post) => {
        reset({ ...post });
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
    if (docId) {
      fetch(`/api/documents/${docId}/drafts`)
        .then((res) => res.json())
        .then((data) => {
          setDrafts(data.map((d: any) => ({
            id: d.id,
            title: d.title,
            content: d.content,
            date: new Date(d.createdAt).toLocaleString(locale === 'pt' ? 'pt-BR' : 'en-US')
          })));
        })
        .catch(console.error);
    } else {
      const savedDrafts = JSON.parse(localStorage.getItem("drafts") || "[]");
      setDrafts(savedDrafts);
    }
  }, [docId, locale]);

  // Função para salvar o rascunho atual
  const handleSaveDraft = async (isExplicit = false) => {
    if (!docId) {
      // Fallback para localStorage se não houver docId
      const current = {
        id: uuidv4(),
        title: watch("title") || formMessages.defaults.draftTitle,
        content: watch("content") || "",
        date: new Date().toLocaleString(formMessages.dateLocale),
      };

      let updatedDrafts = [...drafts, current];
      if (updatedDrafts.length > 10) updatedDrafts = updatedDrafts.slice(-10);
      localStorage.setItem("drafts", JSON.stringify(updatedDrafts));
      setDrafts(updatedDrafts);
      if (isExplicit) showModal(formMessages.modal.draftSaved);
      return;
    }

    try {
      if (!isExplicit) setDraftSavingStatus("saving");

      const content = watch("content");
      const stringifiedContent = typeof content === "object" ? JSON.stringify(content) : content;

      const res = await fetch(`/api/documents/${docId}/drafts`, {
        method: "POST",
        headers: {
          "x-diagnose": "true",
        },
        body: JSON.stringify({
          title: watch("title"),
          content: stringifiedContent,
          isExplicitSave: isExplicit
        })
      });

      if (res.ok) {
        if (!isExplicit) {
          setDraftSavingStatus("saved");
          setTimeout(() => {
            setDraftSavingStatus("idle");
          }, 3000);
        }

        const newDraft = await res.json();
        // Refresh drafts list
        const draftsRes = await fetch(`/api/documents/${docId}/drafts`);
        const data = await draftsRes.json();
        setDrafts(data.map((d: any) => ({
          id: d.id,
          title: d.title,
          content: d.content,
          date: new Date(d.createdAt).toLocaleString(locale === 'pt' ? 'pt-BR' : 'en-US')
        })));
        if (isExplicit) showModal(formMessages.modal.draftSaved);
      } else {
        const errorText = await res.text();
        throw new Error(errorText || "Error saving draft");
      }
    } catch (error) {
      console.error(error);
      if (!isExplicit) {
        setDraftSavingStatus("error");
      } else {
        showModal(error instanceof Error ? error.message : "Erro ao salvar rascunho");
      }
    }
  };

  // Auto-save draft on content change (throttled by the API)
  useEffect(() => {
    const subscription = watch((values, { name, type }) => {
      // name === "content" ensures we don't save on title changes redundantely or vice-versa if handled elsewhere
      // but usually we want both. The important thing is THAT it reacts to changes.
      if (type === "change") {
        handleSaveDraft(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, docId, handleSaveDraft]);

  // Função para carregar um rascunho
  const handleLoadDraft = (draftId: string) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) return;

    let content = draft.content;
    // Ensure content is parsed if it's a stringified JSON
    if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('['))) {
      try {
        content = JSON.parse(content);
      } catch (e) {
        // Fallback to string if parsing fails
      }
    }

    reset({ title: draft.title, content });
    editorRef.current?.getInstance()?.commands.setContent(content);
    showModal(formMessages.modal.draftLoaded);
  };

  // Função para excluir um rascunho
  const handleDeleteDraft = async (draftId: string) => {
    if (!docId) {
      const updated = drafts.filter((d) => d.id !== draftId);
      localStorage.setItem("drafts", JSON.stringify(updated));
      setDrafts(updated);
      showModal(formMessages.modal.draftDeleted);
      return;
    }

    // Nota: Precisamos da rota de DELETE ou apenas filtramos se for via API
    // Por simplicidade neste MVP, vamos focar no salvamento/comparação.
    // Mas vamos implementar o filtro local para UX imediata.
    setDrafts(prev => prev.filter(d => d.id !== draftId));
  };

  const handleCompareDraft = (draftId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (draft) {
      setSelectedDraftForComparison({ content: draft.content, id: draft.id });
      setIsComparisonOpen(true);
    }
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
          render={({ field }) => (
            <div
              className="w-full rounded-[2rem]"
              style={{ "--rte-radius": "2rem" } as CSSProperties}
            >
              <TiptapEditor
                ref={editorRef}
                ssr={true}
                output="json"
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
