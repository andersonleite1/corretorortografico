import { i18n, type Locale } from "../../../i18n-config";

export type CommonMessages = {
  mediaLibrary: {
    assets: string;
    loadingImages: string;
    uploading: string;
  };
  languageTool: {
    fix: string;
    categories: string;
    characters: string;
    words: string;
    readingTime: string;
    status: string;
    readySuggestions: string;
    fixAllTip: string;
    close: string;
  };
  sidebar: {
    noDocuments: string;
    refresh: string;
    errorLoadDocs: string;
    docDeleted: string;
    errorDeleteDoc: string;
    docLoaded: string;
  };
  drafts: {
    textAdded: string;
    textRemoved: string;
    noChanges: string;
    compareVersion: string;
  };
  header: {
    dashboard: string;
    appName: string;
    openMenu: string;
  };
  toc: {
    title: string;
  };
  footer: {
    secureImageAlt: string;
  };
  pricing: {
    free: string;
  };
  settings: {
    profile: string;
    title: string;
    browserChecker: string;
    placeholderTone: string;
    placeholderMaxChars: string;
    placeholderInstructions: string;
    errorProcess: string;
  };
  contact: {
    email: string;
  };
  auth: {
    emailPlaceholder: string;
  };
  documents: {
    galleryEmpty: string;
    quickLook: string;
    edit: string;
    delete: string;
    errorLoad: string;
    docDeletedLocal: string;
    docDeleted: string;
    errorDelete: string;
  };
  scrollToTop: {
    ariaLabel: string;
  };
  cookieConsent: {
    close: string;
  };
  bugReport: {
    close: string;
    placeholderTitle: string;
    placeholderDesc: string;
    success: string;
    error: string;
    ariaLabel: string;
  };
  landing: {
    heroAria: string;
    heroImageAlt: string;
    ctaAria: string;
  };
  editor: {
    reportBug: string;
    localLimitReached: string;
    saveError: string;
  };
  dashboard: {
    noData: string;
    noTone: string;
    startGreat: string;
    timeSaved: string;
    documents: string;
    rewritesToday: string;
    freeDailyQuota: string;
    planMonthlyQuota: string;
  };
};

const commonMessages: Record<Locale, CommonMessages> = {
  pt: {
    mediaLibrary: {
      assets: "Assets",
      loadingImages: "Carregando imagens",
      uploading: "Enviando...",
    },
    languageTool: {
      fix: "Corrigir",
      categories: "Categorias",
      characters: "Caracteres",
      words: "Palavras",
      readingTime: "Tempo de Leitura",
      status: "Status",
      readySuggestions: "Sugestões prontas",
      fixAllTip: "Corrija tudo de uma vez",
      close: "Fechar",
    },
    sidebar: {
      noDocuments: "Nenhum documento salvo.",
      refresh: "Atualizar",
      errorLoadDocs: "Erro ao carregar documentos",
      docDeleted: "Documento excluído",
      errorDeleteDoc: "Erro ao excluir documento",
      docLoaded: "Documento carregado",
    },
    drafts: {
      textAdded: "Texto Adicionado",
      textRemoved: "Texto Removido",
      noChanges: "Sem Alterações",
      compareVersion: "Comparar Versão",
    },
    header: {
      dashboard: "Dashboard",
      appName: "Editor de texto",
      openMenu: "Abrir Menu",
    },
    toc: {
      title: "Nesta página",
    },
    footer: {
      secureImageAlt: "Compra Segura SSL",
    },
    pricing: {
      free: "Grátis",
    },
    settings: {
      profile: "Seu Perfil",
      title: "Configurações",
      browserChecker: "Corretor do Navegador",
      placeholderTone: "Ex: Divertido, Técnico...",
      placeholderMaxChars: "Máximo 20 caracteres",
      placeholderInstructions: "Instruções para a IA",
      errorProcess: "Erro ao processar solicitação.",
    },
    contact: {
      email: "Email",
    },
    auth: {
      emailPlaceholder: "Ex: seuemail@exemplo.com",
    },
    documents: {
      galleryEmpty: "Sua galeria está vazia",
      quickLook: "Quick Look",
      edit: "Editar",
      delete: "Excluir",
      errorLoad: "Erro ao carregar documentos",
      docDeletedLocal: "Documento excluído (local)",
      docDeleted: "Documento excluído",
      errorDelete: "Erro ao excluir documento",
    },
    scrollToTop: {
      ariaLabel: "Voltar para o topo",
    },
    cookieConsent: {
      close: "Fechar",
    },
    bugReport: {
      close: "Fechar diálogo",
      placeholderTitle: "Ex: O botão de exportação não está funcionando",
      placeholderDesc: "Descreva os passos para reproduzir o problema...",
      success: "Relatório enviado com sucesso!",
      error: "Erro ao enviar relatório.",
      ariaLabel: "Reportar Problema",
    },
    landing: {
      heroAria: "Apresentação do editor de texto online",
      heroImageAlt:
        "Mockup de um MacBook Pro mostrando a interface do editor de texto online",
      ctaAria: "Chamada para ação final",
    },
    editor: {
      reportBug: "Reportar Problema",
      localLimitReached: "Limite de armazenamento local atingido",
      saveError: "Erro ao salvar o documento",
    },
    dashboard: {
      noData: "Sem dados para exibir",
      noTone: "Nenhum tom detectado",
      startGreat: "O início de algo grande",
      timeSaved: "Tempo Economizado",
      documents: "Documentos",
      rewritesToday: "Reescritas Hoje",
      freeDailyQuota: "Cota Diária Gratuita",
      planMonthlyQuota: "Cota Mensal do Plano",
    },
  },
  en: {
    mediaLibrary: {
      assets: "Assets",
      loadingImages: "Loading images",
      uploading: "Uploading...",
    },
    languageTool: {
      fix: "Fix",
      categories: "Categories",
      characters: "Characters",
      words: "Words",
      readingTime: "Reading Time",
      status: "Status",
      readySuggestions: "Ready suggestions",
      fixAllTip: "Fix all at once",
      close: "Close",
    },
    sidebar: {
      noDocuments: "No saved documents.",
      refresh: "Refresh",
      errorLoadDocs: "Error loading documents",
      docDeleted: "Document deleted",
      errorDeleteDoc: "Error deleting document",
      docLoaded: "Document loaded",
    },
    drafts: {
      textAdded: "Text Added",
      textRemoved: "Text Removed",
      noChanges: "No Changes",
      compareVersion: "Compare Version",
    },
    header: {
      dashboard: "Dashboard",
      appName: "Text editor",
      openMenu: "Open Menu",
    },
    toc: {
      title: "On this page",
    },
    footer: {
      secureImageAlt: "Secure Purchase SSL",
    },
    pricing: {
      free: "Free",
    },
    settings: {
      profile: "Your Profile",
      title: "Settings",
      browserChecker: "Browser Checker",
      placeholderTone: "Ex: Fun, Technical...",
      placeholderMaxChars: "Maximum 20 characters",
      placeholderInstructions: "AI Instructions",
      errorProcess: "Error processing request.",
    },
    contact: {
      email: "Email",
    },
    auth: {
      emailPlaceholder: "Ex: youremail@example.com",
    },
    documents: {
      galleryEmpty: "Your gallery is empty",
      quickLook: "Quick Look",
      edit: "Edit",
      delete: "Delete",
      errorLoad: "Error loading documents",
      docDeletedLocal: "Document deleted (local)",
      docDeleted: "Document deleted",
      errorDelete: "Error deleting document",
    },
    scrollToTop: {
      ariaLabel: "Back to top",
    },
    cookieConsent: {
      close: "Close",
    },
    bugReport: {
      close: "Close dialog",
      placeholderTitle: "Ex: The export button is not working",
      placeholderDesc: "Describe the steps to reproduce the problem...",
      success: "Report successfully sent!",
      error: "Error sending report.",
      ariaLabel: "Report Problem",
    },
    landing: {
      heroAria: "Online text editor presentation",
      heroImageAlt:
        "Mockup of a MacBook Pro showing the online text editor interface",
      ctaAria: "Final call to action",
    },
    editor: {
      reportBug: "Report Problem",
      localLimitReached: "Local storage limit reached",
      saveError: "Error saving document",
    },
    dashboard: {
      noData: "No data to display",
      noTone: "No tone detected",
      startGreat: "The start of something great",
      timeSaved: "Time Saved",
      documents: "Documents",
      rewritesToday: "Rewrites Today",
      freeDailyQuota: "Free Daily Quota",
      planMonthlyQuota: "Plan Monthly Quota",
    },
  },
  es: {
    mediaLibrary: {
      assets: "Activos",
      loadingImages: "Cargando imágenes",
      uploading: "Subiendo...",
    },
    languageTool: {
      fix: "Corregir",
      categories: "Categorías",
      characters: "Caracteres",
      words: "Palabras",
      readingTime: "Tiempo de Lectura",
      status: "Estado",
      readySuggestions: "Sugerencias listas",
      fixAllTip: "Corrige todo a la vez",
      close: "Cerrar",
    },
    sidebar: {
      noDocuments: "Ningún documento guardado.",
      refresh: "Actualizar",
      errorLoadDocs: "Error al cargar documentos",
      docDeleted: "Documento eliminado",
      errorDeleteDoc: "Error al eliminar documento",
      docLoaded: "Documento cargado",
    },
    drafts: {
      textAdded: "Texto Añadido",
      textRemoved: "Texto Eliminado",
      noChanges: "Sin Cambios",
      compareVersion: "Comparar Versión",
    },
    header: {
      dashboard: "Panel",
      appName: "Editor de texto",
      openMenu: "Abrir menú",
    },
    toc: {
      title: "En esta página",
    },
    footer: {
      secureImageAlt: "Compra Segura SSL",
    },
    pricing: {
      free: "Gratis",
    },
    settings: {
      profile: "Tu Perfil",
      title: "Configuración",
      browserChecker: "Corrector de Navegador",
      placeholderTone: "Ej: Divertido, Técnico...",
      placeholderMaxChars: "Máximo 20 caracteres",
      placeholderInstructions: "Instrucciones de IA",
      errorProcess: "Error al procesar la solicitud.",
    },
    contact: {
      email: "Correo",
    },
    auth: {
      emailPlaceholder: "Ej: tucorreo@ejemplo.com",
    },
    documents: {
      galleryEmpty: "Tu galería está vacía",
      quickLook: "Vista Rápida",
      edit: "Editar",
      delete: "Eliminar",
      errorLoad: "Error al cargar documentos",
      docDeletedLocal: "Documento eliminado (local)",
      docDeleted: "Documento eliminado",
      errorDelete: "Error al eliminar documento",
    },
    scrollToTop: {
      ariaLabel: "Volver arriba",
    },
    cookieConsent: {
      close: "Cerrar",
    },
    bugReport: {
      close: "Cerrar diálogo",
      placeholderTitle: "Ej: El botón de exportación no funciona",
      placeholderDesc: "Describe los pasos para reproducir el problema...",
      success: "¡Informe enviado con éxito!",
      error: "Error al enviar el informe.",
      ariaLabel: "Reportar Problema",
    },
    landing: {
      heroAria: "Presentación del editor de texto en línea",
      heroImageAlt:
        "Mockup de un MacBook Pro mostrando la interfaz del editor de texto en línea",
      ctaAria: "Llamado a la acción final",
    },
    editor: {
      reportBug: "Reportar Problema",
      localLimitReached: "Límite de almacenamiento local alcanzado",
      saveError: "Error al guardar el documento",
    },
    dashboard: {
      noData: "Sin datos para mostrar",
      noTone: "Ningún tono detectado",
      startGreat: "El inicio de algo grande",
      timeSaved: "Tiempo Ahorrado",
      documents: "Documentos",
      rewritesToday: "Reescrituras Hoy",
      freeDailyQuota: "Cuota Diaria Gratuita",
      planMonthlyQuota: "Cuota Mensual del Plan",
    },
  },
};

export const getCommonMessages = (locale?: Locale): CommonMessages => {
  const normalized =
    locale && i18n.locales.includes(locale) ? locale : i18n.defaultLocale;
  return commonMessages[normalized];
};
