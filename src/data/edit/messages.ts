import { i18n, type Locale } from "../../../i18n-config";

type Shortcut = {
  command: string;
  windows: string;
  mac: string;
};

export type EditPageMessages = {
  form: {
    labels: {
      title: string;
      content: string;
    };
    placeholders: {
      title: string;
      content: string;
      imageCaption: string;
    };
    aria: {
      content: string;
    };
    modal: {
      cleared: string;
      noContent: string;
      pdfSuccess: string;
      pdfError: string;
      docSuccess: string;
      txtSuccess: string;
      draftSaved: string;
      draftLoaded: string;
      draftDeleted: string;
    };
    defaults: {
      documentName: string;
      draftTitle: string;
    };
    preview: {
      heading: string;
      closeAria: string;
      iframeTitle: string;
      close: string;
      download: string;
    };
    postPreview: {
      heading: string;
      close: string;
      viewHtml: string;
      downloadHtml: string;
      blogPreview: string;
      htmlCode: string;
    };
    loading: {
      label: string;
      alt: string;
    };
    pdfLang: string;
    dateLocale: string;
  };
  shortcuts: {
    ariaLabel: string;
    eyebrow: string;
    description: string;
    windowsLabel: string;
    macLabel: string;
    sections: Array<{
      id: string;
      title: string;
      shortcuts: Shortcut[];
    }>;
  };
};

const editMessages: Record<Locale, EditPageMessages> = {
  pt: {
    form: {
      labels: {
        title: "Título",
        content: "Conteúdo",
      },
      placeholders: {
        title: "Digite o título da postagem ou nome do arquivo que será exportado...",
        content: "Digite seu conteúdo aqui...",
        imageCaption: "Digite a legenda da imagem (opcional)",
      },
      aria: {
        content: "Campo de conteúdo do post",
      },
      modal: {
        cleared: "Conteúdo limpo!",
        noContent: "Nenhum conteúdo para exportar.",
        pdfSuccess: "PDF exportado com sucesso!",
        pdfError: "Erro ao gerar o PDF.",
        docSuccess: "Documento exportado com sucesso!",
        txtSuccess: "Arquivo TXT exportado com sucesso!",
        draftSaved: "Rascunho salvo com sucesso!",
        draftLoaded: "Rascunho carregado!",
        draftDeleted: "Rascunho excluído!",
      },
      defaults: {
        documentName: "Documento",
        draftTitle: "Sem título",
      },
      preview: {
        heading: "Pré-visualização do PDF",
        closeAria: "Fechar pré-visualização",
        iframeTitle: "Pré-visualização do PDF",
        close: "Fechar",
        download: "Download",
      },
      postPreview: {
        heading: "Pré-visualização do Post",
        close: "Fechar Visualização",
        viewHtml: "Visualizar HTML Gerado",
        downloadHtml: "Baixar Conteúdo HTML Gerado",
        blogPreview: "Prévia do Blog",
        htmlCode: "Código HTML",
      },
      loading: {
        label: "Gerando PDF...",
        alt: "Gerando PDF",
      },
      pdfLang: "pt-BR",
      dateLocale: "pt-BR",
    },
    shortcuts: {
      ariaLabel: "Atalhos do teclado",
      eyebrow: "Atalhos do teclado",
      description: "Comandos rápidos para editar sem tirar as mãos do teclado.",
      windowsLabel: "Win / Linux",
      macLabel: "macOS",
      sections: [
        {
          id: "fundamentos",
          title: "Fundamentos de comandos",
          shortcuts: [
            { command: "Copiar", windows: "Ctrl + C", mac: "Cmd + C" },
            { command: "Recortar", windows: "Ctrl + X", mac: "Cmd + X" },
            { command: "Colar", windows: "Ctrl + V", mac: "Cmd + V" },
            {
              command: "Colar sem formatação",
              windows: "Ctrl + Shift + V",
              mac: "Cmd + Shift + V",
            },
            { command: "Desfazer", windows: "Ctrl + Z", mac: "Cmd + Z" },
            { command: "Refazer", windows: "Ctrl + Shift + Z", mac: "Cmd + Shift + Z" },
            {
              command: "Adicionar quebra de linha",
              windows: "Shift + Enter",
              mac: "Shift + Enter",
            },
          ],
        },
        {
          id: "formatacao",
          title: "Formatação de texto",
          shortcuts: [
            { command: "Negrito", windows: "Ctrl + B", mac: "Cmd + B" },
            { command: "Itálico", windows: "Ctrl + I", mac: "Cmd + I" },
            { command: "Sublinhado", windows: "Ctrl + U", mac: "Cmd + U" },
            { command: "Tachado", windows: "Ctrl + Shift + S", mac: "Cmd + Shift + S" },
            { command: "Destaque", windows: "Ctrl + Shift + H", mac: "Cmd + Shift + H" },
            { command: "Código", windows: "Ctrl + E", mac: "" },
          ],
        },
      ],
    },
  },
  en: {
    form: {
      labels: {
        title: "Title",
        content: "Content",
      },
      placeholders: {
        title: "Enter the post title or the file name you will export...",
        content: "Start writing your content here...",
        imageCaption: "Add the image caption (optional)",
      },
      aria: {
        content: "Post content field",
      },
      modal: {
        cleared: "Content cleared!",
        noContent: "No content to export.",
        pdfSuccess: "PDF exported successfully!",
        pdfError: "We couldn't generate the PDF.",
        docSuccess: "Document exported successfully!",
        txtSuccess: "TXT file exported successfully!",
        draftSaved: "Draft saved!",
        draftLoaded: "Draft loaded!",
        draftDeleted: "Draft removed!",
      },
      defaults: {
        documentName: "Document",
        draftTitle: "Untitled",
      },
      preview: {
        heading: "PDF preview",
        closeAria: "Close PDF preview",
        iframeTitle: "PDF preview",
        close: "Close",
        download: "Download",
      },
      postPreview: {
        heading: "Post Preview",
        close: "Close Preview",
        viewHtml: "View Generated HTML",
        downloadHtml: "Download Generated HTML",
        blogPreview: "Blog Preview",
        htmlCode: "HTML Code",
      },
      loading: {
        label: "Generating PDF...",
        alt: "Generating PDF",
      },
      pdfLang: "en",
      dateLocale: "en-US",
    },
    shortcuts: {
      ariaLabel: "Keyboard shortcuts",
      eyebrow: "Keyboard shortcuts",
      description: "Quick commands to edit without leaving the keyboard.",
      windowsLabel: "Win / Linux",
      macLabel: "macOS",
      sections: [
        {
          id: "fundamentals",
          title: "Editing basics",
          shortcuts: [
            { command: "Copy", windows: "Ctrl + C", mac: "Cmd + C" },
            { command: "Cut", windows: "Ctrl + X", mac: "Cmd + X" },
            { command: "Paste", windows: "Ctrl + V", mac: "Cmd + V" },
            {
              command: "Paste without formatting",
              windows: "Ctrl + Shift + V",
              mac: "Cmd + Shift + V",
            },
            { command: "Undo", windows: "Ctrl + Z", mac: "Cmd + Z" },
            { command: "Redo", windows: "Ctrl + Shift + Z", mac: "Cmd + Shift + Z" },
            {
              command: "Insert line break",
              windows: "Shift + Enter",
              mac: "Shift + Enter",
            },
          ],
        },
        {
          id: "formatting",
          title: "Text formatting",
          shortcuts: [
            { command: "Bold", windows: "Ctrl + B", mac: "Cmd + B" },
            { command: "Italic", windows: "Ctrl + I", mac: "Cmd + I" },
            { command: "Underline", windows: "Ctrl + U", mac: "Cmd + U" },
            { command: "Strikethrough", windows: "Ctrl + Shift + S", mac: "Cmd + Shift + S" },
            { command: "Highlight", windows: "Ctrl + Shift + H", mac: "Cmd + Shift + H" },
            { command: "Inline code", windows: "Ctrl + E", mac: "" },
          ],
        },
      ],
    },
  },
  es: {
    form: {
      labels: {
        title: "Título",
        content: "Contenido",
      },
      placeholders: {
        title: "Escribe el título o el nombre del archivo que vas a exportar...",
        content: "Empieza a escribir tu contenido aquí...",
        imageCaption: "Agrega el pie de foto (opcional)",
      },
      aria: {
        content: "Campo de contenido de la publicación",
      },
      modal: {
        cleared: "¡Contenido borrado!",
        noContent: "No hay contenido para exportar.",
        pdfSuccess: "PDF exportado correctamente.",
        pdfError: "No se pudo generar el PDF.",
        docSuccess: "Documento exportado correctamente.",
        txtSuccess: "Archivo TXT exportado correctamente.",
        draftSaved: "Borrador guardado.",
        draftLoaded: "Borrador cargado.",
        draftDeleted: "Borrador eliminado.",
      },
      defaults: {
        documentName: "Documento",
        draftTitle: "Sin título",
      },
      preview: {
        heading: "Vista previa del PDF",
        closeAria: "Cerrar vista previa del PDF",
        iframeTitle: "Vista previa del PDF",
        close: "Cerrar",
        download: "Descargar",
      },
      postPreview: {
        heading: "Vista previa del Post",
        close: "Cerrar Vista Previa",
        viewHtml: "Ver HTML Generado",
        downloadHtml: "Descargar Contenido HTML Generado",
        blogPreview: "Vista Previa del Blog",
        htmlCode: "Código HTML",
      },
      loading: {
        label: "Generando PDF...",
        alt: "Generando PDF",
      },
      pdfLang: "es",
      dateLocale: "es-ES",
    },
    shortcuts: {
      ariaLabel: "Atajos de teclado",
      eyebrow: "Atajos de teclado",
      description: "Comandos rápidos para editar sin soltar el teclado.",
      windowsLabel: "Win / Linux",
      macLabel: "macOS",
      sections: [
        {
          id: "fundamentos",
          title: "Comandos básicos",
          shortcuts: [
            { command: "Copiar", windows: "Ctrl + C", mac: "Cmd + C" },
            { command: "Cortar", windows: "Ctrl + X", mac: "Cmd + X" },
            { command: "Pegar", windows: "Ctrl + V", mac: "Cmd + V" },
            {
              command: "Pegar sin formato",
              windows: "Ctrl + Shift + V",
              mac: "Cmd + Shift + V",
            },
            { command: "Deshacer", windows: "Ctrl + Z", mac: "Cmd + Z" },
            { command: "Rehacer", windows: "Ctrl + Shift + Z", mac: "Cmd + Shift + Z" },
            {
              command: "Insertar salto de línea",
              windows: "Shift + Enter",
              mac: "Shift + Enter",
            },
          ],
        },
        {
          id: "formato",
          title: "Formato de texto",
          shortcuts: [
            { command: "Negrita", windows: "Ctrl + B", mac: "Cmd + B" },
            { command: "Cursiva", windows: "Ctrl + I", mac: "Cmd + I" },
            { command: "Subrayado", windows: "Ctrl + U", mac: "Cmd + U" },
            { command: "Tachado", windows: "Ctrl + Shift + S", mac: "Cmd + Shift + S" },
            { command: "Resaltado", windows: "Ctrl + Shift + H", mac: "Cmd + Shift + H" },
            { command: "Código", windows: "Ctrl + E", mac: "" },
          ],
        },
      ],
    },
  },
};

export const getEditMessages = (locale?: Locale): EditPageMessages => {
  const normalized = locale && i18n.locales.includes(locale) ? locale : i18n.defaultLocale;
  return editMessages[normalized];
};
