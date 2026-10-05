"use client";

import { type EditorState } from "@tiptap/pm/state";
import { useTiptapContext } from "../Provider";
import { BubbleMenu } from "../BubbleMenu";
import { getAcquisitionContent } from "@/data/acquisition";
import ZerusLink from "@/components/shared/ZerusLink";
import { ArrowUpRight } from "lucide-react";

export function AiBubbleMenu() {
  const { editor, locale } = useTiptapContext();
  const t = getAcquisitionContent(locale);
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="aiBubbleMenu"
      shouldShow={({ state }: { state: EditorState }) =>
        state.selection.from !== state.selection.to
      }
      options={{ placement: "bottom-start", offset: 8 }}
      appendTo={() => document.body}
    >
      <div className="rounded-xl border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
        <ZerusLink
          locale={locale}
          placement="selection_ai"
          className="rte-zerus-ai"
          title={t.aiHint}
        >
          {t.ai}
          <ArrowUpRight size={14} aria-hidden="true" />
        </ZerusLink>
      </div>
    </BubbleMenu>
  );
}
