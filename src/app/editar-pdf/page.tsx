import type { Metadata } from "next";

import EditarPdfClient from "./EditarPdfClient";

export const metadata: Metadata = {
  title: "Editar PDF Online | Editor gratuito para converter e gerenciar arquivos",
  description:
    "Envie um PDF, converta para HTML e continue no editor de PDF gratuito do EditorDeTexto.online. Controle de envios a cada 3 minutos, ideal para editar contratos, propostas e catálogos sem instalar nada.",
  keywords: ["editar PDF online", "editor de PDF gratuito", "ferramenta para editar PDF", "converter e gerenciar arquivos PDF"],
  openGraph: {
    title: "Editar PDF Online | Editor gratuito para converter e gerenciar arquivos",
    description:
      "Ferramenta para editar PDF que limita o envio a cada 3 minutos, converte para HTML e abre automaticamente no editor principal para ajustes rápidos.",
    url: "https://editordetexto.online/editar-pdf",
    siteName: "EditorDeTexto.online",
  },
};

export default function EditarPdfPage() {
  return <EditarPdfClient />;
}
