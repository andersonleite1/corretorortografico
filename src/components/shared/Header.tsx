"use client";

import React, { useState, useEffect } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import htmlDocx from "html-docx-js/dist/html-docx";
import { saveAs } from "file-saver";
import Modal from "./Modal";

const Header = () => {
  const pathname = usePathname();
  const isEditPage = pathname === "/";

  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(currentTheme);
  }, []);

  // Estado para gerenciar a Modal
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = (message) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const handleClear = () => {
    localStorage.removeItem("post");
    showModal("Conteúdo limpo!");
    setTimeout(() => window.location.reload(), 1000); // Aguarda a modal antes de recarregar
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

        const printableContent =
          printWindow.document.getElementById("printable-content");

        if (!printableContent) {
          showModal("Conteúdo para imprimir não encontrado.");
          return;
        }

        // Captura o conteúdo como canvas
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

        pdf.save(
          post.title != null
            ? `${post.title}.pdf`
            : "editor-de-texto-online.pdf"
        );
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
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${post.title}</title>
        </head>
        <body>
          ${post.content}
        </body>
      </html>
    `;
    const converted = htmlDocx.asBlob(html);
    saveAs(converted, `${post.title || "documento"}.docx`);
    showModal("Documento exportado com sucesso!");
  };

  return (
    <header className="sticky z-50 top-0 px-6 border-b border-neutral-300 dark:border-neutral-700 bg-white/20 dark:bg-[#0d101820] backdrop-blur-lg">
      <div className="h-16 max-w-screen-xl w-full mx-auto flex items-center justify-between gap-6">
        <Link href="/">
          <Image
            src={theme === "dark" ? "/logo-black.png" : "/logo.png"}
            alt="Editor de texto"
            width={150}
            height={90}
          />
        </Link>
        <div className="flex gap-5">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Limpar
          </button>
          <Link
            href={isEditPage ? "/post-csr" : "/"}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {isEditPage ? "Visualizar Post" : "Editar Post"}
          </Link>
          <button
            onClick={handleSavePDF}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Exportar como PDF
          </button>
          <button
            onClick={handleSaveDOC}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Exportar como DOCX
          </button>
        </div>
        <div className="flex gap-5">
          <ThemeSwitcher />
        </div>
      </div>

      {/* Modal para exibir mensagens */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={modalMessage}
      />
    </header>
  );
};

export default Header;
