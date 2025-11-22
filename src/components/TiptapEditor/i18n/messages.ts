import { i18n, type Locale } from "../../../../i18n-config";

export type EditorMessages = {
  toolbar: {
    undo: string;
    redo: string;
    bold: string;
    italic: string;
    underline: string;
    strikethrough: string;
    superscript: string;
    subscript: string;
    code: string;
    textColor: string;
    highlightColor: string;
    align: string;
    alignLeft: string;
    alignCenter: string;
    alignRight: string;
    alignJustify: string;
    bulletList: string;
    orderedList: string;
    link: string;
    table: string;
    codeBlock: string;
    insert: string;
    moreFormats: string;
    blockquote: string;
    youtube: string;
    image: string;
    heading: string;
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
    drafts: string;
    export: string;
    preview: string;
    importPdf: string;
    clearEditor: string;
  };
  insert: {
    quote: string;
    codeBlock: string;
    youtube: string;
    youtubePrompt: string;
    youtubePlaceholder: string;
  };
  headings: {
    menu: string;
    paragraph: string;
    h1: string;
    h2: string;
    h3: string;
    h4: string;
  };
  fontFamily: {
    default: string;
  };
  fontSize: {
    default: string;
  };
  lineHeight: {
    tooltip: string;
    default: string;
  };
  export: {
    doc: string;
    txt: string;
    pdf: string;
    generatingPdf: string;
  };
  preview: {
    pdf: string;
    post: string;
    generatingPdf: string;
  };
  drafts: {
    save: string;
    empty: string;
    untitled: string;
    delete: string;
  };
  link: {
    urlLabel: string;
    urlPlaceholder: string;
    textLabel: string;
    textPlaceholder: string;
    cancel: string;
    apply: string;
    edit: string;
    open: string;
    copy: string;
    copied: string;
    remove: string;
  };
  image: {
    altButton: string;
    altTooltip: string;
    altPlaceholder: string;
    caption: string;
    sizeOptionLabel: (value: number) => string;
  };
  statusBar: {
    source: string;
    fullscreen: string;
    words: string;
    characters: string;
    toggleHint: string;
    spellcheck: {
      checking: string;
      ready: (count: number) => string;
      rateLimited: string;
      error: string;
    };
  };
  languageTool: {
    enableTooltip: string;
    disableTooltip: string;
    label: string;
    title: string;
    close: string;
    fallbackRule: string;
    empty: string;
    noSuggestions: string;
    ignore: string;
  };
  codeBlock: {
    copy: string;
    delete: string;
    search: string;
  };
  table: {
    addRowAbove: string;
    addRowBelow: string;
    addColumnLeft: string;
    addColumnRight: string;
    splitCell: string;
    mergeCells: string;
    toggleRowHeader: string;
    toggleColumnHeader: string;
    deleteRow: string;
    deleteColumn: string;
    deleteTable: string;
  };
  general: {
    default: string;
    download: string;
    delete: string;
    on: string;
    off: string;
  };
};

const withDefault = <T extends Record<Locale, EditorMessages>>(map: T) => map;

export const editorMessages = withDefault({
  pt: {
    toolbar: {
      undo: "Desfazer",
      redo: "Refazer",
      bold: "Negrito",
      italic: "Itálico",
      underline: "Sublinhado",
      strikethrough: "Tachado",
      superscript: "Sobrescrito",
      subscript: "Subscrito",
      code: "Código",
      textColor: "Cor do texto",
      highlightColor: "Cor de realce",
      align: "Alinhar",
      alignLeft: "Alinhar à esquerda",
      alignCenter: "Centralizar",
      alignRight: "Alinhar à direita",
      alignJustify: "Justificar",
      bulletList: "Lista com marcadores",
      orderedList: "Lista numerada",
      link: "Inserir link",
      table: "Tabela",
      codeBlock: "Bloco de código",
      insert: "Inserir",
      moreFormats: "Mais formatos",
      blockquote: "Citação",
      youtube: "Vídeo do YouTube",
      image: "Imagem",
      heading: "Títulos",
      fontFamily: "Fonte",
      fontSize: "Tamanho da fonte",
      lineHeight: "Espaçamento entre linhas",
      drafts: "Rascunhos",
      export: "Exportar",
      preview: "Visualizar",
      importPdf: "Importar PDF",
      clearEditor: "Limpar conteúdo",
    },
    insert: {
      quote: "Citação",
      codeBlock: "Bloco de código",
      youtube: "Vídeo do YouTube",
      youtubePrompt: "Incorpore um link do YouTube",
      youtubePlaceholder: "https://www.youtube.com/watch?v=...",
    },
    headings: {
      menu: "Títulos",
      paragraph: "Parágrafo",
      h1: "Título 1",
      h2: "Título 2",
      h3: "Título 3",
      h4: "Título 4",
    },
    fontFamily: {
      default: "Fonte",
    },
    fontSize: {
      default: "Tamanho",
    },
    lineHeight: {
      tooltip: "Espaçamento entre linhas",
      default: "Padrão",
    },
    export: {
      doc: "Exportar Word (DOC)",
      txt: "Exportar TXT",
      pdf: "Exportar PDF",
      generatingPdf: "Gerando PDF…",
    },
    preview: {
      pdf: "Pré-visualizar PDF",
      post: "Pré-visualizar post",
      generatingPdf: "Gerando PDF…",
    },
    drafts: {
      save: "Salvar rascunho",
      empty: "Nenhum rascunho salvo",
      untitled: "Sem título",
      delete: "Excluir rascunho",
    },
    link: {
      urlLabel: "Endereço",
      urlPlaceholder: "Cole o endereço do link",
      textLabel: "Texto exibido",
      textPlaceholder: "Digite o texto do link",
      cancel: "Cancelar",
      apply: "Aplicar",
      edit: "Editar link",
      open: "Abrir em nova guia",
      copy: "Copiar link",
      copied: "Link copiado",
      remove: "Remover link",
    },
    image: {
      altButton: "Texto alternativo",
      altTooltip: "Definir texto alternativo",
      altPlaceholder: "Descreva a imagem",
      caption: "Legenda",
      sizeOptionLabel: (value: number) => `${value}% da largura`,
    },
    statusBar: {
      source: "Código-fonte",
      fullscreen: "Tela cheia",
      words: "Palavras",
      characters: "Caracteres",
      toggleHint: "Clique aqui para ocultar anúncios",
      spellcheck: {
        checking: "Revisando…",
        ready: (count: number) => `Sugestões: ${count}`,
        rateLimited: "Limite atingido",
        error: "Indisponível",
      },
    },
    languageTool: {
      enableTooltip: "Ativar corretor com IA",
      disableTooltip: "Desativar corretor com IA",
      label: "Corretor ortográfico",
      title: "Corretor",
      close: "Fechar",
      fallbackRule: "Ortografia",
      empty: "Selecione um erro para ver as sugestões",
      noSuggestions: "Nenhuma sugestão",
      ignore: "Ignorar",
    },
    codeBlock: {
      copy: "Copiar código",
      delete: "Excluir bloco",
      search: "Buscar linguagem…",
    },
    table: {
      addRowAbove: "Inserir linha acima",
      addRowBelow: "Inserir linha abaixo",
      addColumnLeft: "Inserir coluna à esquerda",
      addColumnRight: "Inserir coluna à direita",
      splitCell: "Dividir célula",
      mergeCells: "Mesclar células",
      toggleRowHeader: "Alternar cabeçalho de linha",
      toggleColumnHeader: "Alternar cabeçalho de coluna",
      deleteRow: "Excluir linha",
      deleteColumn: "Excluir coluna",
      deleteTable: "Excluir tabela",
    },
    general: {
      default: "Padrão",
      download: "Baixar",
      delete: "Excluir",
      on: "Ativado",
      off: "Desativado",
    },
  },
  en: {
    toolbar: {
      undo: "Undo",
      redo: "Redo",
      bold: "Bold",
      italic: "Italic",
      underline: "Underline",
      strikethrough: "Strikethrough",
      superscript: "Superscript",
      subscript: "Subscript",
      code: "Code",
      textColor: "Font color",
      highlightColor: "Highlight color",
      align: "Align",
      alignLeft: "Align left",
      alignCenter: "Center",
      alignRight: "Align right",
      alignJustify: "Justify",
      bulletList: "Bullets",
      orderedList: "Numbering",
      link: "Insert link",
      table: "Table",
      codeBlock: "Code block",
      insert: "Insert",
      moreFormats: "More formatting",
      blockquote: "Quote",
      youtube: "YouTube video",
      image: "Picture",
      heading: "Headings",
      fontFamily: "Font",
      fontSize: "Font size",
      lineHeight: "Line spacing",
      drafts: "Drafts",
      export: "Export",
      preview: "Preview",
      importPdf: "Import PDF",
      clearEditor: "Clear content",
    },
    insert: {
      quote: "Quote",
      codeBlock: "Code block",
      youtube: "YouTube video",
      youtubePrompt: "Embed a YouTube link",
      youtubePlaceholder: "https://www.youtube.com/watch?v=...",
    },
    headings: {
      menu: "Headings",
      paragraph: "Normal text",
      h1: "Heading 1",
      h2: "Heading 2",
      h3: "Heading 3",
      h4: "Heading 4",
    },
    fontFamily: {
      default: "Font",
    },
    fontSize: {
      default: "Size",
    },
    lineHeight: {
      tooltip: "Line spacing",
      default: "Single",
    },
    export: {
      doc: "Export Word",
      txt: "Export TXT",
      pdf: "Export PDF",
      generatingPdf: "Generating PDF…",
    },
    preview: {
      pdf: "Preview PDF",
      post: "Preview post",
      generatingPdf: "Generating PDF…",
    },
    drafts: {
      save: "Save draft",
      empty: "No drafts saved",
      untitled: "Untitled",
      delete: "Delete draft",
    },
    link: {
      urlLabel: "Address",
      urlPlaceholder: "Paste the link address",
      textLabel: "Display text",
      textPlaceholder: "Type the link text",
      cancel: "Cancel",
      apply: "Apply",
      edit: "Edit link",
      open: "Open in new tab",
      copy: "Copy link",
      copied: "Link copied",
      remove: "Remove link",
    },
    image: {
      altButton: "Alt text",
      altTooltip: "Set alternative text",
      altPlaceholder: "Describe the image",
      caption: "Caption",
      sizeOptionLabel: (value: number) => `${value}% width`,
    },
    statusBar: {
      source: "Source code",
      fullscreen: "Full screen",
      words: "Words",
      characters: "Characters",
      toggleHint: "Click here to hide ads",
      spellcheck: {
        checking: "Checking…",
        ready: (count: number) => `Suggestions: ${count}`,
        rateLimited: "Limit reached",
        error: "Unavailable",
      },
    },
    languageTool: {
      enableTooltip: "Turn on AI editor",
      disableTooltip: "Turn off AI editor",
      label: "Spell checker",
      title: "Editor",
      close: "Close",
      fallbackRule: "Spelling",
      empty: "Select an issue to see suggestions",
      noSuggestions: "No suggestions",
      ignore: "Ignore",
    },
    codeBlock: {
      copy: "Copy code",
      delete: "Delete block",
      search: "Search language…",
    },
    table: {
      addRowAbove: "Insert row above",
      addRowBelow: "Insert row below",
      addColumnLeft: "Insert column to the left",
      addColumnRight: "Insert column to the right",
      splitCell: "Split cell",
      mergeCells: "Merge cells",
      toggleRowHeader: "Toggle header row",
      toggleColumnHeader: "Toggle header column",
      deleteRow: "Delete row",
      deleteColumn: "Delete column",
      deleteTable: "Delete table",
    },
    general: {
      default: "Default",
      download: "Download",
      delete: "Delete",
      on: "On",
      off: "Off",
    },
  },
  es: {
    toolbar: {
      undo: "Deshacer",
      redo: "Rehacer",
      bold: "Negrita",
      italic: "Cursiva",
      underline: "Subrayado",
      strikethrough: "Tachado",
      superscript: "Superíndice",
      subscript: "Subíndice",
      code: "Código",
      textColor: "Color de fuente",
      highlightColor: "Color de resaltado",
      align: "Alinear",
      alignLeft: "Alinear a la izquierda",
      alignCenter: "Centrar",
      alignRight: "Alinear a la derecha",
      alignJustify: "Justificar",
      bulletList: "Viñetas",
      orderedList: "Numeración",
      link: "Insertar vínculo",
      table: "Tabla",
      codeBlock: "Bloque de código",
      insert: "Insertar",
      moreFormats: "Más formatos",
      blockquote: "Cita",
      youtube: "Video de YouTube",
      image: "Imagen",
      heading: "Estilos",
      fontFamily: "Fuente",
      fontSize: "Tamaño de fuente",
      lineHeight: "Interlineado",
      drafts: "Borradores",
      export: "Exportar",
      preview: "Vista previa",
      importPdf: "Importar PDF",
      clearEditor: "Limpiar contenido",
    },
    insert: {
      quote: "Cita",
      codeBlock: "Bloque de código",
      youtube: "Video de YouTube",
      youtubePrompt: "Inserte un enlace de YouTube",
      youtubePlaceholder: "https://www.youtube.com/watch?v=...",
    },
    headings: {
      menu: "Estilos",
      paragraph: "Texto normal",
      h1: "Título 1",
      h2: "Título 2",
      h3: "Título 3",
      h4: "Título 4",
    },
    fontFamily: {
      default: "Fuente",
    },
    fontSize: {
      default: "Tamaño",
    },
    lineHeight: {
      tooltip: "Interlineado",
      default: "Sencillo",
    },
    export: {
      doc: "Exportar Word",
      txt: "Exportar TXT",
      pdf: "Exportar PDF",
      generatingPdf: "Generando PDF…",
    },
    preview: {
      pdf: "Vista previa en PDF",
      post: "Vista previa del post",
      generatingPdf: "Generando PDF…",
    },
    drafts: {
      save: "Guardar borrador",
      empty: "Sin borradores guardados",
      untitled: "Sin título",
      delete: "Eliminar borrador",
    },
    link: {
      urlLabel: "Dirección",
      urlPlaceholder: "Pegue la dirección del vínculo",
      textLabel: "Texto visible",
      textPlaceholder: "Escriba el texto del vínculo",
      cancel: "Cancelar",
      apply: "Aplicar",
      edit: "Editar vínculo",
      open: "Abrir en nueva pestaña",
      copy: "Copiar vínculo",
      copied: "Vínculo copiado",
      remove: "Quitar vínculo",
    },
    image: {
      altButton: "Texto alternativo",
      altTooltip: "Definir texto alternativo",
      altPlaceholder: "Describa la imagen",
      caption: "Leyenda",
      sizeOptionLabel: (value: number) => `${value}% del ancho`,
    },
    statusBar: {
      source: "Código fuente",
      fullscreen: "Pantalla completa",
      words: "Palabras",
      characters: "Caracteres",
      toggleHint: "Haz clic para ocultar los anuncios",
      spellcheck: {
        checking: "Revisando…",
        ready: (count: number) => `Sugerencias: ${count}`,
        rateLimited: "Límite alcanzado",
        error: "No disponible",
      },
    },
    languageTool: {
      enableTooltip: "Activar corrector con IA",
      disableTooltip: "Desactivar corrector con IA",
      label: "Corrector ortográfico",
      title: "Corrector",
      close: "Cerrar",
      fallbackRule: "Ortografía",
      empty: "Seleccione un error para ver sugerencias",
      noSuggestions: "Sin sugerencias",
      ignore: "Ignorar",
    },
    codeBlock: {
      copy: "Copiar código",
      delete: "Eliminar bloque",
      search: "Buscar lenguaje…",
    },
    table: {
      addRowAbove: "Insertar fila arriba",
      addRowBelow: "Insertar fila abajo",
      addColumnLeft: "Insertar columna a la izquierda",
      addColumnRight: "Insertar columna a la derecha",
      splitCell: "Dividir celda",
      mergeCells: "Combinar celdas",
      toggleRowHeader: "Alternar fila de encabezado",
      toggleColumnHeader: "Alternar columna de encabezado",
      deleteRow: "Eliminar fila",
      deleteColumn: "Eliminar columna",
      deleteTable: "Eliminar tabla",
    },
    general: {
      default: "Predeterminado",
      download: "Descargar",
      delete: "Eliminar",
      on: "Activado",
      off: "Desactivado",
    },
  },
});

export const getEditorMessages = (locale?: Locale): EditorMessages => {
  const normalized = locale && i18n.locales.includes(locale) ? locale : i18n.defaultLocale;
  return editorMessages[normalized];
};
