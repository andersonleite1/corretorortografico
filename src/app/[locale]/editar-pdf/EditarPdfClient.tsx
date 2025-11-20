"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PdfEditorContent } from "@/data/pages/pdfEditor";
import { convertPdfToHtml } from "@/services/pdfToHtmlService";
import { savePost } from "@/services/post";

const MAX_FILE_SIZE_MB = 15;
const PRIMARY_COLOR = "#3E9971";
const SUBMISSION_COOLDOWN_MS = 3 * 60 * 1000;
const STORAGE_KEY_NEXT_UPLOAD = "pdfUploadNextTime";

const formatMillisecondsToClock = (ms: number) => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const replacePlaceholders = (template: string, replacements: Record<string, string | number>) =>
  template.replace(/\{\{(\w+)\}\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(replacements, key) ? String(replacements[key]) : match
  );

type EditarPdfClientProps = {
  content: PdfEditorContent;
  homeHref: string;
};

export default function EditarPdfClient({ content, homeHref }: EditarPdfClientProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [nextUploadTime, setNextUploadTime] = useState<number | null>(null);
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState(0);

  const readableFileSize = useMemo(() => {
    if (!selectedFile) return null;
    if (selectedFile.size < 1024) return `${selectedFile.size} B`;
    if (selectedFile.size < 1024 * 1024) return `${(selectedFile.size / 1024).toFixed(1)} KB`;
    return `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
  }, [selectedFile]);

  const cooldownLabel = useMemo(() => {
    if (cooldownRemainingMs <= 0) return null;
    return formatMillisecondsToClock(cooldownRemainingMs);
  }, [cooldownRemainingMs]);

  const isCooldownActive = cooldownRemainingMs > 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedNextTime = window.localStorage.getItem(STORAGE_KEY_NEXT_UPLOAD);
    if (!storedNextTime) return;

    const parsedTime = parseInt(storedNextTime, 10);
    if (Number.isNaN(parsedTime)) {
      window.localStorage.removeItem(STORAGE_KEY_NEXT_UPLOAD);
      return;
    }

    if (parsedTime <= Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY_NEXT_UPLOAD);
      return;
    }

    setNextUploadTime(parsedTime);
  }, []);

  useEffect(() => {
    if (!nextUploadTime) {
      setCooldownRemainingMs(0);
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.max(nextUploadTime - Date.now(), 0);
      setCooldownRemainingMs(remaining);
      if (remaining === 0) {
        setNextUploadTime(null);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(STORAGE_KEY_NEXT_UPLOAD);
        }
      }
    };

    updateRemaining();
    const intervalId = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(intervalId);
  }, [nextUploadTime]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setError(null);
    setStatusMessage(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError(content.formPanel.errors.invalidType);
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    const fileSizeInMb = file.size / (1024 * 1024);
    if (fileSizeInMb > MAX_FILE_SIZE_MB) {
      setError(replacePlaceholders(content.formPanel.errors.sizeLimit, { size: MAX_FILE_SIZE_MB }));
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError(content.formPanel.errors.noFile);
      return;
    }

    if (nextUploadTime && nextUploadTime > Date.now()) {
      const remaining = Math.max(nextUploadTime - Date.now(), 0);
      setError(replacePlaceholders(content.formPanel.errors.cooldown, { time: formatMillisecondsToClock(remaining) }));
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStatusMessage(content.formPanel.statusMessages.uploading);

    try {
      const htmlContent = await convertPdfToHtml(selectedFile);
      const derivedTitle = selectedFile.name.replace(/\.pdf$/i, "") || content.defaultDocumentTitle;

      savePost({
        title: derivedTitle,
        content: htmlContent,
      });

      setStatusMessage(content.formPanel.statusMessages.success);
      const unlockAt = Date.now() + SUBMISSION_COOLDOWN_MS;
      setNextUploadTime(unlockAt);
      setCooldownRemainingMs(SUBMISSION_COOLDOWN_MS);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY_NEXT_UPLOAD, unlockAt.toString());
      }
      setTimeout(() => {
        router.push(homeHref);
      }, 600);
    } catch (conversionError) {
      const message =
        conversionError instanceof Error
          ? conversionError.message
          : content.formPanel.errors.conversion;
      setError(message);
      setStatusMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setError(null);
    setStatusMessage(null);
  };

  const dropDescription = replacePlaceholders(content.formPanel.dropDescription, { size: MAX_FILE_SIZE_MB });

  return (
    <div className="bg-white text-slate-900">
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: PRIMARY_COLOR }}>
                {content.hero.eyebrow}
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">{content.hero.title}</h1>
              <p className="text-lg text-slate-600">{content.hero.description}</p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-600">
              {content.experienceHighlights.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm"
                  style={{ borderColor: "#dbe9e2" }}
                >
                  {feature}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-6 text-sm text-slate-600 sm:grid-cols-3">
              {content.steps.map((step) => (
                <div key={step.label}>
                  <span className="text-xs uppercase tracking-[0.25em] text-slate-500">{step.label}</span>
                  <p className="mt-2 text-base font-semibold text-slate-900">{step.title}</p>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-100">
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500">{content.formPanel.eyebrow}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{content.formPanel.title}</p>
            </div>

            <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="pdf-upload"
                  className="block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  <span className="text-base font-semibold text-slate-900">{content.formPanel.dropLabel}</span>
                  <p className="mt-2 text-sm text-slate-500">{dropDescription}</p>
                  {selectedFile && (
                    <div className="mt-6 rounded-2xl bg-slate-50 px-6 py-4 text-left">
                      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                        {content.formPanel.readyLabel}
                      </p>
                      <p className="mt-2 truncate text-lg font-medium text-slate-900">{selectedFile.name}</p>
                      <p className="text-sm text-slate-500">{readableFileSize}</p>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="mt-4 text-sm font-semibold"
                        style={{ color: PRIMARY_COLOR }}
                      >
                        {content.formPanel.replaceFileLabel}
                      </button>
                    </div>
                  )}
                </label>
              </div>

              <div className="space-y-4 text-sm">
                {error && (
                  <p className="font-medium text-rose-600" role="alert">
                    {error}
                  </p>
                )}
                {statusMessage && (
                  <p className="text-emerald-600" aria-live="polite">
                    {statusMessage}
                  </p>
                )}
                {isCooldownActive && cooldownLabel && (
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-700">
                    <span>{content.formPanel.cooldownLabel}</span>
                    <span className="text-lg font-semibold" style={{ color: PRIMARY_COLOR }}>
                      {cooldownLabel}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedFile || isCooldownActive}
                  className="inline-flex flex-1 items-center justify-center rounded-2xl px-6 py-4 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  {isSubmitting ? content.formPanel.buttons.submitting : content.formPanel.buttons.submit}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(homeHref)}
                  className="rounded-2xl border border-slate-200 px-6 py-4 text-base font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                >
                  {content.formPanel.buttons.back}
                </button>
              </div>
            </form>
          </section>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-[#F6F9F7] px-4 py-16">
        <div className="mx-auto max-w-5xl space-y-8 text-slate-700">
          <div className="space-y-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: PRIMARY_COLOR }}>
              {content.secondarySection.eyebrow}
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">{content.secondarySection.title}</h2>
            <p className="text-lg text-slate-600">{content.secondarySection.description}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {content.usageTopics.map((topic) => (
              <article key={topic.title} className="rounded-3xl border border-[#dbe9e2] bg-white/80 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900">{topic.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{topic.content}</p>
              </article>
            ))}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <h3 className="text-2xl font-semibold text-slate-900">{content.bestPractices.title}</h3>
            <ul className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              {content.bestPractices.items.map((item) => (
                <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-base text-slate-600">{content.bestPractices.description}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
