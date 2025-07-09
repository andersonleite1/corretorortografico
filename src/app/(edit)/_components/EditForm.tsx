import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import TiptapEditor, { type TiptapEditorRef } from "@/components/TiptapEditor";
import { getPost, savePost } from "@/services/post";

interface PostForm {
  title: string;
  content: string;
}

export default function EditForm() {
  const editorRef = useRef<TiptapEditorRef>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { control, reset, watch } = useForm<PostForm>();

  const getWordCount = useCallback(
    () => editorRef.current?.getInstance()?.storage.characterCount.words() ?? 0,
    [editorRef.current]
  );

  useEffect(() => {
    getPost().then((post) => {
      reset({ ...post });
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const subscription = watch((values, { type }) => {
      if (type === "change") {
        savePost({ ...values, wordCount: getWordCount() });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  if (isLoading) return;

  return (
    <div className="flex flex-col gap-6 order-2 min-w-full prose prose-blue dark:prose-invert prose-headings:scroll-m-20 article-content bg-white dark:bg-gray-800 px-4 md:px-8">
      <div>
        <label className="inline-block font-medium dark:text-white mb-2">
          Título
        </label>
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="w-full px-4 py-2.5 shadow border border-[#d1d9e0] rounded-md bg-white dark:bg-[#0d1017] dark:text-white dark:border-[#3d444d] outline-none"
              placeholder="Digite o título da postagem ou nome do arquivo que será exportado..."
            />
          )}
        />
      </div>

      <div>
        <label className="inline-block font-medium dark:text-white mb-2">
          Conteúdo
        </label>
        <Controller
          control={control}
          name="content"
          render={({ field }) => (
            <TiptapEditor
              ref={editorRef}
              ssr={true}
              output="html"
              placeholder={{
                paragraph: "Digite seu conteúdo aqui...",
                imageCaption: "Digite a legenda da imagem (opcional)",
              }}
              contentMinHeight={256}
              contentMaxHeight={640}
              onContentChange={field.onChange}
              initialContent={field.value}
            />
          )}
        />
      </div>

      <h3 className="mb-0 pb-0">Fundamentos de Comandos</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-left shadow-md mt-0 pt-0">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <th className="px-4 py-3 border-b border-gray-300 dark:border-gray-700">
                Comando
              </th>
              <th className="px-4 py-3 border-b border-gray-300 dark:border-gray-700">
                Windows/Linux
              </th>
              <th className="px-4 py-3 border-b border-gray-300 dark:border-gray-700">
                macOS
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-900 dark:text-gray-200">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Copiar
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">C</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">C</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Recortar
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">X</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">X</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Colar
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">V</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">V</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Colar sem formatação
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">V</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">V</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Desfazer
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Z</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Z</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Refazer
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Z</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Z</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Adicionar quebra de linha
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Enter</kbd> <br />
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Enter</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Enter</kbd> <br />
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Enter</kbd>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="mb-0 pb-0">Formatação de texto</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-left shadow-md mt-0 pt-0">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <th className="px-4 py-3 border-b border-gray-300 dark:border-gray-700">
                Comando
              </th>
              <th className="px-4 py-3 border-b border-gray-300 dark:border-gray-700">
                Windows/Linux
              </th>
              <th className="px-4 py-3 border-b border-gray-300 dark:border-gray-700">
                macOS
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-900 dark:text-gray-200">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Negrito
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">B</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">B</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Itálico
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">I</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">I</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Sublinhado
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">U</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">U</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Tachado
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">S</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">S</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Destaque
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">H</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Cmd</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Shift</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">H</kbd>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                Código
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">E</kbd>
              </td>
              <td className="px-4 py-2 border-b border-gray-300 dark:border-gray-700">
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
