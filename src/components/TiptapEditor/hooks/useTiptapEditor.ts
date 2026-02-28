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
  const editor = useEditor(editorOptions, []);

  useImperativeHandle(
    ref,
    () => ({
      getInstance: () => editor,
    }),
    [editor],
  );

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

    // @ts-expect-error - placeholder is a custom property in editorProps
    editor.setOptions({ editorProps: { placeholder } });
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
