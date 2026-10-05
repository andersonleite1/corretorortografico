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
  ImageUpload,
  TextStyle,
  FontFamily,
  FontSize,
  LineHeight,
  Color,
  Highlight,
  Table,
  LanguageTool,
  Shortcuts,
  TextCase,
  SearchAndReplace,
  Callout,
} from "./extensions";
import { Locale, i18n } from "../../../i18n-config";

const languageToolCodeByLocale: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es",
};

const resolveLanguageToolCode = (locale?: Locale) => {
  const normalized =
    locale && languageToolCodeByLocale[locale] ? locale : i18n.defaultLocale;
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
    showOnlyCurrent: false,
    placeholder: ({ editor, node }) => {
      // @ts-expect-error - placeholder is a custom extension property
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
  TextCase,
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
  ImageUpload,
  ImageFigure,
  CodeBlock,
  Youtube,
  Table,
  LanguageTool.configure({
    checkDelay: 1000,
    minChars: 15,
    enabled: true,
    language: resolveLanguageToolCode(locale),
  }),
  SearchAndReplace,
  Callout,
];

export default createExtensionKit;
