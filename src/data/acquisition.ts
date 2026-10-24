import { i18n, type Locale } from "../../i18n-config";

const pt = {
  save: "Salvar",
  myTexts: "Meus textos",
  format: "Formatar",
  insert: "Inserir",
  utilities: "Ferramentas",
  close: "Fechar",
  titleLabel: "Nome do rascunho (opcional)",
  titlePlaceholder: "Ex.: Redação escolar",
  writePlaceholder: "Digite ou cole seu texto para revisar…",
  pending: "Alterações pendentes",
  savedAt: "Salvo neste navegador às",
  untitled: "Sem título",
  open: "Abrir",
  rename: "Renomear",
  preview: "Prévia",
  delete: "Excluir",
  deleteQuestion: "Excluir este texto?",
  deleteWarning:
    "Exporte uma cópia antes de excluir. Essa ação não pode ser desfeita.",
  cancel: "Cancelar",
  emptyText: "Texto vazio",
  emptyLibrary: "Você ainda não tem textos salvos",
  emptyLibraryHint:
    "Comece a escrever: seu texto será salvo automaticamente neste navegador.",
  updated: "Atualizado em",
  renameError: "Não foi possível renomear o texto",
  deleteError: "Não foi possível excluir o texto",
  loadError:
    "Não foi possível ler seus textos neste navegador. Os dados existentes foram preservados.",
  done: "Concluído",
  previous: "Página anterior",
  next: "Próxima página",
  wordDocx: "Exportar Word (.docx)",
  wordHint:
    "Compatível com Microsoft Word. Em outros aplicativos, a importação pode variar.",
  exportError: "Não foi possível exportar o documento",
  newText: "Novo texto",
  savedHint: "Salvamento automático após uma pausa na escrita",

  start: "Começar agora",
  destination: "no Zerus",
  language: "Idioma",
  theme: "Tema",
  closeMenu: "Fechar menu",
  title: "Guarde e organize seus textos no Zerus",
  description:
    "Reúna documentos e notas em um workspace pessoal, organize em pastas e retome seu trabalho quando precisar.",
  cta: "Começar no Zerus",
  note: "O Zerus é outro produto. Seu texto atual continua neste navegador.",
  localNote:
    "Seus textos ficam neste navegador. Exporte uma cópia para guardar em outro dispositivo.",
  local: "Neste navegador",
  saving: "Salvando…",
  saved: "Salvo neste navegador",
  saveError: "Não foi possível salvar neste navegador",
  more: "Mais",
  less: "Menos",
  tools: "Ferramentas avançadas",
  documents: "Textos neste navegador",
  importMarkdown: "Importar Markdown",
  ai: "IA no Zerus",
  aiHint:
    "Revise e reescreva seus textos no Zerus. O texto atual não é transferido automaticamente.",
  legacy:
    "O Editor de Texto agora funciona sem conta. Para ajuda com documentos antigos na nuvem ou assinaturas, fale conosco. Seus textos locais continuam disponíveis neste navegador.",
  contact: "Fale conosco",
  missing:
    "Este documento não está disponível neste navegador. Para ajuda com documentos antigos na nuvem, fale conosco.",
  missingLocal:
    "Este texto não foi encontrado neste navegador. Você pode continuar com seu rascunho ou importar uma cópia.",
  storage:
    "Os rascunhos ficam neste navegador. Consulte a Política de Privacidade para entender o processamento dos recursos online.",
};
const messages: Record<Locale, typeof pt> = {
  pt,
  en: {
    save: "Save",
    myTexts: "My texts",
    format: "Format",
    insert: "Insert",
    utilities: "Tools",
    close: "Close",
    titleLabel: "Draft name (optional)",
    titlePlaceholder: "E.g. Meeting notes",
    writePlaceholder: "Type or paste your text to review…",
    pending: "Unsaved changes",
    savedAt: "Saved in this browser at",
    untitled: "Untitled",
    open: "Open",
    rename: "Rename",
    preview: "Preview",
    delete: "Delete",
    deleteQuestion: "Delete this text?",
    deleteWarning:
      "Export a copy before deleting. This action cannot be undone.",
    cancel: "Cancel",
    emptyText: "Empty text",
    emptyLibrary: "You have no saved texts yet",
    emptyLibraryHint:
      "Start writing: your text will be saved automatically in this browser.",
    updated: "Updated on",
    renameError: "Could not rename the text",
    deleteError: "Could not delete the text",
    loadError:
      "Could not read your texts in this browser. Existing data has been preserved.",
    done: "Done",
    previous: "Previous page",
    next: "Next page",
    wordDocx: "Export Word (.docx)",
    wordHint:
      "Compatible with Microsoft Word. Import support in other apps may vary.",
    exportError: "Could not export the document",
    newText: "New text",
    savedHint: "Saves automatically after a pause in writing",

    start: "Start now",
    destination: "on Zerus",
    language: "Language",
    theme: "Theme",
    closeMenu: "Close menu",
    title: "Save and organize your texts in Zerus",
    description:
      "Bring documents and notes into a personal workspace, organize them in folders, and return to your work when you need it.",
    cta: "Start with Zerus",
    note: "Zerus is a separate product. Your current text stays in this browser.",
    localNote:
      "Your texts stay in this browser. Export a copy to keep them on another device.",
    local: "In this browser",
    saving: "Saving…",
    saved: "Saved in this browser",
    saveError: "Could not save in this browser",
    more: "More",
    less: "Less",
    tools: "Advanced tools",
    documents: "Texts in this browser",
    importMarkdown: "Import Markdown",
    ai: "AI in Zerus",
    aiHint:
      "Review and rewrite texts in Zerus. Your current text is not transferred automatically.",
    legacy:
      "The Text Editor now works without an account. Contact us for help with old cloud documents or subscriptions. Your local texts remain available in this browser.",
    contact: "Contact us",
    missing:
      "This document is not available in this browser. Contact us for help with old cloud documents.",
    missingLocal:
      "This text was not found in this browser. Continue with your draft or import a copy.",
    storage:
      "Drafts stay in this browser. Read the Privacy Policy to understand how online features process data.",
  },
  es: {
    save: "Guardar",
    myTexts: "Mis textos",
    format: "Formato",
    insert: "Insertar",
    utilities: "Herramientas",
    close: "Cerrar",
    titleLabel: "Nombre del borrador (opcional)",
    titlePlaceholder: "Ej.: Notas de la reunión",
    writePlaceholder: "Escribe o pega tu texto para revisarlo…",
    pending: "Cambios pendientes",
    savedAt: "Guardado en este navegador a las",
    untitled: "Sin título",
    open: "Abrir",
    rename: "Renombrar",
    preview: "Vista previa",
    delete: "Eliminar",
    deleteQuestion: "¿Eliminar este texto?",
    deleteWarning:
      "Exporta una copia antes de eliminar. Esta acción no se puede deshacer.",
    cancel: "Cancelar",
    emptyText: "Texto vacío",
    emptyLibrary: "Todavía no tienes textos guardados",
    emptyLibraryHint:
      "Empieza a escribir: tu texto se guardará automáticamente en este navegador.",
    updated: "Actualizado el",
    renameError: "No se pudo renombrar el texto",
    deleteError: "No se pudo eliminar el texto",
    loadError:
      "No se pudieron leer tus textos en este navegador. Los datos existentes se han conservado.",
    done: "Listo",
    previous: "Página anterior",
    next: "Página siguiente",
    wordDocx: "Exportar Word (.docx)",
    wordHint:
      "Compatible con Microsoft Word. La importación en otras aplicaciones puede variar.",
    exportError: "No se pudo exportar el documento",
    newText: "Nuevo texto",
    savedHint: "Guardado automático después de una pausa al escribir",

    start: "Empezar ahora",
    destination: "en Zerus",
    language: "Idioma",
    theme: "Tema",
    closeMenu: "Cerrar menú",
    title: "Guarda y organiza tus textos en Zerus",
    description:
      "Reúne documentos y notas en un espacio personal, organiza en carpetas y retoma tu trabajo cuando lo necesites.",
    cta: "Empezar en Zerus",
    note: "Zerus es otro producto. Tu texto actual permanece en este navegador.",
    localNote:
      "Tus textos permanecen en este navegador. Exporta una copia para guardarlos en otro dispositivo.",
    local: "En este navegador",
    saving: "Guardando…",
    saved: "Guardado en este navegador",
    saveError: "No se pudo guardar en este navegador",
    more: "Más",
    less: "Menos",
    tools: "Herramientas avanzadas",
    documents: "Textos en este navegador",
    importMarkdown: "Importar Markdown",
    ai: "IA en Zerus",
    aiHint:
      "Revisa y reescribe textos en Zerus. El texto actual no se transfiere automáticamente.",
    legacy:
      "El Editor de Texto ahora funciona sin cuenta. Contáctanos para obtener ayuda con documentos antiguos en la nube o suscripciones. Tus textos locales siguen disponibles en este navegador.",
    contact: "Contáctanos",
    missing:
      "Este documento no está disponible en este navegador. Contáctanos para obtener ayuda con documentos antiguos en la nube.",
    missingLocal:
      "Este texto no se encontró en este navegador. Continúa con tu borrador o importa una copia.",
    storage:
      "Los borradores permanecen en este navegador. Consulta la Política de Privacidad para conocer el procesamiento de los recursos online.",
  },
};
export function getAcquisitionContent(locale?: Locale) {
  return messages[locale ?? i18n.defaultLocale] ?? pt;
}
