"use client";

import React, { useState } from "react";
import { Icon } from "../TiptapEditor/components/ui/Icon";
import {
  useEditorSettings,
  TOOLBAR_BUTTON_LABELS,
  ToolbarButtonId,
  ToneId,
  TONE_LABELS,
  TONE_DESCRIPTIONS,
  TONE_ICONS,
} from "@/components/providers/EditorSettingsProvider";
import { motion, AnimatePresence } from "framer-motion";
import Dialog from "../TiptapEditor/components/ui/Dialog";
import { useParams } from "next/navigation";
import { getCommonMessages } from "@/data/common";
import { Locale } from "../../../i18n-config";

export const SettingsDialog = ({
  userPlan = "free",
}: {
  userPlan?: "free" | "pro" | "team";
}) => {
  const {
    isSettingsDialogOpen,
    setIsSettingsDialogOpen,
    buttonVisibility,
    toggleButtonVisibility,
    activeTones,
    toggleToneActivation,
    customTones,
    addCustomTone,
    deleteCustomTone,
    toggleCustomToneActivation,
  } = useEditorSettings();
  const [activeTab, setActiveTab] = useState<"tones" | "toolbar" | "general">(
    "toolbar",
  );
  const [isCreateToneDialogOpen, setIsCreateToneDialogOpen] = useState(false);

  // Estados do formulário de novo tom
  const params = useParams();
  const locale = (params?.locale as Locale) || "pt";
  const t = getCommonMessages(locale);
  const ts = t.settings;

  const [newToneName, setNewToneName] = useState("");
  const [newToneDescription, setNewToneDescription] = useState("");
  const [newToneInstructions, setNewToneInstructions] = useState("");

  if (!isSettingsDialogOpen) return null;

  const buttonIds = Object.keys(TOOLBAR_BUTTON_LABELS) as ToolbarButtonId[];
  const toneIds = Object.keys(TONE_LABELS) as ToneId[];

  const handleCreateTone = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newToneName.trim() ||
      !newToneDescription.trim() ||
      !newToneInstructions.trim()
    )
      return;

    addCustomTone({
      name: newToneName,
      description: newToneDescription.slice(0, 20),
      instructions: newToneInstructions,
    });

    // Limpar e fechar
    setNewToneName("");
    setNewToneDescription("");
    setNewToneInstructions("");
    setIsCreateToneDialogOpen(false);
  };

  const tabs = [
    { id: "toolbar", label: ts.tabs.toolbar, icon: "Columns" as const },
    { id: "general", label: ts.tabs.general, icon: "Settings" as const },
  ];

  return (
    <Dialog
      open={isSettingsDialogOpen}
      onOpenChange={(open: boolean) => setIsSettingsDialogOpen(open)}
      className="max-w-5xl"
    >
      <div className="w-full max-h-[90vh] flex flex-col md:flex-row relative outline-none">
        {/* Sidebar (Desktop) / Header (Mobile) */}
        <div className="w-full md:w-72 bg-gray-50/50 dark:bg-black/20 border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5 flex flex-col">
          <div className="p-8 pb-4">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              {ts.title}
            </h2>
          </div>

          <nav className="flex-1 px-4 py-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${activeTab === tab.id ? "bg-white/20" : "bg-gray-100 dark:bg-white/5"}`}
                >
                  <Icon
                    name={tab.icon}
                    size={16}
                    className={
                      activeTab === tab.id
                        ? "text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  />
                </div>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="p-8 pt-4 mt-auto hidden md:block">
            <button
              onClick={() => setIsSettingsDialogOpen(false)}
              className="w-full px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:opacity-90 transition-opacity active:scale-95"
            >
              {ts.done}
            </button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 bg-white dark:bg-[#1c1c1e] relative overflow-y-auto">
          {/* Fechar Mobile */}
          <button
            onClick={() => setIsSettingsDialogOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-white md:hidden transition-colors z-50"
          >
            <Icon name="Close" size={20} />
          </button>

          <div className="p-8 md:p-12 h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="h-full"
              >
                {activeTab === "tones" && (
                  <div className="space-y-8 h-full">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {ts.tonesTitle}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-[15px]">
                        {ts.tonesDesc}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {toneIds.map((id) => {
                        const isActive = activeTones[id];

                        return (
                          <button
                            key={id}
                            onClick={() => toggleToneActivation(id)}
                            className={`group relative flex flex-col items-start p-6 rounded-[24px] border transition-all duration-300 ${
                              isActive
                                ? "border-blue-500/50 bg-blue-50/50 dark:bg-blue-500/10 shadow-[0_8px_20px_-6px_rgba(59,130,246,0.3)]"
                                : "border-gray-100 bg-gray-50/50 hover:border-gray-200 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10"
                            }`}
                          >
                            <div className="text-3xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                              {TONE_ICONS[id]}
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4
                                className={`text-sm font-bold uppercase tracking-widest ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}
                              >
                                {t.tones[id].label}
                              </h4>
                            </div>
                            <p
                              className={`text-xs leading-relaxed text-left ${isActive ? "text-blue-500/80 dark:text-blue-400/80" : "text-gray-500 dark:text-gray-400"}`}
                            >
                              {t.tones[id].desc}
                            </p>
                            {isActive && (
                              <div className="absolute top-4 right-4 text-blue-500">
                                <Icon name="Check" size={16} />
                              </div>
                            )}
                          </button>
                        );
                      })}

                      {customTones.map((tone) => {
                        return (
                          <div
                            key={tone.id}
                            className={`group relative flex flex-col items-start p-6 rounded-[24px] border transition-all duration-300 ${
                              tone.isActive
                                ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.3)]"
                                : "border-gray-100 bg-gray-50/50 hover:border-gray-200 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10"
                            }`}
                          >
                            <button
                              onClick={() =>
                                toggleCustomToneActivation(tone.id)
                              }
                              className="absolute inset-0 z-0"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCustomTone(tone.id);
                              }}
                              className="absolute top-4 right-4 p-2 rounded-xl bg-red-50 text-red-500 md:opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10"
                            >
                              <Icon name="Trash" size={14} />
                            </button>
                            <div className="text-3xl mb-4 z-0 transform group-hover:scale-110 transition-transform duration-300">
                              ✨
                            </div>
                            <div className="flex items-center gap-2 mb-1 z-0">
                              <h4
                                className={`text-sm font-bold uppercase tracking-widest ${tone.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`}
                              >
                                {tone.name}
                              </h4>
                            </div>
                            <p
                              className={`text-xs leading-relaxed text-left z-0 ${tone.isActive ? "text-emerald-500/80 dark:text-emerald-400/80" : "text-gray-500 dark:text-gray-400"}`}
                            >
                              {tone.description}
                            </p>
                          </div>
                        );
                      })}

                      {customTones.length < 5 && (
                        <button
                          onClick={() => setIsCreateToneDialogOpen(true)}
                          disabled={userPlan === "free"}
                          title={
                            userPlan === "free" ? ts.proOnly : ts.registerCustom
                          }
                          className={`flex flex-col items-center justify-center text-center p-6 rounded-[24px] border-2 border-dashed border-gray-100 hover:border-blue-400 hover:bg-blue-50/50 dark:border-white/5 dark:hover:border-blue-500/20 transition-all group ${
                            userPlan === "free"
                              ? "opacity-40 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3 group-hover:rotate-90 transition-transform duration-300">
                            <Icon
                              name="Plus"
                              size={24}
                              className="text-gray-400 group-hover:text-blue-500"
                            />
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600 transition-colors">
                              {ts.newTone}
                            </span>
                            {userPlan === "free" && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[9px] font-bold uppercase tracking-tighter">
                                Pro
                              </span>
                            )}
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "toolbar" && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {ts.toolbarTitle}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-[15px]">
                        {ts.toolbarDesc}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {buttonIds
                        .filter(
                          (id) =>
                            ![
                              "browserSpellcheck",
                              "sourceCode",
                              "fullScreen",
                              "shortcuts",
                              "documents",
                            ].includes(id),
                        )
                        .map((id) => (
                          <label
                            key={id}
                            className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-all active:scale-[0.98]"
                          >
                            <input
                              type="checkbox"
                              checked={buttonVisibility[id]}
                              onChange={() => toggleButtonVisibility(id)}
                              className="w-6 h-6 rounded-lg border-gray-200 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-white dark:bg-white/10 dark:border-white/10 cursor-pointer transition-all"
                            />
                            <span className="text-[15px] font-semibold text-gray-700 dark:text-gray-200 select-none">
                              {TOOLBAR_BUTTON_LABELS[id]}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}

                {activeTab === "general" && (
                  <div className="space-y-12">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {ts.generalTitle}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-[15px]">
                        {ts.generalDesc}
                      </p>
                    </div>

                    <div className="space-y-10">
                      <section className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                          {ts.footerDisplay}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            "sourceCode",
                            "fullScreen",
                            "shortcuts",
                            "documents",
                          ].map((id) => (
                            <label
                              key={id}
                              className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-all active:scale-[0.98]"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  buttonVisibility[id as ToolbarButtonId]
                                }
                                onChange={() =>
                                  toggleButtonVisibility(id as ToolbarButtonId)
                                }
                                className="w-6 h-6 rounded-lg border-gray-200 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-white dark:bg-white/10 dark:border-white/10 cursor-pointer"
                              />
                              <span className="text-[15px] font-semibold text-gray-700 dark:text-gray-200 select-none">
                                {TOOLBAR_BUTTON_LABELS[id as ToolbarButtonId]}
                              </span>
                            </label>
                          ))}
                        </div>
                      </section>

                      <section className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                          {ts.browserSpellcheck}
                        </h4>
                        <label
                          htmlFor="browserSpellcheck"
                          className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-all active:scale-[0.98]"
                        >
                          <input
                            id="browserSpellcheck"
                            type="checkbox"
                            aria-label="Corretor do Navegador"
                            checked={buttonVisibility.browserSpellcheck}
                            onChange={() =>
                              toggleButtonVisibility("browserSpellcheck")
                            }
                            className="w-6 h-6 rounded-lg border-gray-200 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-white dark:bg-white/10 dark:border-white/10 cursor-pointer"
                          />
                          <div className="flex flex-col">
                            <span className="text-[15px] font-semibold text-gray-700 dark:text-gray-200">
                              {ts.browserSpellcheck}
                            </span>
                            <span className="text-xs text-gray-500">
                              {ts.browserSpellcheckDesc}
                            </span>
                          </div>
                        </label>
                      </section>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Modal de Criação de Tom */}
        <Dialog
          open={isCreateToneDialogOpen}
          onOpenChange={(open: boolean) => setIsCreateToneDialogOpen(open)}
          className="max-w-md sm:max-w-[540px]"
        >
          <div className="w-full bg-white dark:bg-[#2c2c2e] rounded-[32px] p-10 flex flex-col relative outline-none">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              {ts.createToneTitle}
            </h3>
            <form onSubmit={handleCreateTone} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1">
                  {ts.nameLabel}
                </label>
                <input
                  className="w-full px-5 py-3.5 rounded-2xl border-none bg-gray-100 dark:bg-white/5 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white font-medium"
                  placeholder={ts.placeholderTone}
                  value={newToneName}
                  onChange={(e) => setNewToneName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1">
                  {ts.descLabel}
                </label>
                <input
                  className="w-full px-5 py-3.5 rounded-2xl border-none bg-gray-100 dark:bg-white/5 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white font-medium"
                  placeholder={ts.placeholderMaxChars}
                  maxLength={20}
                  value={newToneDescription}
                  onChange={(e) => setNewToneDescription(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1">
                  {ts.instructionsLabel}
                </label>
                <textarea
                  className="w-full px-5 py-4 rounded-2xl border-none bg-gray-100 dark:bg-white/5 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white font-medium min-h-[140px] resize-none"
                  placeholder={ts.placeholderInstructions}
                  value={newToneInstructions}
                  onChange={(e) => setNewToneInstructions(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateToneDialogOpen(false)}
                  className="flex-1 px-4 py-3.5 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all"
                >
                  {ts.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3.5 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-95"
                >
                  {ts.create}
                </button>
              </div>
            </form>
          </div>
        </Dialog>
      </div>
    </Dialog>
  );
};

export default SettingsDialog;
