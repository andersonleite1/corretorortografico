import { useCompletion } from "@ai-sdk/react";
import { useState } from "react";
import { useTiptapContext } from "../components/Provider";
import { useParams } from "next/navigation";

export function useAiTranslate() {
  const { editor } = useTiptapContext();
  const params = useParams();
  const [showPreview, setShowPreview] = useState(false);
  const locale = (params?.locale as string) ?? "pt";
  const language = locale === "en" ? "English" : locale === "es" ? "Spanish" : "Portuguese";
  const { complete, completion, isLoading, setCompletion } = useCompletion({
    api: "/api/ai/translate",
    streamProtocol: "text",
    onError: (error) => {
      setShowPreview(false);
      console.error("Translation error:", error);
    },
  });

  const handleTranslate = (to: string, scope: "selection" | "all" = "selection") => {
    const content = scope === "selection"
      ? editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, " ")
      : editor.getText();
    if (!content.trim()) return;
    setCompletion("");
    setShowPreview(true);
    complete("", { body: { content, to, from: language } });
  };

  const handleAccept = (scope: "selection" | "all" = "selection") => {
    if (scope === "selection") {
      const { from, to } = editor.state.selection;
      editor.chain().focus().deleteRange({ from, to }).insertContent(completion).run();
    } else {
      editor.commands.setContent(completion);
    }
    setCompletion("");
    setShowPreview(false);
  };

  return {
    handleTranslate,
    handleAccept,
    handleDiscard: () => { setCompletion(""); setShowPreview(false); },
    completion,
    isLoading,
    showPreview,
  };
}
