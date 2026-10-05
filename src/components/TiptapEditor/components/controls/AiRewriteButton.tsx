"use client";

import { ArrowUpRight, Wand2 } from "lucide-react";
import { useTiptapContext } from "../Provider";
import { getAcquisitionContent } from "@/data/acquisition";
import ZerusLink from "@/components/shared/ZerusLink";
import Tooltip from "../ui/Tooltip";

export default function AiRewriteButton() {
  const { locale } = useTiptapContext();
  const t = getAcquisitionContent(locale);
  return (
    <Tooltip content={t.aiHint}>
      <ZerusLink
        locale={locale}
        placement="editor_ai"
        className="rte-zerus-ai"
        aria-label={t.aiHint}
      >
        <Wand2 size={14} aria-hidden="true" />
        {t.ai}
        <ArrowUpRight size={12} aria-hidden="true" />
      </ZerusLink>
    </Tooltip>
  );
}
