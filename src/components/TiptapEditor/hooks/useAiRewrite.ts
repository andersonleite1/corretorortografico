import { useCompletion } from "@ai-sdk/react";
import { type Editor } from "@tiptap/react";
import { useState } from "react";
import { useTiptapContext } from "../components/Provider";

export function useAiRewrite() {
  const { editor } = useTiptapContext();
  const [showPreview, setShowPreview] = useState(false);

  const { complete, completion, isLoading, setCompletion } = useCompletion({
    api: "/api/ai/rewrite",
    streamProtocol: "text",
    onError: (err: Error) => {
      setShowPreview(false);
      console.error("AI Error:", err);
      try {
        const data = JSON.parse(err.message);
        if (data.upgradeUrl) {
          alert(
            `${data.message || data.error}\n\nAcesse a seção de planos na Home.`,
          );
        } else {
          alert(data.error || data.message || "Erro na IA. Tente novamente.");
        }
      } catch {
        alert(`Erro na IA: ${err.message}`);
      }
    },
  });

  const handleRewrite = (
    toneId: string,
    customInstructions?: string,
    scope: "selection" | "all" = "selection",
  ) => {
    let text = "";
    if (scope === "selection") {
      text = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        " ",
      );
    } else {
      text = editor.getText();
    }

    if (!text.trim()) return;

    setCompletion("");
    setShowPreview(true);
    complete("", {
      body: {
        text,
        tone: toneId,
        customInstructions,
        language: "pt-BR",
      },
    });
  };

  const handleAccept = (scope: "selection" | "all" = "selection") => {
    if (scope === "selection") {
      const { from, to } = editor.state.selection;
      editor
        .chain()
        .focus()
        .deleteRange({ from, to })
        .insertContent(completion)
        .run();
    } else {
      editor.chain().focus().setContent(completion).run();
    }
    setCompletion("");
    setShowPreview(false);
  };

  const handleDiscard = () => {
    setCompletion("");
    setShowPreview(false);
  };

  return {
    handleRewrite,
    handleAccept,
    handleDiscard,
    completion,
    isLoading,
    showPreview,
    setShowPreview,
    setCompletion,
  };
}
