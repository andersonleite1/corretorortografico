import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import TiptapEditor, { type TiptapEditorRef } from "@/components/TiptapEditor";
import Modal from "@/components/shared/Modal";
import { saveAs } from "file-saver";
import Link from "next/link";
import { FaChevronDown, FaEye, FaFilePdf, FaFileWord, FaTrash } from 'react-icons/fa';
import { v4 as uuidv4 } from "uuid";
import { getPost, savePost } from "@/services/post";
import { requestPdfFromHtml } from "@/services/pdfService";


interface PostForm {
  title: string;
  content: string;
}

export default function EditForm() {
  const editorRef = useRef<TiptapEditorRef>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { control, reset, watch, getValues } = useForm<PostForm>();

  const [open, setOpen] = useState(false);

  const [openDrafts, setOpenDrafts] = useState(false);
  const [drafts, setDrafts] = useState<{ id: string; title: string; content: string; date: string }[]>([]);

  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleClear = () => {
    localStorage.removeItem("post");
    showModal("Conteúdo limpo!");
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleExportToPDF = async () => {
    const editorInstance = editorRef.current?.getInstance();
    const { title, content } = getValues();
    const htmlFromEditor = editorInstance?.getHTML() ?? content;
    const safeHtml = htmlFromEditor?.trim();

    if (!safeHtml) {
      showModal("Nenhum conteúdo para exportar.");
      return;
    }

    const baseTitle = (title || "Documento").trim() || "Documento";
    const safeTitle = baseTitle.replace(/[\\/:*?"<>|]/g, "-") || "Documento";
    const fileName = `${safeTitle}.pdf`;

    const htmlDocument = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
</head>
<body>
  ${safeHtml}
</body>
</html>`;

    setIsExportingPDF(true);

    try {
      const blob = await requestPdfFromHtml(htmlDocument);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showModal("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      showModal(error instanceof Error ? error.message : "Erro ao gerar o PDF.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleSaveDOC = async () => {
    const postData = localStorage.getItem("post");
    if (!postData) {
      showModal("Nenhum conteúdo para Exportar.");
      return;
    }

    const post = JSON.parse(postData);
    const docTitleRaw = (post.title || "documento").trim() || "documento";
    const docTitle = docTitleRaw.replace(/[\\/:*?"<>|]/g, "-") || "documento";

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
    showModal("Documento exportado com sucesso!");
  };

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
  }, []);

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
      title: watch("title") || "Sem título",
      content: watch("content") || "",
      date: new Date().toLocaleString("pt-BR"),
    };

    let updatedDrafts = [...drafts, current];

    // Limita a 10 rascunhos
    if (updatedDrafts.length > 10) {
      updatedDrafts = updatedDrafts.slice(-10);
    }

    localStorage.setItem("drafts", JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
    showModal("Rascunho salvo com sucesso!");
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

    showModal("Rascunho carregado!");
    setOpenDrafts(false);
  };

  // Função para excluir um rascunho
  const handleDeleteDraft = (draftId: string) => {
    const updated = drafts.filter((d) => d.id !== draftId);
    localStorage.setItem("drafts", JSON.stringify(updated));
    setDrafts(updated);
    showModal("Rascunho excluído!");
  };


  if (isLoading) return (
    <div className="flex flex-col gap-6 order-2 min-w-full prose prose-blue dark:prose-invert prose-headings:scroll-m-20 article-content bg-white dark:bg-gray-800 px-4 md:px-8 animate-pulse">

      {/* Modal para exibir mensagens */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={modalMessage}
      />

      {/* Título */}
      <div>
        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="w-full h-10 bg-gray-100 dark:bg-gray-700 rounded-md shadow border border-[#d1d9e0] dark:border-[#3d444d]" />
      </div>

      {/* Editor */}
      <div>
        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="w-full h-[320px] bg-gray-100 dark:bg-gray-700 rounded-md shadow border border-[#d1d9e0] dark:border-[#3d444d]" />
        <div className="flex flex-wrap gap-5 mt-5 justify-center">
          {/* Skeleton do botão Limpar */}
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

          {/* Skeleton do botão Visualizar/Editar Post */}
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

          {/* Skeleton do botão Exportar DOC */}
          <div className="h-10 w-44 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

          {/* Skeleton do botão PDF (Em breve) */}
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

      </div>

      {/* Título da tabela 1 */}
      <div className="h-6 w-56 bg-gray-200 dark:bg-gray-700 rounded" />

      {/* Tabela 1 */}
      <div className="overflow-x-auto">
        <div className="w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-md text-sm">
          <div className="grid grid-cols-3 gap-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-3 border-b border-gray-300 dark:border-gray-700">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded col-span-1" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded col-span-1" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded col-span-1" />
          </div>

          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-gray-300 dark:border-gray-700"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded col-span-1" />
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded col-span-1" />
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded col-span-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Título da tabela 2 */}
      <div className="h-6 w-56 bg-gray-200 dark:bg-gray-700 rounded" />

      {/* Tabela 2 */}
      <div className="overflow-x-auto">
        <div className="w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-md text-sm">
          <div className="grid grid-cols-3 gap-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-3 border-b border-gray-300 dark:border-gray-700">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded col-span-1" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded col-span-1" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded col-span-1" />
          </div>

          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-gray-300 dark:border-gray-700"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded col-span-1" />
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded col-span-1" />
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded col-span-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 order-2 min-w-full prose prose-blue dark:prose-invert prose-headings:scroll-m-20 article-content bg-white dark:bg-gray-800 px-4 md:px-8">
      <div>
        <label className="inline-block font-medium dark:text-white mb-2">
          Título
        </label>
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="w-full px-4 py-2.5 shadow border border-[#d1d9e0] rounded-md bg-white dark:bg-[#0d1017] dark:text-white dark:border-[#3d444d] outline-none"
              placeholder="Digite o título da postagem ou nome do arquivo que será exportado..."
            />
          )}
        />
      </div>

      <div>
        <label className="inline-block font-medium dark:text-white mb-2">
          Conteúdo
        </label>
        <Controller
          control={control}
          name="content"
          render={({ field }) => (
            <TiptapEditor
              ref={editorRef}
              ssr={true}
              output="html"
              placeholder={{
                paragraph: "Digite seu conteúdo aqui...",
                imageCaption: "Digite a legenda da imagem (opcional)",
              }}
              contentMinHeight={256}
              contentMaxHeight={640}
              onContentChange={field.onChange}
              initialContent={field.value}
              aria-label="Campo de conteúdo do post"
            />
          )}
        />

        <div className="flex flex-wrap gap-5 mt-5 justify-center">
          <button
            className="bg-red-400 hover:bg-red-500 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center w-full sm:w-auto"
            onClick={handleClear}
          >
            <FaTrash className="w-4 h-4 mr-2" />
            Limpar
          </button>

          <Link
            className="bg-green-400 hover:bg-green-500 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center w-full sm:w-auto"
            href="/post-csr"
          >
            <FaEye className="w-4 h-4 mr-2" />
            Visualizar Post
          </Link>

          <div className="relative inline-block text-left">
            {/* Botão principal */}
            <button
              onClick={() => setOpen(!open)}
              className="bg-green-400 hover:bg-green-500 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center w-full sm:w-auto"
            >
              <span>Exportar</span>
              <FaChevronDown className="ml-2 w-4 h-4" />
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute mt-2 w-44 bg-white rounded shadow-lg z-10">
                <button
                  onClick={() => {
                    handleSaveDOC();
                    setOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FaFileWord className="w-4 h-4 mr-2 text-blue-600" />
                  Exportar DOC
                </button>

                <button
                  onClick={async () => {
                    setOpen(false);
                    await handleExportToPDF();
                  }}
                  disabled={isExportingPDF}
                  className={`flex items-center w-full px-4 py-2 text-sm ${
                    isExportingPDF
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FaFilePdf className="w-4 h-4 mr-2 text-red-500" />
                  {isExportingPDF ? "Gerando PDF..." : "Exportar PDF"}
                </button>
              </div>
            )}
          </div>
          <div className="relative inline-block text-left">
            {/* Botão principal */}
            <button
              onClick={() => setOpenDrafts(!openDrafts)}
              className="bg-blue-400 hover:bg-blue-500 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center w-full sm:w-auto"
            >
              <span>Rascunhos</span>
              <FaChevronDown className="ml-2 w-4 h-4" />
            </button>

            {/* Dropdown */}
            {openDrafts && (
              <div className="absolute mt-2 w-64 bg-white rounded shadow-lg z-10">
                <button
                  onClick={() => {
                    handleSaveDraft();
                    setOpenDrafts(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b"
                >
                  💾 Salvar Rascunho
                </button>

                {drafts.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500">Nenhum rascunho salvo</div>
                ) : (
                  drafts
                    .slice()
                    .reverse()
                    .map((d) => (
                      <div
                        key={d.id}
                        className="flex justify-between items-center px-4 py-2 text-sm hover:bg-gray-50 border-b last:border-0"
                      >
                        <div
                          onClick={() => handleLoadDraft(d.id)}
                          className="cursor-pointer text-gray-700 truncate w-40"
                          title={d.title}
                        >
                          📝 {d.title}
                        </div>
                        <button
                          onClick={() => handleDeleteDraft(d.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Excluir"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      <h3>Fundamentos de Comandos</h3>
      <div className="">
        <table className="min-w-full w-full border-collapse border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-left shadow-md mt-0 pt-0">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <th className="px-4 py-3 border-b border-gray-300 dark:border-gray-700">
                Comando
              </th>
              <th className="px-4 py-3 border-b border-gray-300 dark:border-gray-700">
                Windows/Linux
              </th>
              <th className="px-4 py-3 border-b border-gray-300 dark:border-gray-700">
                macOS
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-900 dark:text-gray-200">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Copiar
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">C</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">C</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Recortar
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">X</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">X</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Colar
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">V</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">V</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Colar sem formatação
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">V</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">V</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Desfazer
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Z</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Z</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Refazer
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Z</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Z</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Adicionar quebra de linha
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Enter</kbd> <br />
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Enter</kbd> <br />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="mb-0 pb-0">Formatação de texto</h3>
      <div className="">
        <table className="min-w-full w-full border-collapse border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-left shadow-md mt-0 pt-0">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <th className="px-4 py-3 border-b border-gray-300 dark:border-gray-700">
                Comando
              </th>
              <th className="px-4 py-3 border-b border-gray-300 dark:border-gray-700">
                Windows/Linux
              </th>
              <th className="px-4 py-3 border-b border-gray-300 dark:border-gray-700">
                macOS
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-900 dark:text-gray-200">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Negrito
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">B</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">B</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Itálico
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">I</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">I</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Sublinhado
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">U</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">U</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Tachado
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">S</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">S</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Destaque
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">H</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">H</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Código
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">E</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={modalMessage}
      />
      {isExportingPDF && (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 p-6 bg-white/10 rounded-2xl shadow-lg border border-white/20">
          <h4 className="text-white text-xl font-semibold animate-pulse tracking-wide">
            Gerando PDF...
          </h4>
          <img
            src="/loading.gif"
            alt="Gerando PDF"
            className="w-20 h-20 drop-shadow-md"
          />
        </div>
      </div>
    )}
    </div>
  );
}
