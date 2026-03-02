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
    noErrorsFound: string;
    fixAllTip: string;
    fixAll: string;
    close: string;
    summary: string;
    detailedData: string;
    spelling: string;
    grammar: string;
    stylePunctuation: string;
    quickTip: string;
    quickTipDesc: string;
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
    subscription: string;
    manageInfo: string;
    planBilling: string;
    manageBilling: string;
    active: string;
    freePlanDesc: string;
    planActiveDesc: string;
    makeUpgrade: string;
    loading: string;
    manageSub: string;
    nextRenewal: string;
    notInformed: string;
    title: string;
    placeholderTone: string;
    placeholderMaxChars: string;
    placeholderInstructions: string;
    errorProcess: string;
    tabs: {
      tones: string;
      toolbar: string;
      general: string;
    };
    done: string;
    tonesTitle: string;
    tonesDesc: string;
    toolbarTitle: string;
    toolbarDesc: string;
    generalTitle: string;
    generalDesc: string;
    footerDisplay: string;
    browserSpellcheck: string;
    browserSpellcheckDesc: string;
    createToneTitle: string;
    nameLabel: string;
    descLabel: string;
    instructionsLabel: string;
    cancel: string;
    create: string;
    newTone: string;
    proOnly: string;
    registerCustom: string;
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
    title: string;
    close: string;
    placeholderTitle: string;
    placeholderDesc: string;
    success: string;
    error: string;
    ariaLabel: string;
    cancel: string;
    send: string;
    sending: string;
    descriptionLabel: string;
    additionalInfoLabel: string;
    notificationLabel: string;
    emailLabel: string;
    successTitle: string;
    successDesc: string;
    understood: string;
    technicalInfo: string;
    validationDescEmpty: string;
    validationDescShort: string;
    validationEmailEmpty: string;
    validationEmailInvalid: string;
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
    aiRewrite: string;
    chooseTone: string;
    allText: string;
    noToneAvail: string;
    defaultTones: string;
    yourTones: string;
    aiSuggestion: string;
    accept: string;
    discard: string;
    generating: string;
    rewriteTooltip: string;
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
    welcomeBack: string;
    newDocument: string;
    settings: string;
    timeSavedTotal: string;
    docsSavedCloud: string;
    freeLimit: string;
    usedToday: string;
    usedMonth: string;
    productivityEvol: string;
    timeSaved30: string;
    preferences: string;
    topTones: string;
    quickAccess: string;
    recentDocs: string;
    seeAll: string;
    freePlan: string;
    unlockPro: string;
    unlimitedDocs: string;
    seePlans: string;
    noRewrites: string;
    noTones: string;
    noTonesDesc: string;
    recentDocsDesc: string;
    untitled: string;
    upgradePro: string;
  };
  tones: Record<string, { label: string; desc: string }>;
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
      noErrorsFound: "Nenhum erro encontrado. Bom trabalho!",
      fixAllTip: "Corrija tudo de uma vez",
      fixAll: "Corrigir todos",
      close: "Fechar",
      summary: "Resumo",
      detailedData: "Dados detalhados",
      spelling: "Ortografia",
      grammar: "Gramática",
      stylePunctuation: "Estilo/Pontuação",
      quickTip: "DICA RÁPIDA",
      quickTipDesc:
        "Aplica a primeira sugestão de cada erro detectado automaticamente.",
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
      subscription: "Assinatura",
      manageInfo: "Gerencie suas informações básicas.",
      planBilling: "Plano e Pagamento",
      manageBilling: "Gerencie sua assinatura e faturamento.",
      active: "Ativo",
      freePlanDesc: "Você está no plano gratuito.",
      planActiveDesc: "Sua assinatura está ativa.",
      makeUpgrade: "Fazer Upgrade",
      loading: "Carregando...",
      manageSub: "Gerenciar Assinatura",
      nextRenewal: "Próxima renovação em:",
      notInformed: "Não informado",
      title: "Configurações",
      placeholderTone: "Ex: Divertido, Técnico...",
      placeholderMaxChars: "Máximo 20 caracteres",
      placeholderInstructions: "Instruções para a IA",
      errorProcess: "Erro ao processar solicitação.",
      tabs: {
        tones: "Tons de IA",
        toolbar: "Barra de Ferramentas",
        general: "Configurações Gerais",
      },
      done: "Concluído",
      tonesTitle: "Opções de Tom e Estilo",
      tonesDesc: "Ative os tons que você deseja usar com a reescrita por IA.",
      toolbarTitle: "Barra de Ferramentas",
      toolbarDesc:
        "Selecione quais botões você deseja exibir no cabeçalho do editor.",
      generalTitle: "Configurações Gerais",
      generalDesc: "Ajustes de interface e correções automáticas.",
      footerDisplay: "Exibição do rodapé do editor",
      browserSpellcheck: "Corretor do Navegador",
      browserSpellcheckDesc:
        "Utilizar revisor ortográfico nativo do navegador.",
      createToneTitle: "Cadastrar tom personalizado",
      nameLabel: "Nome",
      descLabel: "Descrição Curta",
      instructionsLabel: "Instruções para a IA",
      cancel: "Cancelar",
      create: "Criar Tom",
      newTone: "Novo Tom",
      proOnly: "Disponível apenas no plano Pro",
      registerCustom: "Cadastrar tom personalizado",
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
      title: "Reportar Problema",
      close: "Fechar diálogo",
      placeholderTitle: "Ex: O botão de exportação não está funcionando",
      placeholderDesc: "Descreva os passos para reproduzir o problema...",
      success: "Relatório enviado com sucesso!",
      error: "Erro ao enviar relatório.",
      ariaLabel: "Reportar Problema",
      cancel: "Cancelar",
      send: "Enviar Relatório",
      sending: "Enviando...",
      descriptionLabel: "Descrição breve",
      additionalInfoLabel: "Informações adicionais (opcional)",
      notificationLabel: "Receber notificações por e-mail",
      emailLabel: "Seu e-mail",
      successTitle: "Obrigado pelo reporte!",
      successDesc:
        "Seu relatório foi enviado para nossa equipe técnica. Juntos estamos construindo um editor melhor.",
      understood: "Entendido",
      technicalInfo:
        "Dados técnicos anônimos serão anexados automaticamente para ajudar nossa equipe a reproduzir e corrigir o erro.",
      validationDescEmpty: "Por favor, descreva o problema brevemente.",
      validationDescShort: "A descrição deve ter pelo menos 10 caracteres.",
      validationEmailEmpty: "Informe seu e-mail para receber a notificação.",
      validationEmailInvalid: "Informe um e-mail válido.",
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
      aiRewrite: "Reescrever IA",
      chooseTone: "Escolha o tom",
      allText: "Todo o texto",
      noToneAvail: "Nenhum tom disponível ou selecionado.",
      defaultTones: "Tons Padrão",
      yourTones: "Seus Tons",
      aiSuggestion: "Sugestão da IA",
      accept: "Aceitar",
      discard: "Descartar",
      generating: "Gerando sugestão...",
      rewriteTooltip:
        "Faça login ou registre-se no site para acessar o recurso de reescrita assistida por IA.",
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
      welcomeBack: "Bem-vindo de volta",
      newDocument: "Novo Documento",
      settings: "Configurações",
      timeSavedTotal: "no total com ajuda da IA",
      docsSavedCloud: "documentos salvos na nuvem",
      freeLimit: "gratuitas (plano",
      usedToday: "utilizadas hoje",
      usedMonth: "utilizadas este mês",
      productivityEvol: "Evolução de Produtividade",
      timeSaved30: "Tempo Economizado — Últimos 30 Dias",
      preferences: "Preferências",
      topTones: "Tons Mais Utilizados",
      quickAccess: "Acesso Rápido",
      recentDocs: "Documentos Recentes",
      seeAll: "Ver todos",
      freePlan: "Plano Gratuito",
      unlockPro: "Desbloqueie 500 reescritas/mês com o Pro",
      unlimitedDocs: "Documentos ilimitados, todos os tons de IA e muito mais.",
      seePlans: "Ver Planos",
      noRewrites:
        "Nenhuma reescrita registrada ainda. Use a IA no editor para ver sua evolução aqui!",
      noTones: "Nenhum tom detectado",
      noTonesDesc:
        "Seu estilo de escrita aparecerá aqui conforme você edita e usa diferentes tons de IA.",
      recentDocsDesc:
        "Seus documentos recentes aparecerão aqui. Comece um novo projeto agora!",
      untitled: "Sem título",
      upgradePro: "Upgrade para Pro",
    },
    tones: {
      formal: { label: "FORMAL", desc: "Profissional e sério" },
      casual: { label: "CASUAL", desc: "Descontraído e informal" },
      academic: { label: "ACADÊMICO", desc: "Erudito e estruturado" },
      creative: { label: "CRIATIVO", desc: "Original e imaginativo" },
      simplified: { label: "SIMPLIFICADO", desc: "Simples e direto" },
      romantic: { label: "ROMÂNTICO", desc: "Emotivo e apaixonado" },
      narrative: { label: "NARRATIVO", desc: "Para contar histórias" },
      instagram: { label: "INSTAGRAM", desc: "Estilo social e envolvente" },
      whatsapp: { label: "WHATSAPP", desc: "Direto e conversacional" },
      tweet: { label: "TWEET", desc: "Conciso e impactante" },
      professional: { label: "PROFISSIONAL", desc: "Focado em negócios" },
      persuasive: { label: "PERSUASIVO", desc: "Convincente e focado" },
      friendly: { label: "AMIGÁVEL", desc: "Acolhedor e gentil" },
      prompt: { label: "Prompt IA", desc: "Dedicado a agentes LLM" },
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
      noErrorsFound: "No errors found. Good job!",
      fixAllTip: "Fix all at once",
      fixAll: "Fix all",
      close: "Close",
      summary: "Summary",
      detailedData: "Detailed data",
      spelling: "Spelling",
      grammar: "Grammar",
      stylePunctuation: "Style/Punctuation",
      quickTip: "QUICK TIP",
      quickTipDesc:
        "Automatically applies the first suggestion for each detected error.",
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
      subscription: "Subscription",
      manageInfo: "Manage your basic information.",
      planBilling: "Plan and Billing",
      manageBilling: "Manage your subscription and billing.",
      active: "Active",
      freePlanDesc: "You are on the free plan.",
      planActiveDesc: "Your subscription is active.",
      makeUpgrade: "Upgrade Now",
      loading: "Loading...",
      manageSub: "Manage Subscription",
      nextRenewal: "Next renewal on:",
      notInformed: "Not informed",
      title: "Settings",
      placeholderTone: "Ex: Fun, Technical...",
      placeholderMaxChars: "Maximum 20 characters",
      placeholderInstructions: "AI Instructions",
      errorProcess: "Error processing request.",
      tabs: {
        tones: "AI Tones",
        toolbar: "Toolbar",
        general: "General Settings",
      },
      done: "Done",
      tonesTitle: "Tone and Style Options",
      tonesDesc: "Activate the tones you want to use with AI rewriting.",
      toolbarTitle: "Toolbar",
      toolbarDesc:
        "Select which buttons you want to display in the editor header.",
      generalTitle: "General Settings",
      generalDesc: "Interface adjustments and automatic corrections.",
      footerDisplay: "Editor footer display",
      browserSpellcheck: "Browser Checker",
      browserSpellcheckDesc: "Use current native browser spell checker.",
      createToneTitle: "Register custom tone",
      nameLabel: "Name",
      descLabel: "Short Description",
      instructionsLabel: "Instructions for AI",
      cancel: "Cancel",
      create: "Create Tone",
      newTone: "New Tone",
      proOnly: "Available only in Pro plan",
      registerCustom: "Register custom tone",
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
      title: "Report Problem",
      close: "Close dialog",
      placeholderTitle: "Ex: The export button is not working",
      placeholderDesc: "Describe the steps to reproduce the problem...",
      success: "Report successfully sent!",
      error: "Error sending report.",
      ariaLabel: "Report Problem",
      cancel: "Cancel",
      send: "Send Report",
      sending: "Sending...",
      descriptionLabel: "Brief description",
      additionalInfoLabel: "Additional info (optional)",
      notificationLabel: "Receive email notifications",
      emailLabel: "Your email",
      successTitle: "Thanks for the report!",
      successDesc:
        "Your report has been sent to our technical team. Together we are building a better editor.",
      understood: "Understood",
      technicalInfo:
        "Anonymous technical data will be attached automatically to help our team reproduce and fix the error.",
      validationDescEmpty: "Please describe the problem briefly.",
      validationDescShort: "Description must be at least 10 characters long.",
      validationEmailEmpty:
        "Please provide your email to receive notifications.",
      validationEmailInvalid: "Please provide a valid email.",
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
      aiRewrite: "AI Rewrite",
      chooseTone: "Choose tone",
      allText: "All text",
      noToneAvail: "No tones available or selected.",
      defaultTones: "Default Tones",
      yourTones: "Your Tones",
      aiSuggestion: "AI Suggestion",
      accept: "Accept",
      discard: "Discard",
      generating: "Generating suggestion...",
      rewriteTooltip:
        "Please log in or register to access the AI-assisted rewriting feature.",
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
      welcomeBack: "Welcome back",
      newDocument: "New Document",
      settings: "Settings",
      timeSavedTotal: "in total with AI help",
      docsSavedCloud: "documents saved in the cloud",
      freeLimit: "free (plan",
      usedToday: "used today",
      usedMonth: "used this month",
      productivityEvol: "Productivity Evolution",
      timeSaved30: "Time Saved — Last 30 Days",
      preferences: "Preferences",
      topTones: "Most Used Tones",
      quickAccess: "Quick Access",
      recentDocs: "Recent Documents",
      seeAll: "See all",
      freePlan: "Free Plan",
      unlockPro: "Unlock 500 rewrites/month with Pro",
      unlimitedDocs: "Unlimited documents, all AI tones and much more.",
      seePlans: "See Plans",
      noRewrites:
        "No rewrites registered yet. Use AI in the editor to see your progress here!",
      noTones: "No tone detected",
      noTonesDesc:
        "Your writing style will appear here as you edit and use different AI tones.",
      recentDocsDesc:
        "Your recent documents will appear here. Start a new project now!",
      untitled: "Untitled",
      upgradePro: "Upgrade to Pro",
    },
    tones: {
      formal: { label: "FORMAL", desc: "Professional and serious" },
      casual: { label: "CASUAL", desc: "Relaxed and informal" },
      academic: { label: "ACADEMIC", desc: "Scholarly and structured" },
      creative: { label: "CREATIVE", desc: "Original and imaginative" },
      simplified: { label: "SIMPLIFIED", desc: "Simple and direct" },
      romantic: { label: "ROMANTIC", desc: "Emotional and passionate" },
      narrative: { label: "NARRATIVE", desc: "To tell stories" },
      instagram: { label: "INSTAGRAM", desc: "Social and engaging style" },
      whatsapp: { label: "WHATSAPP", desc: "Direct and conversational" },
      tweet: { label: "TWEET", desc: "Concise and impact" },
      professional: { label: "PROFESSIONAL", desc: "Focused on business" },
      persuasive: { label: "PERSUASIVE", desc: "Convincing and focused" },
      friendly: { label: "FRIENDLY", desc: "Warm and kind" },
      prompt: { label: "AI Prompt", desc: "Dedicated to LLM agents" },
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
      noErrorsFound: "No se encontraron errores. ¡Buen trabajo!",
      fixAllTip: "Corrige todo a la vez",
      fixAll: "Corregir todos",
      close: "Cerrar",
      summary: "Resumen",
      detailedData: "Datos detallados",
      spelling: "Ortografía",
      grammar: "Gramática",
      stylePunctuation: "Estilo/Puntuación",
      quickTip: "CONSEJO RÁPIDO",
      quickTipDesc:
        "Aplica automáticamente la primera sugerencia para cada error detectado.",
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
      subscription: "Suscripción",
      manageInfo: "Gestiona tu información básica.",
      planBilling: "Plan y Pago",
      manageBilling: "Gestiona tu suscripción y facturación.",
      active: "Activo",
      freePlanDesc: "Estás en el plan gratuito.",
      planActiveDesc: "Tu suscripción está activa.",
      makeUpgrade: "Hacer Upgrade",
      loading: "Cargando...",
      manageSub: "Gestionar Suscripción",
      nextRenewal: "Próxima renovación el:",
      notInformed: "No informado",
      title: "Configuración",
      placeholderTone: "Ej: Divertido, Técnico...",
      placeholderMaxChars: "Máximo 20 caracteres",
      placeholderInstructions: "Instrucciones de IA",
      errorProcess: "Error al procesar la solicitud.",
      tabs: {
        tones: "Tonos de IA",
        toolbar: "Barra de Herramientas",
        general: "Configuración General",
      },
      done: "Hecho",
      tonesTitle: "Opciones de Tono y Estilo",
      tonesDesc: "Activa los tonos que quieras usar con la reescritura de IA.",
      toolbarTitle: "Barra de Herramientas",
      toolbarDesc:
        "Selecciona qué botones quieres mostrar en el encabezado del editor.",
      generalTitle: "Configuración General",
      generalDesc: "Ajustes de interfaz e correcciones automáticas.",
      footerDisplay: "Visualización del pie de página del editor",
      browserSpellcheck: "Corrector de Navegador",
      browserSpellcheckDesc:
        "Usar el corrector ortográfico nativo del navegador.",
      createToneTitle: "Registrar tono personalizado",
      nameLabel: "Nombre",
      descLabel: "Descripción Corta",
      instructionsLabel: "Instrucciones para la IA",
      cancel: "Cancelar",
      create: "Crear Tono",
      newTone: "Nuevo Tono",
      proOnly: "Disponible solo en el plan Pro",
      registerCustom: "Registrar tono personalizado",
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
      title: "Reportar Problema",
      close: "Cerrar diálogo",
      placeholderTitle: "Ej: El botón de exportación no funciona",
      placeholderDesc: "Describe los pasos para reproducir el problema...",
      success: "¡Informe enviado con éxito!",
      error: "Error al enviar el informe.",
      ariaLabel: "Reportar Problema",
      cancel: "Cancelar",
      send: "Enviar Informe",
      sending: "Enviando...",
      descriptionLabel: "Descripción breve",
      additionalInfoLabel: "Información adicional (opcional)",
      notificationLabel: "Recibir notificaciones por correo",
      emailLabel: "Tu correo",
      successTitle: "¡Gracias por el reporte!",
      successDesc:
        "Tu informe ha sido enviado a nuestro equipo técnico. Juntos estamos construyendo un editor mejor.",
      understood: "Entendido",
      technicalInfo:
        "Se adjuntarán automáticamente datos técnicos anónimos para ayudar a nuestro equipo a reproducir y corregir el error.",
      validationDescEmpty: "Por favor, describe el problema brevemente.",
      validationDescShort: "La descripción debe tener al menos 10 caracteres.",
      validationEmailEmpty: "Informa tu correo para recibir la notificación.",
      validationEmailInvalid: "Informa un correo válido.",
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
      aiRewrite: "Reescribir con IA",
      chooseTone: "Elige el tono",
      allText: "Todo el texto",
      noToneAvail: "No hay tonos disponibles o seleccionados.",
      defaultTones: "Tonos predeterminados",
      yourTones: "Tus tonos",
      aiSuggestion: "Sugerencia de IA",
      accept: "Aceptar",
      discard: "Descartar",
      generating: "Generando sugerencia...",
      rewriteTooltip:
        "Inicie sesión o regístrese para acceder a la función de reescritura asistida por IA.",
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
      welcomeBack: "Bienvenido de nuevo",
      newDocument: "Nuevo Documento",
      settings: "Ajustes",
      timeSavedTotal: "en total con ayuda de la IA",
      docsSavedCloud: "documentos guardados en la nube",
      freeLimit: "gratis (plan",
      usedToday: "utilizadas hoy",
      usedMonth: "utilizadas este mes",
      productivityEvol: "Evolución de Productividad",
      timeSaved30: "Tiempo Ahorrado - Últimos 30 días",
      preferences: "Preferencias",
      topTones: "Tonos más usados",
      quickAccess: "Acceso Rápido",
      recentDocs: "Documentos Recientes",
      seeAll: "Ver todos",
      freePlan: "Plan Gratuito",
      unlockPro: "Desbloquea 500 reescrituras/mes con Pro",
      unlimitedDocs:
        "Documentos ilimitados, todos los tonos de IA y mucho más.",
      seePlans: "Ver Planes",
      noRewrites:
        "Aún no hay reescrituras registradas. ¡Usa la IA en el editor para ver tu progreso aquí!",
      noTones: "Ningún tono detectado",
      noTonesDesc:
        "Tu estilo de escritura aparecerá aquí a medida que edites y uses diferentes tonos de IA.",
      recentDocsDesc:
        "Tus documentos recientes aparecerán aquí. ¡Comienza un nuevo proyecto ahora!",
      untitled: "Sin título",
      upgradePro: "Mejorar a Pro",
    },
    tones: {
      formal: { label: "FORMAL", desc: "Profesional y serio" },
      casual: { label: "CASUAL", desc: "Relajado e informal" },
      academic: { label: "ACADÉMICO", desc: "Erudito y estructurado" },
      creative: { label: "CREATIVO", desc: "Original e imaginativo" },
      simplified: { label: "SIMPLIFICADO", desc: "Simple y directo" },
      romantic: { label: "ROMÁNTICO", desc: "Emocional y apasionado" },
      narrative: { label: "NARRATIVA", desc: "Para contar historias" },
      instagram: { label: "INSTAGRAM", desc: "Estilo social y atractivo" },
      whatsapp: { label: "WHATSAPP", desc: "Directo y conversacional" },
      tweet: { label: "TWEET", desc: "Conciso e impactante" },
      professional: { label: "PROFESIONAL", desc: "Enfocado en negocios" },
      persuasive: { label: "PERSUASIVO", desc: "Convincente y enfocado" },
      friendly: { label: "AMIGABLE", desc: "Cálido y amable" },
      prompt: { label: "Prompt IA", desc: "Dedicado a agentes LLM" },
    },
  },
};

export const getCommonMessages = (locale?: Locale): CommonMessages => {
  const normalized =
    locale && i18n.locales.includes(locale) ? locale : i18n.defaultLocale;
  return commonMessages[normalized];
};
