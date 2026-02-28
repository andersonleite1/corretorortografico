import {
  CharacterCount,
  CodeBlock,
  ImageFigure,
  Link,
  Placeholder,
  StarterKit,
  Subscript,
  Superscript,
  TextAlign,
  Selection,
  ImageCaption,
  Youtube,
  Image,
  TextStyle,
  FontFamily,
  FontSize,
  LineHeight,
  Color,
  Highlight,
  Table,
  LanguageTool,
  Shortcuts,
} from "./extensions";
import { Locale, i18n } from "../../../i18n-config";

const languageToolCodeByLocale: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es",
};

const resolveLanguageToolCode = (locale?: Locale) => {
  const normalized = (locale && languageToolCodeByLocale[locale]) ? locale : i18n.defaultLocale;
  return languageToolCodeByLocale[normalized];
};

const createExtensionKit = (locale?: Locale) => [
  StarterKit.configure({
    horizontalRule: false,
    hardBreak: false,
    codeBlock: false,
    link: false,
  }),
  Placeholder.configure({
    includeChildren: true,
    showOnlyCurrent: true,
    placeholder: ({ editor, node }) => {
      // @ts-ignore
      const placeholder = editor.options.editorProps["placeholder"];
      switch (node.type.name) {
        case ImageCaption.name:
          return placeholder?.imageCaption;
        default:
          return placeholder?.paragraph;
      }
    },
  }),
  Selection,
  Shortcuts,
  CharacterCount,
  Superscript,
  Subscript,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TextStyle,
  FontFamily.configure({
    types: ["textStyle"],
  }),
  FontSize,
  LineHeight,
  Color,
  Highlight.configure({ multicolor: true }),
  Link,
  Image,
  ImageFigure,
  CodeBlock,
  Youtube,
  Table,
  LanguageTool.configure({
    checkDelay: 1000,
    minChars: 15,
    enabled: false,
    language: resolveLanguageToolCode(locale),
  }),
];

export default createExtensionKit;
