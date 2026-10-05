import { Ref, useEffect, useImperativeHandle, useRef } from "react";
import { useEditor, type UseEditorOptions } from "@tiptap/react";
import useForceUpdate from "./useForceUpdate";
import { TiptapEditorRef } from "../components/Editor";

export type UseTiptapEditorOptions = UseEditorOptions & {
  ref?: Ref<TiptapEditorRef>;
  placeholder?: {
    paragraph?: string;
    imageCaption?: string;
  };
};

export default function useTiptapEditor({
  ref,
  placeholder,
  ...editorOptions
}: UseTiptapEditorOptions) {
  const forceUpdate = useForceUpdate();
  const editor = useEditor(
    {
      autofocus: "end",
      ...editorOptions,
      editorProps: {
        ...editorOptions.editorProps,
        // @ts-expect-error - placeholder is consumed by our extension kit
        placeholder,
      },
    },
    [],
  );

  useImperativeHandle(
    ref,
    () => ({
      getInstance: () => editor,
    }),
    [editor],
  );

  useEffect(() => {
    if (!editor || editorOptions.content === undefined || editor.isFocused)
      return;

    const currentContent =
      typeof editorOptions.content === "string"
        ? editor.getHTML()
        : JSON.stringify(editor.getJSON());
    const newContent =
      typeof editorOptions.content === "string"
        ? editorOptions.content
        : JSON.stringify(editorOptions.content);

    if (currentContent !== newContent) {
      editor.commands.setContent(editorOptions.content, { emitUpdate: false });
    }
  }, [editor, editorOptions.content]);

  useEffect(() => {
    const isEditable = editorOptions.editable;
    if (!editor || editor.isEditable === isEditable) return;
    editor.setOptions({ editable: Boolean(isEditable) });
    forceUpdate();
  }, [editor, editorOptions.editable, forceUpdate]);

  const prevPlaceholderRef = useRef<
    UseTiptapEditorOptions["placeholder"] | null
  >(null);

  useEffect(() => {
    if (!editor || !placeholder) return;

    // Evita loop de renderização se o placeholder for o mesmo
    if (
      prevPlaceholderRef.current?.paragraph === placeholder.paragraph &&
      prevPlaceholderRef.current?.imageCaption === placeholder.imageCaption
    ) {
      return;
    }

    editor.setOptions({
      // @ts-expect-error - placeholder is consumed by our extension kit
      editorProps: { ...editor.options.editorProps, placeholder },
    });
    editor.view.dispatch(editor.state.tr);
    prevPlaceholderRef.current = placeholder;
    forceUpdate();
  }, [editor, placeholder, forceUpdate]);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  return editor;
}
