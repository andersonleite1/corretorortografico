"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../TiptapEditor/components/ui/Icon";
import Dialog from "../TiptapEditor/components/ui/Dialog";
import { useParams } from "next/navigation";
import { getCommonMessages } from "@/data/common";
import { type Locale } from "../../../i18n-config";

interface BugReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pageUrl?: string;
}

type ReportStatus = "idle" | "submitting" | "success" | "error";

export const BugReportDialog = ({
  isOpen,
  onClose,
  pageUrl,
}: BugReportDialogProps) => {
  const params = useParams();
  const t = getCommonMessages(params?.locale as Locale).bugReport;
  const tc = getCommonMessages(params?.locale as Locale).contact;
  const ta = getCommonMessages(params?.locale as Locale).auth;

  const [status, setStatus] = useState<ReportStatus>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    description: "",
    additionalInfo: "",
    wantsNotification: false,
    notificationEmail: "",
  });

  const resetForm = () => {
    setFormData({
      description: "",
      additionalInfo: "",
      wantsNotification: false,
      notificationEmail: "",
    });
    setErrors({});
    setStatus("idle");
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.description.trim()) {
      newErrors.description = t.validationDescEmpty;
    } else if (formData.description.trim().length < 10) {
      newErrors.description = t.validationDescShort;
    }

    if (formData.wantsNotification) {
      if (!formData.notificationEmail.trim()) {
        newErrors.notificationEmail = t.validationEmailEmpty;
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.notificationEmail.trim())
      ) {
        newErrors.notificationEmail = t.validationEmailInvalid;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");

    try {
      const res = await fetch("/api/bug-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: formData.description.trim(),
          additionalInfo: formData.additionalInfo.trim() || null,
          wantsNotification: formData.wantsNotification,
          notificationEmail: formData.wantsNotification
            ? formData.notificationEmail.trim()
            : null,
          pageUrl:
            pageUrl ??
            (typeof window !== "undefined" ? window.location.href : null),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? t.error);
      }

      setStatus("success");
      toast.success(t.success);
    } catch (err) {
      setStatus("error");
      setErrors({
        submit: err instanceof Error ? err.message : t.error,
      });
      toast.error(t.error);
    }
  };

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open: boolean) => !open && onClose()}
      className="max-w-2xl max-h-[calc(100vh-40px)] flex flex-col"
    >
      <div className="w-full flex flex-col relative outline-none">
        {/* Header */}
        <div className="px-8 py-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t.title}
            </h2>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest leading-relaxed">
              Debug • Feedback • Beta
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t.close}
            className="p-2.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 transition-all active:scale-90"
          >
            <Icon name="Close" size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0 relative custom-scrollbar">
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-8">
                  <Icon
                    name="CheckboxChecked"
                    size={48}
                    className="text-emerald-500"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t.successTitle}
                </h3>
                <div className="mt-4 text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-sm">
                  <p>{t.successDesc}</p>
                  {formData.wantsNotification && formData.notificationEmail && (
                    <p className="mt-2 text-blue-500 font-bold">
                      {formData.notificationEmail}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="mt-10 px-10 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full shadow-lg shadow-blue-500/25 transition-all active:scale-95"
                >
                  {t.understood}
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="p-8 space-y-8"
              >
                {/* Description */}
                <div className="space-y-3">
                  <label
                    htmlFor="description"
                    className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-2"
                  >
                    {t.descriptionLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="description"
                    type="text"
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      if (errors.description)
                        setErrors((p) => ({ ...p, description: "" }));
                    }}
                    placeholder={t.placeholderTitle}
                    className={`w-full px-4 py-3 bg-gray-50/50 dark:bg-black/20 border ${errors.description ? "border-red-400 dark:border-red-500" : "border-gray-100 dark:border-white/5"} rounded-2xl text-[15px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all dark:text-white outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700 font-medium`}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500 pl-1 font-bold italic">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Additional Info */}
                <div className="space-y-3">
                  <label
                    htmlFor="additionalInfo"
                    className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1"
                  >
                    {t.additionalInfoLabel}
                  </label>
                  <textarea
                    id="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        additionalInfo: e.target.value,
                      })
                    }
                    placeholder={t.placeholderDesc}
                    className="w-full h-32 p-4 bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl text-[15px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all resize-none dark:text-white outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700 font-medium"
                  />
                </div>

                {/* Notification Options */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
                    {t.notificationLabel.split(" ")[0]}
                  </label>
                  <div className="space-y-3">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={formData.wantsNotification}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          wantsNotification: !formData.wantsNotification,
                        })
                      }
                      className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl transition-all"
                    >
                      <span className="text-[14px] font-bold text-gray-600 dark:text-gray-400">
                        {t.notificationLabel}
                      </span>
                      <div
                        className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${formData.wantsNotification ? "bg-blue-500" : "bg-gray-200 dark:bg-white/10"}`}
                      >
                        <motion.div
                          animate={{ x: formData.wantsNotification ? 16 : 0 }}
                          className="w-4 h-4 bg-white rounded-full shadow-sm"
                        />
                      </div>
                    </button>

                    <AnimatePresence>
                      {formData.wantsNotification && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          className="overflow-hidden space-y-2"
                        >
                          <label
                            htmlFor="notificationEmail"
                            className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1"
                          >
                            {t.emailLabel}
                          </label>
                          <input
                            id="notificationEmail"
                            type="email"
                            value={formData.notificationEmail}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                notificationEmail: e.target.value,
                              });
                              if (errors.notificationEmail)
                                setErrors((p) => ({
                                  ...p,
                                  notificationEmail: "",
                                }));
                            }}
                            placeholder={ta.emailPlaceholder}
                            className={`w-full px-4 py-3 bg-gray-50/50 dark:bg-black/20 border ${errors.notificationEmail ? "border-red-400 dark:border-red-500" : "border-gray-100 dark:border-white/5"} rounded-2xl text-[15px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all dark:text-white outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700 font-medium`}
                          />
                          {errors.notificationEmail && (
                            <p className="text-xs text-red-500 pl-1 mt-2 font-bold italic">
                              {errors.notificationEmail}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {errors.submit && (
                  <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-2xl border border-red-200 dark:border-red-800/30 flex gap-3">
                    <div className="text-red-500 flex-shrink-0">
                      <Icon name="Info" size={18} />
                    </div>
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 leading-relaxed italic">
                      {errors.submit}
                    </p>
                  </div>
                )}

                <div className="bg-blue-50/50 dark:bg-blue-500/5 p-5 rounded-2xl border border-blue-100/50 dark:border-blue-500/10 flex gap-4">
                  <div className="mt-0.5 text-blue-500 shrink-0">
                    <Icon name="Info" size={20} />
                  </div>
                  <p className="text-[13px] font-medium text-blue-800/80 dark:text-blue-200/60 leading-relaxed">
                    {t.technicalInfo}
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {status !== "success" && (
          <div className="px-8 py-6 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/10 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white text-sm font-bold rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-all active:scale-95"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSubmit}
              disabled={status === "submitting"}
              className={`px-10 py-2.5 bg-blue-500 text-white text-sm font-bold rounded-full shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 active:scale-95 ${status === "submitting"
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-600"
                }`}
            >
              {status === "submitting" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t.sending}
                </>
              ) : (
                t.send
              )}
            </button>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default BugReportDialog;
