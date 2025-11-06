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
} from "./extensions";

const ExtensionKit = [
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
    checkDelay: 10000,
    minChars: 15,
    enabled: true,
  }),
];

export default ExtensionKit;
