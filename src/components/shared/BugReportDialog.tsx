"use client";

import React, { useState, useRef } from "react";
import { FaTimes, FaBug } from "react-icons/fa";

interface BugReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pageUrl?: string;
}

type Step = "form" | "success";

export const BugReportDialog = ({
  isOpen,
  onClose,
  pageUrl,
}: BugReportDialogProps) => {
  const [step, setStep] = useState<Step>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [description, setDescription] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [wantsNotification, setWantsNotification] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("");

  const overlayRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = "Por favor, descreva o problema brevemente.";
    } else if (description.trim().length < 10) {
      newErrors.description = "A descrição deve ter pelo menos 10 caracteres.";
    }

    if (wantsNotification) {
      if (!notificationEmail.trim()) {
        newErrors.notificationEmail =
          "Informe seu e-mail para receber a notificação.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail.trim())) {
        newErrors.notificationEmail = "Informe um e-mail válido.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/bug-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          additionalInfo: additionalInfo.trim() || null,
          wantsNotification,
          notificationEmail: wantsNotification
            ? notificationEmail.trim()
            : null,
          pageUrl:
            pageUrl ??
            (typeof window !== "undefined" ? window.location.href : null),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Erro ao enviar o relatório.");
      }

      setStep("success");
    } catch (err) {
      setErrors({
        submit:
          err instanceof Error ? err.message : "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state on close
    setStep("form");
    setDescription("");
    setAdditionalInfo("");
    setWantsNotification(false);
    setNotificationEmail("");
    setErrors({});
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8"
      onClick={handleOverlayClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bug-report-title"
        className="w-full max-w-lg bg-white dark:bg-[#1c1c1e] rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 dark:border-white/10">
          <h2
            id="bug-report-title"
            className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <FaBug className="text-emerald-500 dark:text-emerald-400 text-sm" />
            </span>
            Reportar Problema
          </h2>
          <button
            type="button"
            id="bug-report-close-btn"
            onClick={handleClose}
            aria-label="Fechar diálogo"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-500 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* ── Body ── */}
        {step === "form" ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 px-6 py-6"
            noValidate
          >
            {/* Descrição breve */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="bug-description"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Descrição breve do problema{" "}
                <span className="text-emerald-500" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="bug-description"
                type="text"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description)
                    setErrors((p) => ({ ...p, description: "" }));
                }}
                placeholder="Ex.: O botão de exportação não está funcionando"
                maxLength={500}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-colors focus:ring-2 focus:ring-blue-500/40 ${
                  errors.description
                    ? "border-red-400 dark:border-red-500"
                    : "border-gray-200 dark:border-white/15"
                }`}
                required
                aria-required="true"
                aria-describedby={
                  errors.description ? "bug-desc-error" : undefined
                }
              />
              {errors.description && (
                <p id="bug-desc-error" className="text-xs text-red-500 mt-0.5">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Informações adicionais */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="bug-additional"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Informações adicionais{" "}
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  (opcional)
                </span>
              </label>
              <textarea
                id="bug-additional"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Descreva os passos para reproduzir o problema, o comportamento esperado, etc."
                maxLength={2000}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 text-sm bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-colors focus:ring-2 focus:ring-blue-500/40 resize-none"
              />
              <p className="text-xs text-gray-400 dark:text-gray-600 text-right">
                {additionalInfo.length}/2000
              </p>
            </div>

            {/* Checkbox notificação */}
            <div className="flex flex-col gap-3">
              <label
                htmlFor="bug-notify"
                className="flex items-start gap-3 cursor-pointer group"
              >
                <input
                  id="bug-notify"
                  type="checkbox"
                  checked={wantsNotification}
                  onChange={(e) => {
                    setWantsNotification(e.target.checked);
                    if (!e.target.checked) {
                      setNotificationEmail("");
                      setErrors((p) => ({ ...p, notificationEmail: "" }));
                    }
                  }}
                  className="mt-0.5 w-4 h-4 accent-blue-500 cursor-pointer flex-shrink-0"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  Desejo receber uma notificação por e-mail quando o problema
                  for resolvido
                </span>
              </label>

              {/* Campo de e-mail condicional */}
              {wantsNotification && (
                <div className="flex flex-col gap-1.5 pl-7 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label
                    htmlFor="bug-email"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Seu e-mail{" "}
                    <span className="text-emerald-500" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="bug-email"
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => {
                      setNotificationEmail(e.target.value);
                      if (errors.notificationEmail)
                        setErrors((p) => ({ ...p, notificationEmail: "" }));
                    }}
                    placeholder="seuemail@exemplo.com"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-colors focus:ring-2 focus:ring-blue-500/40 ${
                      errors.notificationEmail
                        ? "border-red-400 dark:border-red-500"
                        : "border-gray-200 dark:border-white/15"
                    }`}
                    required={wantsNotification}
                    aria-required={wantsNotification}
                    aria-describedby={
                      errors.notificationEmail ? "bug-email-error" : undefined
                    }
                  />
                  {errors.notificationEmail && (
                    <p
                      id="bug-email-error"
                      className="text-xs text-red-500 mt-0.5"
                    >
                      {errors.notificationEmail}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Erro de envio */}
            {errors.submit && (
              <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                {errors.submit}
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-white/10 mt-1">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                id="bug-report-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-full text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-all shadow-sm hover:shadow-emerald-500/25 active:scale-95"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  "Enviar Relatório"
                )}
              </button>
            </div>
          </form>
        ) : (
          /* ── Success step ── */
          <div className="flex flex-col items-center gap-5 px-8 py-10 text-center animate-in fade-in duration-300">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <svg
                className="w-8 h-8 text-emerald-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Obrigado pelo reporte!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
              Nossa equipe de desenvolvedores tomará as providências necessárias
              para analisar e resolver o problema o mais breve possível.
              {wantsNotification && notificationEmail && (
                <>
                  {" "}
                  Você receberá uma notificação em{" "}
                  <strong className="text-gray-800 dark:text-gray-200">
                    {notificationEmail}
                  </strong>{" "}
                  quando for resolvido.
                </>
              )}
            </p>
            <button
              id="bug-report-done-btn"
              type="button"
              onClick={handleClose}
              className="px-8 py-2.5 rounded-full text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BugReportDialog;
