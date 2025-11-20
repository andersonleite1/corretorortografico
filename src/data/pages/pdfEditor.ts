import { Metadata } from "next";

import { i18n, Locale } from "../../../i18n-config";

export type PdfEditorTimelineStep = {
  label: string;
  title: string;
  description: string;
};

export type PdfUsageTopic = {
  title: string;
  content: string;
};

export type PdfEditorContent = {
  locale: Locale;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    openGraphTitle?: string;
    openGraphDescription?: string;
    siteName: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
  };
  experienceHighlights: string[];
  steps: PdfEditorTimelineStep[];
  formPanel: {
    eyebrow: string;
    title: string;
    dropLabel: string;
    dropDescription: string;
    readyLabel: string;
    replaceFileLabel: string;
    cooldownLabel: string;
    statusMessages: {
      uploading: string;
      success: string;
    };
    errors: {
      invalidType: string;
      sizeLimit: string;
      noFile: string;
      cooldown: string;
      conversion: string;
    };
    buttons: {
      submit: string;
      submitting: string;
      back: string;
    };
  };
  secondarySection: {
    eyebrow: string;
    title: string;
    description: string;
  };
  usageTopics: PdfUsageTopic[];
  bestPractices: {
    title: string;
    items: string[];
    description: string;
  };
  defaultDocumentTitle: string;
};

const pdfEditorContentMap: Record<Locale, PdfEditorContent> = {
  pt: {
    locale: "pt",
    metadata: {
      title: "Editar PDF Online | Editor gratuito para converter e gerenciar arquivos",
      description:
        "Envie um PDF, converta para HTML e continue no editor de PDF gratuito do EditorDeTexto.online. Controle de envios a cada 3 minutos, ideal para editar contratos, propostas e catálogos sem instalar nada.",
      keywords: ["editar PDF online", "editor de PDF gratuito", "ferramenta para editar PDF", "converter e gerenciar arquivos PDF"],
      openGraphTitle: "Editar PDF Online | Editor gratuito para converter e gerenciar arquivos",
      openGraphDescription:
        "Ferramenta para editar PDF que limita o envio a cada 3 minutos, converte para HTML e abre automaticamente no editor principal para ajustes rápidos.",
      siteName: "EditorDeTexto.online",
    },
    hero: {
      eyebrow: "Conversão guiada",
      title: "Editar PDF online ficou simples e totalmente gratuito",
      description:
        "Esta ferramenta para editar PDF transforma seus uploads em HTML editável e abre tudo no editor principal do EditorDeTexto.online. Ao respeitar o limite de um envio a cada três minutos, garantimos estabilidade para quem precisa converter e gerenciar arquivos PDF sem perder o visual original.",
    },
    experienceHighlights: [
      "Conversão preserva hierarquia de títulos",
      "Listas, links e tabelas continuam editáveis",
      "Conteúdo já abre na Home para ajustes finais",
      "Envio controlado a cada 3 minutos para estabilidade",
    ],
    steps: [
      {
        label: "Passo 1",
        title: "Envie seu PDF",
        description: "Arquivos organizados garantem HTML limpo.",
      },
      {
        label: "Passo 2",
        title: "Convertendo",
        description: "Em segundos tudo vira conteúdo editável.",
      },
      {
        label: "Passo 3",
        title: "Continue na Home",
        description: "O texto aparece automaticamente no editor.",
      },
    ],
    formPanel: {
      eyebrow: "Upload rápido e seguro",
      title: "Converter PDF para HTML",
      dropLabel: "Arraste seu PDF ou clique para selecionar",
      dropDescription: "Aceitamos arquivos até {{size}}MB",
      readyLabel: "Pronto para converter",
      replaceFileLabel: "Trocar arquivo",
      cooldownLabel: "Próximo envio liberado em",
      statusMessages: {
        uploading: "Enviando PDF para conversão...",
        success: "Conversão concluída! Abrindo o editor...",
      },
      errors: {
        invalidType: "Selecione um arquivo no formato PDF.",
        sizeLimit: "Limite de {{size}}MB por arquivo.",
        noFile: "Escolha um PDF para começar.",
        cooldown: "Aguarde {{time}} para enviar outro PDF.",
        conversion: "Não foi possível converter seu PDF. Tente novamente.",
      },
      buttons: {
        submit: "Converter e abrir no editor",
        submitting: "Convertendo...",
        back: "Voltar para a Home",
      },
    },
    secondarySection: {
      eyebrow: "Dicas práticas",
      title: "Gerencie e edite PDFs com tranquilidade",
      description:
        "O conversor de PDF para HTML do EditorDeTexto.online ajuda equipes a agilizar atualizações de contratos, catálogos, editais e materiais educacionais. Após o upload, o texto surge imediatamente no editor de PDF gratuito para você ajustar, colaborar e publicar em qualquer canal digital.",
    },
    usageTopics: [
      {
        title: "Por que converter PDF para HTML editável?",
        content:
          "Documentos em PDF são ótimos para distribuição, mas difíceis de atualizar. Ao transformar o arquivo em HTML você ganha flexibilidade para revisar textos, ajustar mensagens e publicar em sites ou intranets sem começar do zero — o jeito mais simples de editar PDF online.",
      },
      {
        title: "Fluxo seguro e rápido",
        content:
          "Seu arquivo trafega apenas entre o seu navegador e nossa API protegida por token. Em poucos segundos o texto já é salvo localmente e carregado no editor de PDF gratuito do EditorDeTexto.online para revisão completa, evitando cadastros ou instalações.",
      },
      {
        title: "Formatação preservada e experiência fluida",
        content:
          "Depois da conversão você pode ajustar títulos, links e chamadas de ação no próprio editor. Isso reduz tempo de produção e mantém consistência visual em materiais como manuais, contratos, relatórios e e-books — perfeito para converter e gerenciar arquivos PDF sem retrabalho.",
      },
    ],
    bestPractices: {
      title: "Melhores práticas de edição online",
      items: [
        "Heading tags bem distribuídas tornam o texto mais legível e fácil de navegar em qualquer dispositivo.",
        "Adicione CTAs claros e links internos diretamente no editor.",
        "A conversão preserva textos alternativos para imagens.",
        "HTML limpo garante carregamento rápido e melhor acessibilidade.",
      ],
      description:
        "Use esta página sempre que precisar adaptar materiais corporativos, apostilas ou catálogos para campanhas digitais. Quanto mais atualizados estiverem os textos, mais fácil será manter uma comunicação consistente em newsletters, blogs e redes sociais usando uma verdadeira ferramenta para editar PDF direto no navegador.",
    },
    defaultDocumentTitle: "Documento convertido",
  },
  en: {
    locale: "en",
    metadata: {
      title: "Edit PDF Online | Free editor to convert and update files",
      description:
        "Upload a PDF, convert it to HTML, and keep editing inside the Online Text Editor. We limit submissions every 3 minutes to guarantee stability while you polish contracts, proposals, or catalogs without installing software.",
      keywords: ["edit PDF online", "free PDF editor", "PDF conversion tool", "manage PDF files"],
      openGraphTitle: "Edit PDF Online | Free editor to convert and update files",
      openGraphDescription:
        "A fast PDF editor that converts uploads into HTML, enforces a 3-minute cooldown for reliability, and opens the result right in the main editor for quick adjustments.",
      siteName: "Online Text Editor",
    },
    hero: {
      eyebrow: "Guided conversion",
      title: "Editing PDFs online is now simple and completely free",
      description:
        "This PDF tool turns your uploads into editable HTML and opens everything in the main Online Text Editor. By limiting submissions to once every three minutes we keep the experience stable for anyone who needs to convert and manage PDF files without losing the original visual style.",
    },
    experienceHighlights: [
      "Conversion keeps heading hierarchy",
      "Lists, links, and tables stay editable",
      "Content instantly opens on the home editor",
      "3-minute cooldown for a stable workflow",
    ],
    steps: [
      {
        label: "Step 1",
        title: "Upload your PDF",
        description: "Well-organized files generate cleaner HTML.",
      },
      {
        label: "Step 2",
        title: "Converting",
        description: "In seconds everything becomes editable content.",
      },
      {
        label: "Step 3",
        title: "Continue on Home",
        description: "The text automatically loads in the editor.",
      },
    ],
    formPanel: {
      eyebrow: "Fast and secure upload",
      title: "Convert PDF to HTML",
      dropLabel: "Drag your PDF or click to select",
      dropDescription: "We accept files up to {{size}}MB",
      readyLabel: "Ready to convert",
      replaceFileLabel: "Choose another file",
      cooldownLabel: "Next upload available in",
      statusMessages: {
        uploading: "Uploading PDF for conversion...",
        success: "Conversion complete! Opening the editor...",
      },
      errors: {
        invalidType: "Please select a PDF file.",
        sizeLimit: "Limit of {{size}}MB per file.",
        noFile: "Choose a PDF to start.",
        cooldown: "Please wait {{time}} before sending another PDF.",
        conversion: "We couldn't convert your PDF. Try again.",
      },
      buttons: {
        submit: "Convert and open in the editor",
        submitting: "Converting...",
        back: "Back to Home",
      },
    },
    secondarySection: {
      eyebrow: "Practical tips",
      title: "Manage and edit PDFs with confidence",
      description:
        "The Online Text Editor PDF-to-HTML converter helps teams update contracts, catalogs, tenders, and study materials faster. Right after the upload, the text appears inside the free PDF editor so you can adjust, collaborate, and publish to any digital channel.",
    },
    usageTopics: [
      {
        title: "Why convert PDF to editable HTML?",
        content:
          "PDFs are great for distribution but painful to update. Turning them into HTML gives you the flexibility to review copy, tweak calls to action, and publish on sites or intranets without starting from scratch — the easiest way to edit a PDF online.",
      },
      {
        title: "Secure and fast workflow",
        content:
          "Your file moves only between the browser and our token-protected API. In a few seconds the text is stored locally and loaded into the free PDF editor for a complete review, no logins or installations required.",
      },
      {
        title: "Formatting preserved, smoother experience",
        content:
          "After conversion you can fine-tune headings, links, and CTAs right inside the editor. It cuts production time and keeps visual consistency across manuals, contracts, reports, and e-books — perfect for converting and managing PDF files without rework.",
      },
    ],
    bestPractices: {
      title: "Online editing best practices",
      items: [
        "Well-distributed heading tags make the text easier to read on any device.",
        "Add clear CTAs and internal links directly in the editor.",
        "Conversion preserves alternative text for images.",
        "Clean HTML keeps pages fast and accessible.",
      ],
      description:
        "Use this page whenever you need to adapt corporate materials, study guides, or catalogs for digital campaigns. The more up-to-date the text, the easier it is to keep newsletters, blogs, and social media aligned using a true PDF editor in the browser.",
    },
    defaultDocumentTitle: "Converted document",
  },
  es: {
    locale: "es",
    metadata: {
      title: "Editar PDF en línea | Editor gratuito para convertir y actualizar archivos",
      description:
        "Sube un PDF, conviértelo a HTML y continúa la edición en EditorDeTexto.online. Limitamos los envíos a cada 3 minutos para garantizar estabilidad mientras ajustas contratos, propuestas o catálogos sin instalar programas.",
      keywords: ["editar PDF en línea", "editor de PDF gratuito", "herramienta para convertir PDF", "gestionar archivos PDF"],
      openGraphTitle: "Editar PDF en línea | Editor gratuito para convertir y actualizar archivos",
      openGraphDescription:
        "Una herramienta para editar PDF que convierte los archivos a HTML, aplica un intervalo de 3 minutos para mayor estabilidad y abre todo directamente en el editor principal para ajustes rápidos.",
      siteName: "Editor de Texto en Línea",
    },
    hero: {
      eyebrow: "Conversión guiada",
      title: "Editar PDF en línea ahora es sencillo y completamente gratis",
      description:
        "Esta herramienta transforma tus PDFs en HTML editable y abre el contenido en el editor principal de EditorDeTexto.online. Al limitar los envíos a uno cada tres minutos mantenemos la estabilidad para quienes necesitan convertir y gestionar PDF sin perder el estilo original.",
    },
    experienceHighlights: [
      "La conversión preserva la jerarquía de títulos",
      "Listas, enlaces y tablas quedan editables",
      "El contenido se abre en la Home para ajustes finales",
      "Envío controlado cada 3 minutos para más estabilidad",
    ],
    steps: [
      {
        label: "Paso 1",
        title: "Sube tu PDF",
        description: "Archivos organizados generan un HTML limpio.",
      },
      {
        label: "Paso 2",
        title: "Convirtiendo",
        description: "En segundos todo se vuelve contenido editable.",
      },
      {
        label: "Paso 3",
        title: "Continúa en Home",
        description: "El texto aparece automáticamente en el editor.",
      },
    ],
    formPanel: {
      eyebrow: "Carga rápida y segura",
      title: "Convertir PDF a HTML",
      dropLabel: "Arrastra tu PDF o haz clic para seleccionar",
      dropDescription: "Aceptamos archivos de hasta {{size}}MB",
      readyLabel: "Listo para convertir",
      replaceFileLabel: "Cambiar archivo",
      cooldownLabel: "Próximo envío disponible en",
      statusMessages: {
        uploading: "Enviando el PDF para conversión...",
        success: "¡Conversión lista! Abriendo el editor...",
      },
      errors: {
        invalidType: "Selecciona un archivo en formato PDF.",
        sizeLimit: "Límite de {{size}}MB por archivo.",
        noFile: "Elige un PDF para comenzar.",
        cooldown: "Espera {{time}} antes de enviar otro PDF.",
        conversion: "No pudimos convertir tu PDF. Intenta nuevamente.",
      },
      buttons: {
        submit: "Convertir y abrir en el editor",
        submitting: "Convirtiendo...",
        back: "Volver al inicio",
      },
    },
    secondarySection: {
      eyebrow: "Consejos prácticos",
      title: "Gestiona y edita PDFs con tranquilidad",
      description:
        "El convertidor de PDF a HTML de EditorDeTexto.online ayuda a los equipos a acelerar la actualización de contratos, catálogos, licitaciones y materiales educativos. Tras la carga, el texto aparece de inmediato en el editor gratuito para ajustar, colaborar y publicar en cualquier canal digital.",
    },
    usageTopics: [
      {
        title: "¿Por qué convertir PDF a HTML editable?",
        content:
          "Los PDFs son excelentes para distribuir, pero difíciles de actualizar. Al convertirlos en HTML obtienes flexibilidad para revisar textos, ajustar mensajes y publicar en sitios o intranets sin comenzar desde cero: es la forma más sencilla de editar un PDF en línea.",
      },
      {
        title: "Flujo seguro y veloz",
        content:
          "Tu archivo viaja solo entre el navegador y nuestra API protegida por token. En segundos el texto se guarda localmente y se abre en el editor gratuito para una revisión completa, sin registros ni instalaciones.",
      },
      {
        title: "Formato preservado y experiencia fluida",
        content:
          "Después de la conversión puedes ajustar títulos, enlaces y llamadas a la acción directamente en el editor. Reducimos el tiempo de producción y mantenemos la consistencia visual en manuales, contratos, informes y e-books, perfecto para convertir y gestionar PDFs sin retrabajo.",
      },
    ],
    bestPractices: {
      title: "Mejores prácticas de edición en línea",
      items: [
        "Una buena distribución de heading tags mejora la lectura en cualquier dispositivo.",
        "Agrega CTAs claros y enlaces internos directamente en el editor.",
        "La conversión mantiene los textos alternativos de las imágenes.",
        "Un HTML limpio garantiza carga rápida y mejor accesibilidad.",
      ],
      description:
        "Usa esta página siempre que necesites adaptar materiales corporativos, guías de estudio o catálogos para campañas digitales. Cuanto más actualizados estén los textos, más fácil será mantener una comunicación consistente en newsletters, blogs y redes sociales usando un editor de PDF real en el navegador.",
    },
    defaultDocumentTitle: "Documento convertido",
  },
};

export function getPdfEditorContent(locale: string): PdfEditorContent {
  const normalized = (locale ?? i18n.defaultLocale) as Locale;
  if (pdfEditorContentMap[normalized]) {
    return pdfEditorContentMap[normalized];
  }

  return pdfEditorContentMap[i18n.defaultLocale];
}

export function buildPdfEditorMetadata(locale: string): Metadata {
  const content = getPdfEditorContent(locale);
  const normalized = i18n.locales.includes(locale as Locale) ? (locale as Locale) : i18n.defaultLocale;
  const path = normalized === i18n.defaultLocale ? "/editar-pdf" : `/${normalized}/editar-pdf`;
  return {
    title: content.metadata.title,
    description: content.metadata.description,
    keywords: content.metadata.keywords,
    openGraph: {
      title: content.metadata.openGraphTitle ?? content.metadata.title,
      description: content.metadata.openGraphDescription ?? content.metadata.description,
      url: `https://editordetexto.online${path}`,
      siteName: content.metadata.siteName,
    },
  };
}
