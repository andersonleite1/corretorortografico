import TiptapEditor, { type TiptapEditorRef } from "@/components/TiptapEditor";
import { getPost, savePost } from "@/services/post";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaEye, FaFilePdf, FaFileWord, FaTrash } from 'react-icons/fa';
import Modal from "@/components/shared/Modal";



interface PostForm {
  title: string;
  content: string;
}

export default function EditForm() {
  const editorRef = useRef<TiptapEditorRef>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { control, reset, watch } = useForm<PostForm>();

  const pathname = usePathname();
  const isEditPage = pathname === "/";

  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(currentTheme);
  }, []);

  const handleClear = () => {
    localStorage.removeItem("post");
    showModal("Conteúdo limpo!");
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleSavePDF = async () => {
    const printWindow = window.open("/post-pdf", "_blank");

    if (!printWindow) {
      showModal("Permita pop-ups para Exportar como PDF.");
      return;
    }

    setTimeout(async () => {
      try {
        const postData = localStorage.getItem("post");
        if (!postData) {
          showModal("Nenhum conteúdo para imprimir.");
          return;
        }
        const post = JSON.parse(postData);

        printWindow.document.title = "Gerando PDF...";

        const printableContent = printWindow.document.getElementById("printable-content");

        if (!printableContent) {
          showModal("Conteúdo para imprimir não encontrado.");
          return;
        }

        const canvas = await html2canvas(printableContent, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "pt", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let position = 0;

        while (position < canvas.height) {
          const pageCanvas = document.createElement("canvas");
          const pageCtx = pageCanvas.getContext("2d");

          if (!pageCtx) {
            console.error("Erro ao obter o contexto 2D do canvas.");
            return;
          }

          pageCanvas.width = canvas.width;
          pageCanvas.height = pdfHeight * (canvas.width / pdfWidth);

          pageCtx.drawImage(
            canvas,
            0,
            position,
            canvas.width,
            pageCanvas.height,
            0,
            0,
            pageCanvas.width,
            pageCanvas.height
          );

          const pageImgData = pageCanvas.toDataURL("image/png");

          pdf.addImage(pageImgData, "PNG", 0, 0, imgWidth, pdfHeight);
          position += pageCanvas.height;

          if (position < canvas.height) {
            pdf.addPage();
          }
        }

        pdf.save(post.title != null ? `${post.title}.pdf` : "editor-de-texto-online.pdf");
        printWindow.close();
        showModal("PDF exportado com sucesso!");
      } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        showModal("Erro ao gerar o PDF.");
      }
    }, 2000);
  };

  const handleSaveDOC = async () => {
    const postData = localStorage.getItem("post");
    if (!postData) {
      showModal("Nenhum conteúdo para Exportar.");
      return;
    }

    const post = JSON.parse(postData);

    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8" />
          <title>${post.title}</title>
        </head>
        <body>
          ${post.content}
        </body>
      </html>
    `;

    const blob = new Blob([html], {
      type: "application/msword;charset=utf-8",
    });

    saveAs(blob, `${post.title || "documento"}.doc`);
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

          <button
            className="bg-green-400 hover:bg-green-500 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center w-full sm:w-auto"
            onClick={handleSaveDOC}
          >
            <FaFileWord className="w-4 h-4 mr-2" />
            <span>Exportar DOC</span>
          </button>

          <button
            disabled
            className="bg-green-200 hover:bg-green-200 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center w-full sm:w-auto"
          >
            <FaFilePdf className="w-4 h-4 mr-2" />
            PDF (Em Breve)
          </button>
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
    </div>
  );
}
