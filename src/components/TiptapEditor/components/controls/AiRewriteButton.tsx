"use client";

import React, { useState } from "react";
import { ChevronDown, Loader2, Wand2 } from "lucide-react";
import { useTiptapContext } from "../Provider";
import {
  useEditorSettings,
  ToneId,
  TONE_LABELS,
  TONE_ICONS,
} from "@/components/providers/EditorSettingsProvider";
import { useAiRewrite } from "../../hooks/useAiRewrite";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";

import { useAuth } from "@clerk/nextjs";
import Tooltip from "../ui/Tooltip";

export default function AiRewriteButton() {
  const { userPlan } = useTiptapContext();
  const { isSignedIn } = useAuth();
  const { activeTones, customTones } = useEditorSettings();
  const isPro = userPlan !== "free";
  const [open, setOpen] = useState(false);

  const {
    handleRewrite,
    handleAccept,
    handleDiscard,
    completion,
    isLoading,
    showPreview,
    setShowPreview,
  } = useAiRewrite();

  const onRewrite = (toneId: string, customInstructions?: string) => {
    handleRewrite(toneId, customInstructions, "all");
    setOpen(false);
  };

  const onAccept = () => {
    handleAccept("all");
    setOpen(false);
  };

  const onDiscard = () => {
    handleDiscard();
  };

  const button = (
    <div className="relative group">
      <button
        onClick={() => setOpen(!open)}
        disabled={isLoading || !isSignedIn}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap ${
          isPro
            ? "bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white hover:shadow-indigo-500/20"
            : "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
        } ${!isSignedIn ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Wand2 className="w-3.5 h-3.5" />
        )}
        Reescrever IA
        <ChevronDown
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
        {!isPro && isSignedIn && (
          <span className="ml-1 px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-[10px] uppercase tracking-tighter">
            Pro
          </span>
        )}
      </button>
      {isSignedIn && (
        <div className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </div>
      )}
    </div>
  );

  if (!isSignedIn) {
    return (
      <Tooltip content="Faça login ou registre-se no site para acessar o recurso de reescrita assistida por IA.">
        {button}
      </Tooltip>
    );
  }

  return (
    <Popover
      open={open || showPreview}
      onOpenChange={(val) => {
        if (!val && !isLoading) {
          setOpen(false);
          setShowPreview(false);
        } else if (val && !showPreview) {
          setOpen(true);
        }
      }}
    >
      <PopoverTrigger asChild>{button}</PopoverTrigger>
      <PopoverContent
        className="w-80 p-3 z-[10000]"
        sideOffset={8}
        align="start"
      >
        {!showPreview ? (
          <div className="flex flex-col gap-1">
            <div className="px-2 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Escolha o tom (Todo o texto)
            </div>
            {(() => {
              const toneIds = Object.keys(TONE_LABELS) as ToneId[];
              const activeToneIds = toneIds.filter((id, index) => {
                const isWithinLimit = userPlan !== "free" || index < 5;
                return activeTones[id] && isWithinLimit;
              });
              const activeCustomTones = customTones.filter((t, idx) => {
                const index = toneIds.length + idx;
                const isWithinLimit = userPlan !== "free" || index < 5;
                return t.isActive && isWithinLimit;
              });

              if (
                activeToneIds.length === 0 &&
                activeCustomTones.length === 0
              ) {
                return (
                  <div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 text-center">
                    Nenhum tom disponível ou selecionado.
                  </div>
                );
              }

              return (
                <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                  {activeToneIds.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                        Tons Padrão
                      </div>
                      {activeToneIds.map((id) => (
                        <button
                          key={id}
                          onClick={() => onRewrite(id)}
                          className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-2"
                        >
                          <span className="text-sm">{TONE_ICONS[id]}</span>
                          <span>{TONE_LABELS[id]}</span>
                        </button>
                      ))}
                    </>
                  )}

                  {activeCustomTones.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-t border-gray-100 dark:border-white/5 mt-1 pt-1">
                        Seus Tons
                      </div>
                      {activeCustomTones.map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => onRewrite(tone.id, tone.instructions)}
                          className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-2"
                        >
                          <span className="text-sm">✨</span>
                          <span className="truncate">{tone.name}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-1 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                Sugestão da IA
              </span>
              {isLoading && (
                <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-xs leading-relaxed text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 max-h-80 overflow-y-auto scrollbar-thin">
              {completion || (isLoading && "Gerando sugestão...")}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onAccept}
                disabled={isLoading && !completion}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                Aceitar
              </button>
              <button
                onClick={onDiscard}
                className="flex-1 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 text-[11px] font-bold py-2 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
              >
                Descartar
              </button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
