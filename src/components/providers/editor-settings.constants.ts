/**
 * Constantes compartilhadas para as configurações do editor de texto.
 *
 * Este arquivo NÃO contém a diretiva "use client" e pode ser importado
 * tanto por componentes cliente quanto por API Routes (servidor).
 */

export type ToolbarButtonId =
  | "undo"
  | "redo"
  | "save"
  | "bold"
  | "italic"
  | "underline"
  | "moreMark"
  | "textColor"
  | "textHighlight"
  | "align"
  | "bulletList"
  | "orderedList"
  | "lineHeight"
  | "link"
  | "table"
  | "codeBlock"
  | "insert"
  | "heading"
  | "fontFamily"
  | "fontSize"
  | "languageTool"
  | "languageToolSidebar"
  | "browserSpellcheck"
  | "export"
  | "preview"
  | "documents"
  | "drafts"
  | "importPdf"
  | "copyEditor"
  | "clearEditor"
  | "sourceCode"
  | "fullScreen"
  | "aiRewrite"
  | "uppercase"
  | "lowercase"
  | "capitalize"
  | "clearFormat"
  | "shortcuts"
  | "searchReplace"
  | "emoji";

export type ToneId =
  | "formal"
  | "casual"
  | "academic"
  | "creative"
  | "simplified"
  | "romantic"
  | "narrative"
  | "instagram"
  | "whatsapp"
  | "tweet"
  | "professional"
  | "persuasive"
  | "friendly"
  | "prompt";

export interface CustomTone {
  id: string;
  name: string;
  description: string;
  instructions: string;
  isActive: boolean;
}

export const DEFAULT_SETTINGS: Record<ToolbarButtonId, boolean> = {
  undo: true,
  redo: true,
  save: true,
  bold: true,
  italic: true,
  underline: true,
  moreMark: true,
  textColor: true,
  textHighlight: true,
  align: true,
  bulletList: true,
  orderedList: true,
  lineHeight: true,
  link: true,
  table: true,
  codeBlock: true,
  insert: true,
  heading: true,
  fontFamily: true,
  fontSize: true,
  languageTool: true,
  languageToolSidebar: true,
  browserSpellcheck: false,
  export: true,
  preview: true,
  documents: true,
  drafts: true,
  importPdf: true,
  copyEditor: true,
  clearEditor: true,
  sourceCode: true,
  fullScreen: true,
  aiRewrite: true,
  uppercase: true,
  lowercase: true,
  capitalize: true,
  clearFormat: true,
  shortcuts: true,
  searchReplace: true,
  emoji: true,
};

export const DEFAULT_TONES: Record<ToneId, boolean> = {
  formal: true,
  casual: true,
  academic: true,
  creative: true,
  simplified: true,
  romantic: true,
  narrative: true,
  instagram: true,
  whatsapp: true,
  tweet: true,
  professional: true,
  persuasive: true,
  friendly: true,
  prompt: true,
};

export const TOOLBAR_BUTTON_LABELS: Record<ToolbarButtonId, string> = {
  undo: "Desfazer",
  redo: "Refazer",
  save: "Salvar",
  bold: "Negrito",
  italic: "Itálico",
  underline: "Sublinhado",
  moreMark: "Mais Formatações",
  textColor: "Cor do Texto",
  textHighlight: "Cor de Fundo",
  align: "Alinhamento",
  bulletList: "Lista com Marcadores",
  orderedList: "Lista Numerada",
  lineHeight: "Espaçamento de Linhas",
  link: "Inserir Link",
  table: "Inserir Tabela",
  codeBlock: "Bloco de Código",
  insert: "Inserir Outros",
  heading: "Cabeçalhos",
  fontFamily: "Fonte",
  fontSize: "Tamanho da Fonte",
  languageTool: "Corretor (LanguageTool)",
  languageToolSidebar: "Painel do Corretor",
  browserSpellcheck: "Corretor do Navegador",
  export: "Exportar",
  preview: "Visualizar",
  documents: "Meus Documentos (Lateral)",
  drafts: "Rascunhos",
  importPdf: "Importar PDF",
  copyEditor: "Copiar Texto",
  clearEditor: "Limpar Editor",
  sourceCode: "Código-fonte",
  fullScreen: "Tela cheia",
  aiRewrite: "Reescrever IA",
  uppercase: "Maiúsculas",
  lowercase: "Minúsculas",
  capitalize: "Primeira Letra Maiúscula",
  clearFormat: "Limpar Formatação",
  shortcuts: "Teclas de atalho",
  searchReplace: "Localizar e Substituir",
  emoji: "Inserir emoji",
};

export const TONE_LABELS: Record<ToneId, string> = {
  formal: "FORMAL",
  casual: "CASUAL",
  academic: "ACADÊMICO",
  creative: "CRIATIVO",
  simplified: "SIMPLIFICADO",
  romantic: "ROMÂNTICO",
  narrative: "NARRATIVO",
  instagram: "INSTAGRAM",
  whatsapp: "WHATSAPP",
  tweet: "TWEET",
  professional: "PROFISSIONAL",
  persuasive: "PERSUASIVO",
  friendly: "AMIGÁVEL",
  prompt: "Prompt IA",
};

export const TONE_DESCRIPTIONS: Record<ToneId, string> = {
  formal: "Profissional e sério",
  casual: "Descontraído e informal",
  academic: "Erudito e estruturado",
  creative: "Original e imaginativo",
  simplified: "Simples e direto",
  romantic: "Emotivo e apaixonado",
  narrative: "Para contar histórias",
  instagram: "Estilo social e envolvente",
  whatsapp: "Direto e conversacional",
  tweet: "Conciso e impactante",
  professional: "Focado em negócios",
  persuasive: "Convincente e focado",
  friendly: "Acolhedor e gentil",
  prompt: "Dedicado a agentes LLM",
};

export const TONE_ICONS: Record<ToneId, string> = {
  formal: "👔",
  casual: "👕",
  academic: "🎓",
  creative: "🎨",
  simplified: "💡",
  romantic: "❤️",
  narrative: "📖",
  instagram: "📸",
  whatsapp: "💬",
  tweet: "🐦",
  professional: "💼",
  persuasive: "🎯",
  friendly: "😊",
  prompt: "🤖",
};
