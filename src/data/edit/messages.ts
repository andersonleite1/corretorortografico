import { i18n, type Locale } from "../../../i18n-config";

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
    };
    defaults: {
      documentName: string;
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
};

const editMessages: Record<Locale, EditPageMessages> = {
  pt: {
    form: {
      labels: {
        title: "Título",
        content: "Conteúdo",
      },
      placeholders: {
        title:
          "Digite o título da postagem ou nome do arquivo que será exportado...",
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
      },
      defaults: {
        documentName: "Documento",
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
      },
      defaults: {
        documentName: "Document",
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
  },
  es: {
    form: {
      labels: {
        title: "Título",
        content: "Contenido",
      },
      placeholders: {
        title:
          "Escribe el título o el nombre del archivo que vas a exportar...",
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
      },
      defaults: {
        documentName: "Documento",
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
  },
};

export const getEditMessages = (locale?: Locale): EditPageMessages => {
  const normalized =
    locale && i18n.locales.includes(locale) ? locale : i18n.defaultLocale;
  return editMessages[normalized];
};
